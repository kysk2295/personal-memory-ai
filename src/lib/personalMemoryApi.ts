import type { CurrentDecision } from './decisionReplay';
import type { FastDiaryCaptureFlatInput } from './fastDiaryCapture';
import { buildImportPreview, type ImportPreview, type ImportPreviewCandidate } from './importPreview';
import {
  applyImportPreviewToMemoryStore,
  ingestFastDiaryCaptureToMemoryStore,
} from './memoryIngestion';
import type { MemoryStore } from './memoryStore';
import { answerPersonalMemoryQuestion } from './personalMemoryAgent';
import { generateWeeklyReport } from './weeklyReport';

export type PersonalMemoryApiMethod = 'GET' | 'POST';
export type PersonalMemoryApiPath =
  | '/api/capture'
  | '/api/import/preview'
  | '/api/import/apply'
  | '/api/ask'
  | '/api/replay'
  | '/api/report/weekly'
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

interface DeleteBody {
  memoryIds?: string[];
  hardDeleteUserData?: boolean;
}

function readBody<T>(body: unknown): T {
  return body as T;
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

  if (request.path === '/api/capture') {
    if (request.method !== 'POST') return methodNotAllowed();
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
