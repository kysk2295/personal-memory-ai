import type { ImportPreview } from './importPreview';
import type { ApplyImportPreviewResult, UndoAppliedMemoryRecordsResult } from './memoryIngestion';

export type ImportBatchPhase = 'preview' | 'applied' | 'undone';

export interface ImportBatchState {
  batchId: string;
  createdAt: string;
  phase: ImportBatchPhase;
  totalPreviewRecords: number;
  importablePreviewRecordIds: string[];
  defaultSkippedPreviewRecordIds: string[];
  appliedMemoryRecordIds: string[];
  skippedPreviewRecordIds: string[];
  graphEvidenceMemoryIds: string[];
  deletedMemoryRecordIds: string[];
  undoEnabled: boolean;
  undoReason?: string;
}

export function createImportBatchState(preview: ImportPreview): ImportBatchState {
  const importablePreviewRecordIds: string[] = [];
  const defaultSkippedPreviewRecordIds: string[] = [];

  for (const record of preview.records) {
    if (record.applyAction.enabled && record.duplicate.state !== 'duplicate') {
      importablePreviewRecordIds.push(record.id);
    } else {
      defaultSkippedPreviewRecordIds.push(record.id);
    }
  }

  return {
    batchId: preview.batchId,
    createdAt: preview.createdAt,
    phase: 'preview',
    totalPreviewRecords: preview.records.length,
    importablePreviewRecordIds,
    defaultSkippedPreviewRecordIds,
    appliedMemoryRecordIds: [],
    skippedPreviewRecordIds: [],
    graphEvidenceMemoryIds: [],
    deletedMemoryRecordIds: [],
    undoEnabled: false,
  };
}

export function markImportBatchApplied(
  state: ImportBatchState,
  result: ApplyImportPreviewResult,
): ImportBatchState {
  return {
    ...state,
    phase: 'applied',
    appliedMemoryRecordIds: [...result.createdMemoryIds],
    skippedPreviewRecordIds: [...result.skippedPreviewRecordIds],
    graphEvidenceMemoryIds: result.graphEvidenceRecords.map((record) => record.id),
    deletedMemoryRecordIds: [],
    undoEnabled: result.undoAction.enabled,
    undoReason: result.undoAction.reason,
  };
}

export function markImportBatchUndone(
  state: ImportBatchState,
  result: UndoAppliedMemoryRecordsResult,
): ImportBatchState {
  return {
    ...state,
    phase: 'undone',
    graphEvidenceMemoryIds: [],
    deletedMemoryRecordIds: [...result.appliedMemoryRecordIds],
    undoEnabled: false,
    undoReason: `Deleted ${result.deletedCount} applied memory records`,
  };
}
