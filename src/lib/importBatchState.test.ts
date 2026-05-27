import { describe, expect, test } from 'vitest';
import {
  createImportBatchState,
  markImportBatchApplied,
  markImportBatchUndone,
} from './importBatchState';
import { buildImportPreview } from './importPreview';
import { normalizeMemoryRecord } from './memoryRecord';

const memoryRecord = normalizeMemoryRecord({
  id: 'mem_import_state_new',
  sourceType: 'markdown',
  sourceRef: 'markdown://daily/2026-05-27.md',
  importBatchId: 'batch-state',
  createdAt: '2026-05-27T10:00:00.000Z',
  observedAt: '2026-05-27',
  rawText: 'I chose to finish import before adding agent polish.',
  summary: 'Finish import before adding agent polish.',
  memoryType: 'decision',
  decisionSignal: 'chosen',
  projectTags: ['personal-memory-ai'],
});

function buildPreview() {
  return buildImportPreview({
    batchId: 'batch-state',
    createdAt: '2026-05-27T10:00:00.000Z',
    candidates: [
      {
        sourceType: 'markdown',
        sourceRef: 'markdown://daily/2026-05-27.md',
        observedAt: '2026-05-27',
        rawText: memoryRecord.rawText,
        summary: memoryRecord.summary,
        memoryType: 'decision',
        decisionSignal: 'chosen',
        projectTags: ['personal-memory-ai'],
      },
    ],
  });
}

describe('import batch state model', () => {
  test('creates pending state from import preview summary', () => {
    const preview = buildPreview();

    expect(createImportBatchState(preview)).toMatchObject({
      batchId: 'batch-state',
      phase: 'preview',
      totalPreviewRecords: 1,
      importablePreviewRecordIds: ['import_preview_batch-state_1'],
      appliedMemoryRecordIds: [],
      skippedPreviewRecordIds: [],
      graphEvidenceMemoryIds: [],
      deletedMemoryRecordIds: [],
      undoEnabled: false,
    });
  });

  test('marks applied state with created, skipped, and graph-visible records', () => {
    const preview = buildPreview();
    const state = createImportBatchState(preview);

    const appliedState = markImportBatchApplied(state, {
      createdMemoryIds: [memoryRecord.id],
      skippedPreviewRecordIds: ['import_preview_batch-state_2'],
      graphEvidenceRecords: [memoryRecord],
      undoAction: {
        type: 'undo_import_batch',
        batchId: 'batch-state',
        appliedMemoryRecordIds: [memoryRecord.id],
        enabled: true,
        label: 'Undo import',
      },
    });

    expect(appliedState.phase).toBe('applied');
    expect(appliedState.appliedMemoryRecordIds).toEqual([memoryRecord.id]);
    expect(appliedState.skippedPreviewRecordIds).toEqual(['import_preview_batch-state_2']);
    expect(appliedState.graphEvidenceMemoryIds).toEqual([memoryRecord.id]);
    expect(appliedState.undoEnabled).toBe(true);
  });

  test('marks undone state and disables undo after deleting applied ids', () => {
    const preview = buildPreview();
    const appliedState = markImportBatchApplied(createImportBatchState(preview), {
      createdMemoryIds: [memoryRecord.id],
      skippedPreviewRecordIds: [],
      graphEvidenceRecords: [memoryRecord],
      undoAction: {
        type: 'undo_import_batch',
        batchId: 'batch-state',
        appliedMemoryRecordIds: [memoryRecord.id],
        enabled: true,
        label: 'Undo import',
      },
    });

    const undoneState = markImportBatchUndone(appliedState, {
      deletedCount: 1,
      appliedMemoryRecordIds: [memoryRecord.id],
    });

    expect(undoneState.phase).toBe('undone');
    expect(undoneState.undoEnabled).toBe(false);
    expect(undoneState.deletedMemoryRecordIds).toEqual([memoryRecord.id]);
    expect(undoneState.graphEvidenceMemoryIds).toEqual([]);
  });
});
