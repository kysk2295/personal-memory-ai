import { describe, expect, test } from 'vitest';
import { createImportPreviewUndoAction, buildImportPreview } from './importPreview';
import {
  applyImportPreviewToMemoryStore,
  ingestFastDiaryCaptureToMemoryStore,
  undoAppliedMemoryRecords,
} from './memoryIngestion';
import { createMemoryStore } from './createMemoryStore';
import { normalizeMemoryRecord } from './memoryRecord';

const existingRecord = normalizeMemoryRecord({
  id: 'mem_existing_scope_delay',
  sourceType: 'notion',
  sourceRef: 'notion://launch-journal/may',
  createdAt: '2026-05-01T00:00:00.000Z',
  observedAt: '2026-05-01',
  rawText: 'Felt anxious, added graph filters, and launch slipped by two days.',
  summary: 'Existing duplicate launch memory.',
  memoryType: 'decision',
  emotionTags: ['anxiety'],
  topicTags: ['launch'],
  projectTags: ['personal-memory-ai'],
  decisionSignal: 'chosen',
  outcomeText: 'Launch slipped by two days.',
  embeddingStatus: 'pending',
  extractionStatus: 'manual',
});

describe('memory ingestion loop', () => {
  test('ingests fast diary capture into private user-scoped memory evidence', async () => {
    const store = createMemoryStore({ env: {} });

    const result = await ingestFastDiaryCaptureToMemoryStore({
      store,
      userId: 'user-a',
      input: {
        text: '오늘은 더 만들기보다 멈추고 리뷰를 받아야겠다고 느꼈다.',
        capturedAt: '2026-05-27T09:00:00.000Z',
        emotionHints: ['resolve'],
        decisionHint: 'chosen',
        projectHints: ['personal-memory-ai'],
        topicHints: ['scope freeze'],
      },
    });

    expect(result.createdMemoryIds).toEqual([result.record.id]);
    expect(result.record.privacyScope).toBe('private');
    expect(result.record.sourceType).toBe('mobile');
    expect(result.graphEvidenceRecords.map((record) => record.id)).toEqual([result.record.id]);
    expect((await store.listByUser('user-a')).map((record) => record.id)).toEqual([result.record.id]);
    expect(await store.listByUser('user-b')).toEqual([]);
  });

  test('applies import preview records, skips exact duplicates by default, and returns undo action', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', existingRecord);

    const preview = buildImportPreview({
      batchId: 'batch-001',
      createdAt: '2026-05-27T09:15:00.000Z',
      existingRecords: [existingRecord],
      candidates: [
        {
          sourceType: 'notion',
          sourceRef: existingRecord.sourceRef,
          observedAt: existingRecord.observedAt,
          rawText: existingRecord.rawText,
          summary: 'Duplicate candidate.',
          memoryType: 'decision',
        },
        {
          sourceType: 'markdown',
          sourceRef: 'markdown://daily/2026-05-27.md',
          observedAt: '2026-05-27',
          rawText: 'Decided to ship the capture/import loop before building more UI.',
          summary: 'Ship capture import loop before more UI.',
          memoryType: 'decision',
          decisionSignal: 'chosen',
          emotionTags: ['resolve'],
          projectTags: ['personal-memory-ai'],
        },
      ],
    });

    const result = await applyImportPreviewToMemoryStore({
      store,
      userId: 'user-a',
      preview,
    });

    expect(result.skippedPreviewRecordIds).toEqual(['import_preview_batch-001_1']);
    expect(result.createdMemoryIds).toHaveLength(1);
    expect(result.undoAction).toEqual(createImportPreviewUndoAction(preview, result.createdMemoryIds));
    expect(result.graphEvidenceRecords.map((record) => record.id)).toEqual(result.createdMemoryIds);
    expect((await store.listByUser('user-a')).map((record) => record.id).sort()).toEqual(
      [existingRecord.id, ...result.createdMemoryIds].sort(),
    );
  });

  test('undo removes only applied ids for the specified user', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', { ...existingRecord, id: 'mem_shared_id' });
    await store.create('user-b', { ...existingRecord, id: 'mem_shared_id' });

    const result = await undoAppliedMemoryRecords({
      store,
      userId: 'user-a',
      appliedMemoryRecordIds: ['mem_shared_id'],
    });

    expect(result.deletedCount).toBe(1);
    expect(await store.listByUser('user-a')).toEqual([]);
    expect((await store.listByUser('user-b')).map((record) => record.id)).toEqual(['mem_shared_id']);
  });
});
