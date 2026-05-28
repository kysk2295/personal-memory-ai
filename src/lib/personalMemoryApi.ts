import type { CurrentDecision } from './decisionReplay';
import { buildAppShellEvidenceLayoutFromMemoryStore } from './appShellEvidenceLayout';
import type { FastDiaryCaptureFlatInput } from './fastDiaryCapture';
import { buildImportPreview, type ImportPreview, type ImportPreviewCandidate } from './importPreview';
import {
  applyImportPreviewToMemoryStore,
  ingestFastDiaryCaptureToMemoryStore,
  undoAppliedMemoryRecords,
} from './memoryIngestion';
import { buildMemoryGraphModel } from './memoryGraphModel';
import {
  buildMemoryReviewLedgerEntry,
  buildMemoryReviewLedgerRecord,
  listMemoryReviewLedgerEntries,
} from './memoryReviewLedger';
import { buildMemoryProvenanceExport } from './memoryProvenanceExport';
import { summarizeRawText } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import { queryNotionDatabaseImportCandidates, queryNotionImportSources, type NotionFetch } from './notionImport';
import { answerPersonalMemoryQuestion } from './personalMemoryAgent';
import { resolvePrivateVaultAccess, type PrivateVaultSession } from './privateVault';
import { saveArtifactAsMemoryRecord, type SavedMemoryArtifact } from './savedMemoryArtifact';
import { saveUserFeedbackMemory, type UserFeedbackMemoryInput } from './userFeedbackMemory';
import { generateWeeklyReport } from './weeklyReport';
import {
  createDefaultWeeklyReportSchedule,
  evaluateWeeklyReportSchedule,
  type WeeklyReportSchedule,
} from './weeklyReportSchedule';

export type PersonalMemoryApiMethod = 'GET' | 'POST';
export type PersonalMemoryApiPath =
  | '/api/app-shell'
  | '/api/capture'
  | '/api/memory/detail'
  | '/api/memory/provenance-download'
  | '/api/memory/provenance-export'
  | '/api/memory/review-history'
  | '/api/memory/update'
  | '/api/import/preview'
  | '/api/import/notion/preview'
  | '/api/import/notion/sources'
  | '/api/import/apply'
  | '/api/import/undo'
  | '/api/ask'
  | '/api/replay'
  | '/api/report/weekly'
  | '/api/report/weekly/schedule/evaluate'
  | '/api/feedback'
  | '/api/export'
  | '/api/delete';

export interface PersonalMemoryApiRequest {
  method: PersonalMemoryApiMethod;
  path: PersonalMemoryApiPath | string;
  body?: unknown;
}

export interface HandlePersonalMemoryApiRequestInput {
  store: MemoryStore;
  userId: string;
  request: PersonalMemoryApiRequest;
  notionToken?: string;
  notionFetch?: NotionFetch;
}

export interface HandlePrivateVaultMemoryApiRequestInput {
  store: MemoryStore;
  session: PrivateVaultSession;
  request: PersonalMemoryApiRequest;
  requestedUserId?: string;
  notionToken?: string;
  notionFetch?: NotionFetch;
}

export interface PersonalMemoryApiResponse<Body = unknown> {
  statusCode: number;
  headers?: Record<string, string>;
  body: Body;
}

interface ImportPreviewBody {
  batchId: string;
  createdAt?: string;
  candidates: ImportPreviewCandidate[];
}

interface NotionImportPreviewBody {
  databaseId?: string;
  createdAt?: string;
  pageSize?: number;
}

interface ImportApplyBody {
  preview: ImportPreview;
  includeDuplicateRecords?: boolean;
}

interface ImportUndoBody {
  appliedMemoryRecordIds?: string[];
}

interface MemoryDetailBody {
  memoryId?: string;
}

interface MemoryProvenanceExportBody {
  memoryId?: string;
  exportedAt?: string;
}

interface MemoryUpdateBody {
  memoryId?: string;
  summary?: string;
  rawText?: string;
  observedAt?: string;
  emotionTags?: string[];
  topicTags?: string[];
  projectTags?: string[];
  peopleTags?: string[];
}

interface AskBody {
  question: string;
  queryId?: string;
  createdAt?: string;
  currentDecision?: CurrentDecision;
}

interface ReplayBody {
  question?: string;
  queryId?: string;
  createdAt?: string;
  currentDecision: CurrentDecision;
}

interface WeeklyReportBody {
  startDate: string;
  endDate: string;
  generatedAt?: string;
}

interface WeeklyReportScheduleEvaluateBody {
  nowLocalDateTime: string;
  lastGeneratedReportId?: string;
  schedule?: Partial<WeeklyReportSchedule>;
}

interface DeleteBody {
  memoryIds?: string[];
  hardDeleteUserData?: boolean;
}

interface SavedArtifactCaptureBody {
  artifact: SavedMemoryArtifact;
}

function readBody<T>(body: unknown): T {
  return body as T;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isSavedArtifactCaptureBody(body: unknown): body is SavedArtifactCaptureBody {
  if (!isRecord(body) || !isRecord(body.artifact)) return false;
  return (
    typeof body.artifact.id === 'string' &&
    typeof body.artifact.kind === 'string' &&
    typeof body.artifact.title === 'string' &&
    typeof body.artifact.body === 'string'
  );
}

function isFastDiaryCaptureFlatBody(body: unknown): body is FastDiaryCaptureFlatInput {
  return isRecord(body) && typeof body.text === 'string' && Boolean(body.text.trim());
}

function sanitizeOptionalText(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
}

function sanitizeOptionalStringList(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean);
}

function notionConnectorErrorResponse(error: unknown, fallbackError: string): PersonalMemoryApiResponse<{ error: string }> {
  const message = String(error);
  if (message.includes(':429')) {
    return { statusCode: 429, body: { error: 'notion_rate_limited' } };
  }
  return { statusCode: 502, body: { error: fallbackError } };
}

function lightweightAppShellRecords<T extends { records: Array<{ rawText: string }> }>(appShell: T): T {
  return {
    ...appShell,
    records: appShell.records.map((record) => ({
      ...record,
      rawText: summarizeRawText(record.rawText, 240),
    })),
  };
}

function methodNotAllowed(): PersonalMemoryApiResponse<{ error: string }> {
  return {
    statusCode: 405,
    body: { error: 'method_not_allowed' },
  };
}

export async function handlePersonalMemoryApiRequest(
  input: HandlePersonalMemoryApiRequestInput,
): Promise<PersonalMemoryApiResponse> {
  const { store, userId, request } = input;

  if (request.path === '/api/app-shell') {
    if (request.method !== 'GET') return methodNotAllowed();
    const appShell = await buildAppShellEvidenceLayoutFromMemoryStore({ store, userId });
    return {
      statusCode: 200,
      body: {
        appShell: lightweightAppShellRecords(appShell),
        memoryGraph: buildMemoryGraphModel(appShell.records),
      },
    };
  }

  if (request.path === '/api/capture') {
    if (request.method !== 'POST') return methodNotAllowed();
    if (isSavedArtifactCaptureBody(request.body)) {
      const record = await saveArtifactAsMemoryRecord({
        store,
        userId,
        artifact: request.body.artifact,
      });
      return { statusCode: 201, body: { createdMemoryIds: [record.id], record } };
    }
    if (!isFastDiaryCaptureFlatBody(request.body)) {
      return { statusCode: 400, body: { error: 'capture_text_required' } };
    }
    const result = await ingestFastDiaryCaptureToMemoryStore({
      store,
      userId,
      input: request.body,
    });
    return { statusCode: 201, body: result };
  }

  if (request.path === '/api/memory/detail') {
    if (request.method !== 'GET') return methodNotAllowed();
    const body = readBody<MemoryDetailBody>(request.body);
    const memoryId = sanitizeOptionalText(body?.memoryId);
    const memory = memoryId ? await store.getById(userId, memoryId) : null;
    if (!memory) return { statusCode: 404, body: { error: 'memory_not_found' } };
    const reviewHistory = listMemoryReviewLedgerEntries(await store.listByUser(userId), memory.id);
    return { statusCode: 200, body: { memory, reviewHistory } };
  }

  if (request.path === '/api/memory/review-history') {
    if (request.method !== 'GET') return methodNotAllowed();
    const body = readBody<MemoryDetailBody>(request.body);
    const memoryId = sanitizeOptionalText(body?.memoryId);
    const memory = memoryId ? await store.getById(userId, memoryId) : null;
    if (!memory) return { statusCode: 404, body: { error: 'memory_not_found' } };
    const reviewHistory = listMemoryReviewLedgerEntries(await store.listByUser(userId), memory.id);
    return { statusCode: 200, body: { reviewHistory } };
  }

  if (request.path === '/api/memory/provenance-export') {
    if (request.method !== 'GET' && request.method !== 'POST') return methodNotAllowed();
    const body = readBody<MemoryProvenanceExportBody>(request.body);
    const memoryId = sanitizeOptionalText(body?.memoryId);
    const exportBundle = memoryId
      ? buildMemoryProvenanceExport({
          records: await store.listByUser(userId),
          memoryId,
          exportedAt: sanitizeOptionalText(body?.exportedAt),
        })
      : null;
    if (!exportBundle) return { statusCode: 404, body: { error: 'memory_not_found' } };
    return { statusCode: 200, body: { export: exportBundle } };
  }

  if (request.path === '/api/memory/provenance-download') {
    if (request.method !== 'GET' && request.method !== 'POST') return methodNotAllowed();
    const body = readBody<MemoryProvenanceExportBody>(request.body);
    const memoryId = sanitizeOptionalText(body?.memoryId);
    const exportBundle = memoryId
      ? buildMemoryProvenanceExport({
          records: await store.listByUser(userId),
          memoryId,
          exportedAt: sanitizeOptionalText(body?.exportedAt),
        })
      : null;
    if (!exportBundle) return { statusCode: 404, body: { error: 'memory_not_found' } };
    return {
      statusCode: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'content-disposition': `attachment; filename="${exportBundle.filename}"`,
      },
      body: exportBundle,
    };
  }

  if (request.path === '/api/memory/update') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<MemoryUpdateBody>(request.body);
    const memoryId = sanitizeOptionalText(body?.memoryId);
    const existing = memoryId ? await store.getById(userId, memoryId) : null;
    if (!existing) return { statusCode: 404, body: { error: 'memory_not_found' } };

    const updated = {
      ...existing,
      summary: sanitizeOptionalText(body.summary) ?? existing.summary,
      rawText: sanitizeOptionalText(body.rawText) ?? existing.rawText,
      observedAt: sanitizeOptionalText(body.observedAt) ?? existing.observedAt,
      emotionTags: sanitizeOptionalStringList(body.emotionTags) ?? existing.emotionTags,
      topicTags: sanitizeOptionalStringList(body.topicTags) ?? existing.topicTags,
      projectTags: sanitizeOptionalStringList(body.projectTags) ?? existing.projectTags,
      peopleTags: sanitizeOptionalStringList(body.peopleTags) ?? existing.peopleTags,
    };
    await store.update(userId, updated);
    const reviewLedgerEntry = buildMemoryReviewLedgerEntry({
      userId,
      before: existing,
      after: updated,
    });
    await store.create(userId, buildMemoryReviewLedgerRecord(reviewLedgerEntry));
    const reviewHistory = listMemoryReviewLedgerEntries(await store.listByUser(userId), updated.id);
    return { statusCode: 200, body: { memory: updated, reviewLedgerEntry, reviewHistory } };
  }

  if (request.path === '/api/import/preview') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<ImportPreviewBody>(request.body);
    const preview = buildImportPreview({
      batchId: body.batchId,
      createdAt: body.createdAt,
      existingRecords: await store.listByUser(userId),
      candidates: body.candidates,
    });
    return { statusCode: 200, body: { preview } };
  }

  if (request.path === '/api/import/notion/preview') {
    if (request.method !== 'POST') return methodNotAllowed();
    if (!input.notionToken) return { statusCode: 424, body: { error: 'notion_token_missing' } };
    const body = readBody<NotionImportPreviewBody>(request.body);
    const databaseId = sanitizeOptionalText(body?.databaseId);
    if (!databaseId) return { statusCode: 400, body: { error: 'notion_database_id_required' } };
    try {
      const candidates = await queryNotionDatabaseImportCandidates({
        databaseId,
        notionToken: input.notionToken,
        createdAt: sanitizeOptionalText(body.createdAt) ?? new Date().toISOString(),
        pageSize: typeof body.pageSize === 'number' ? body.pageSize : undefined,
        fetchNotion: input.notionFetch,
      });
      const preview = buildImportPreview({
        batchId: databaseId,
        createdAt: body.createdAt,
        existingRecords: await store.listByUser(userId),
        candidates,
      });
      return { statusCode: 200, body: { preview } };
    } catch (error) {
      return notionConnectorErrorResponse(error, 'notion_query_failed');
    }
  }

  if (request.path === '/api/import/notion/sources') {
    if (request.method !== 'GET' && request.method !== 'POST') return methodNotAllowed();
    if (!input.notionToken) return { statusCode: 424, body: { error: 'notion_token_missing' } };
    try {
      const sources = await queryNotionImportSources({
        notionToken: input.notionToken,
        fetchNotion: input.notionFetch,
      });
      return { statusCode: 200, body: { sources } };
    } catch (error) {
      return notionConnectorErrorResponse(error, 'notion_search_failed');
    }
  }

  if (request.path === '/api/import/apply') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<ImportApplyBody>(request.body);
    const result = await applyImportPreviewToMemoryStore({
      store,
      userId,
      preview: body.preview,
      includeDuplicateRecords: body.includeDuplicateRecords,
    });
    return { statusCode: 201, body: result };
  }

  if (request.path === '/api/import/undo') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<ImportUndoBody>(request.body);
    const result = await undoAppliedMemoryRecords({
      store,
      userId,
      appliedMemoryRecordIds: body.appliedMemoryRecordIds ?? [],
    });
    return { statusCode: 200, body: result };
  }

  if (request.path === '/api/ask') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<AskBody>(request.body);
    const result = await answerPersonalMemoryQuestion({
      store,
      userId,
      question: body.question,
      currentDecision: body.currentDecision,
      queryId: body.queryId,
      createdAt: body.createdAt,
    });
    return { statusCode: 200, body: result };
  }

  if (request.path === '/api/replay') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<ReplayBody>(request.body);
    const result = await answerPersonalMemoryQuestion({
      store,
      userId,
      question: body.question ?? body.currentDecision.prompt,
      currentDecision: body.currentDecision,
      queryId: body.queryId,
      createdAt: body.createdAt,
    });
    return { statusCode: 200, body: { replay: result.replay, graphEvidence: result.graphEvidence } };
  }

  if (request.path === '/api/report/weekly') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<WeeklyReportBody>(request.body);
    const weeklyReport = generateWeeklyReport({
      records: await store.listByUser(userId),
      startDate: body.startDate,
      endDate: body.endDate,
      generatedAt: body.generatedAt,
    });
    return { statusCode: 200, body: { weeklyReport } };
  }

  if (request.path === '/api/report/weekly/schedule/evaluate') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<WeeklyReportScheduleEvaluateBody>(request.body);
    const schedule = {
      ...createDefaultWeeklyReportSchedule({ userId }),
      ...body.schedule,
    };
    const evaluation = evaluateWeeklyReportSchedule({
      schedule,
      nowLocalDateTime: body.nowLocalDateTime,
      lastGeneratedReportId: body.lastGeneratedReportId,
    });
    if (!evaluation.due) return { statusCode: 200, body: { evaluation } };

    const weeklyReport = generateWeeklyReport({
      records: await store.listByUser(userId),
      startDate: evaluation.reportWindow.startDate,
      endDate: evaluation.reportWindow.endDate,
      generatedAt: `${body.nowLocalDateTime}.000`,
    });
    return { statusCode: 200, body: { evaluation, weeklyReport } };
  }

  if (request.path === '/api/feedback') {
    if (request.method !== 'POST') return methodNotAllowed();
    const result = await saveUserFeedbackMemory({
      store,
      userId,
      input: readBody<UserFeedbackMemoryInput>(request.body),
    });
    return { statusCode: 201, body: result };
  }

  if (request.path === '/api/export') {
    if (request.method !== 'GET') return methodNotAllowed();
    return { statusCode: 200, body: { records: await store.exportUserData(userId) } };
  }

  if (request.path === '/api/delete') {
    if (request.method !== 'POST') return methodNotAllowed();
    const body = readBody<DeleteBody>(request.body);
    const deletedCount = body.hardDeleteUserData
      ? await store.hardDeleteUserData(userId)
      : await store.deleteByIds(userId, body.memoryIds ?? []);
    return { statusCode: 200, body: { deletedCount } };
  }

  return {
    statusCode: 404,
    body: { error: 'not_found' },
  };
}

export async function handlePrivateVaultMemoryApiRequest(
  input: HandlePrivateVaultMemoryApiRequestInput,
): Promise<PersonalMemoryApiResponse> {
  const access = resolvePrivateVaultAccess({
    session: input.session,
    requestedUserId: input.requestedUserId,
  });

  if (!access.allowed) {
    return {
      statusCode: 403,
      body: {
        error: access.reason,
        vaultId: access.vaultId,
      },
    };
  }

  return handlePersonalMemoryApiRequest({
    store: input.store,
    userId: access.userId,
    request: input.request,
    notionToken: input.notionToken,
    notionFetch: input.notionFetch,
  });
}
