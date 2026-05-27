import type { CurrentDecision } from './decisionReplay';
import { buildAppShellEvidenceLayoutFromMemoryStore } from './appShellEvidenceLayout';
import type { FastDiaryCaptureFlatInput } from './fastDiaryCapture';
import { buildImportPreview, type ImportPreview, type ImportPreviewCandidate } from './importPreview';
import {
  applyImportPreviewToMemoryStore,
  ingestFastDiaryCaptureToMemoryStore,
} from './memoryIngestion';
import { buildMemoryGraphModel } from './memoryGraphModel';
import type { MemoryStore } from './memoryStore';
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
  | '/api/import/preview'
  | '/api/import/apply'
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
}

export interface HandlePrivateVaultMemoryApiRequestInput {
  store: MemoryStore;
  session: PrivateVaultSession;
  request: PersonalMemoryApiRequest;
  requestedUserId?: string;
}

export interface PersonalMemoryApiResponse<Body = unknown> {
  statusCode: number;
  body: Body;
}

interface ImportPreviewBody {
  batchId: string;
  createdAt?: string;
  candidates: ImportPreviewCandidate[];
}

interface ImportApplyBody {
  preview: ImportPreview;
  includeDuplicateRecords?: boolean;
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
        appShell,
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
    const result = await ingestFastDiaryCaptureToMemoryStore({
      store,
      userId,
      input: readBody<FastDiaryCaptureFlatInput>(request.body),
    });
    return { statusCode: 201, body: result };
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
  });
}
