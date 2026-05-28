import { buildImportPreview } from './importPreview';
import { applyImportPreviewToMemoryStore } from './memoryIngestion';
import type { MemoryStore } from './memoryStore';
import { queryNotionDatabaseImportCandidates, type NotionFetch } from './notionImport';

export type NotionResumeImportStatus = 'completed' | 'completed_with_skips' | 'failed';

export interface ImportNotionSourcesToMemoryStoreInput {
  store: MemoryStore;
  userId: string;
  notionToken: string;
  sourceIds: readonly string[];
  createdAt: string;
  pageSize?: number;
  includeDuplicateRecords?: boolean;
  fetchNotion?: NotionFetch;
}

export interface NotionResumeImportReport {
  status: NotionResumeImportStatus;
  sourceCount: number;
  successfulSources: number;
  appliedSources: number;
  previewRecordCount: number;
  createdCount: number;
  skippedPreviewRecordCount: number;
  failureGroups: Record<string, number>;
}

function failureGroupForError(error: unknown): string {
  const message = String(error);
  if (message.includes(':429')) return '429:notion_rate_limited';
  const statusMatch = message.match(/:(\d{3})/);
  if (statusMatch?.[1]) return `${statusMatch[1]}:notion_import_failed`;
  return 'unknown:notion_import_failed';
}

function incrementFailureGroup(target: Record<string, number>, key: string): void {
  target[key] = (target[key] ?? 0) + 1;
}

export async function importNotionSourcesToMemoryStore(
  input: ImportNotionSourcesToMemoryStoreInput,
): Promise<NotionResumeImportReport> {
  const failureGroups: Record<string, number> = {};
  let successfulSources = 0;
  let appliedSources = 0;
  let previewRecordCount = 0;
  let createdCount = 0;
  let skippedPreviewRecordCount = 0;

  for (const sourceId of input.sourceIds) {
    try {
      const candidates = await queryNotionDatabaseImportCandidates({
        databaseId: sourceId,
        notionToken: input.notionToken,
        createdAt: input.createdAt,
        pageSize: input.pageSize,
        fetchNotion: input.fetchNotion,
      });
      successfulSources += 1;
      previewRecordCount += candidates.length;
      if (!candidates.length) continue;

      const existingRecords = await input.store.listByUser(input.userId);
      const preview = buildImportPreview({
        batchId: sourceId,
        createdAt: input.createdAt,
        existingRecords,
        candidates,
      });
      const applyResult = await applyImportPreviewToMemoryStore({
        store: input.store,
        userId: input.userId,
        preview,
        includeDuplicateRecords: input.includeDuplicateRecords,
      });
      if (applyResult.createdMemoryIds.length > 0) appliedSources += 1;
      createdCount += applyResult.createdMemoryIds.length;
      skippedPreviewRecordCount += applyResult.skippedPreviewRecordIds.length;
    } catch (error) {
      incrementFailureGroup(failureGroups, failureGroupForError(error));
    }
  }

  const failureCount = Object.values(failureGroups).reduce((sum, count) => sum + count, 0);
  return {
    status: failureCount ? (successfulSources || createdCount ? 'completed_with_skips' : 'failed') : 'completed',
    sourceCount: input.sourceIds.length,
    successfulSources,
    appliedSources,
    previewRecordCount,
    createdCount,
    skippedPreviewRecordCount,
    failureGroups,
  };
}
