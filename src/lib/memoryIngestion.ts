import { captureFastDiaryMemory, type FastDiaryCaptureFlatInput } from './fastDiaryCapture';
import { createImportPreviewUndoAction, type ImportPreview, type ImportPreviewUndoAction } from './importPreview';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';

export interface IngestFastDiaryCaptureInput {
  store: MemoryStore;
  userId: string;
  input: FastDiaryCaptureFlatInput;
}

export interface IngestFastDiaryCaptureResult {
  record: MemoryRecord;
  createdMemoryIds: string[];
  graphEvidenceRecords: MemoryRecord[];
}

export interface ApplyImportPreviewInput {
  store: MemoryStore;
  userId: string;
  preview: ImportPreview;
  includeDuplicateRecords?: boolean;
}

export interface ApplyImportPreviewResult {
  createdMemoryIds: string[];
  skippedPreviewRecordIds: string[];
  graphEvidenceRecords: MemoryRecord[];
  undoAction: ImportPreviewUndoAction;
}

export interface UndoAppliedMemoryRecordsInput {
  store: MemoryStore;
  userId: string;
  appliedMemoryRecordIds: readonly string[];
}

export interface UndoAppliedMemoryRecordsResult {
  deletedCount: number;
  appliedMemoryRecordIds: string[];
}

export async function ingestFastDiaryCaptureToMemoryStore(
  input: IngestFastDiaryCaptureInput,
): Promise<IngestFastDiaryCaptureResult> {
  const record = captureFastDiaryMemory(input.input);
  await input.store.create(input.userId, record);
  const createdMemoryIds = [record.id];

  return {
    record,
    createdMemoryIds,
    graphEvidenceRecords: await input.store.graphEvidenceByMemoryIds(input.userId, createdMemoryIds),
  };
}

export async function applyImportPreviewToMemoryStore(
  input: ApplyImportPreviewInput,
): Promise<ApplyImportPreviewResult> {
  const createdMemoryIds: string[] = [];
  const skippedPreviewRecordIds: string[] = [];

  for (const previewRecord of input.preview.records) {
    const memoryRecord = previewRecord.memoryRecord;
    const shouldSkipDuplicate = previewRecord.duplicate.state === 'duplicate' && !input.includeDuplicateRecords;
    if (!memoryRecord || !previewRecord.applyAction.enabled || shouldSkipDuplicate) {
      skippedPreviewRecordIds.push(previewRecord.id);
      continue;
    }

    await input.store.create(input.userId, memoryRecord);
    createdMemoryIds.push(memoryRecord.id);
  }

  return {
    createdMemoryIds,
    skippedPreviewRecordIds,
    graphEvidenceRecords: await input.store.graphEvidenceByMemoryIds(input.userId, createdMemoryIds),
    undoAction: createImportPreviewUndoAction(input.preview, createdMemoryIds),
  };
}

export async function undoAppliedMemoryRecords(
  input: UndoAppliedMemoryRecordsInput,
): Promise<UndoAppliedMemoryRecordsResult> {
  const appliedMemoryRecordIds = [...input.appliedMemoryRecordIds];
  const deletedCount = await input.store.deleteByIds(input.userId, appliedMemoryRecordIds);

  return {
    deletedCount,
    appliedMemoryRecordIds,
  };
}
