import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import {
  IMPORT_PREVIEW_CONTRACT,
  buildImportPreview,
  createImportPreviewUndoAction,
} from './importPreview';

describe('buildImportPreview', () => {
  test('summarizes import candidates by source, date, duplicate state, and status label', () => {
    const preview = buildImportPreview({
      batchId: 'batch-p0-imports',
      createdAt: '2026-05-26T09:00:00.000Z',
      existingRecords: personalMemoryRecords,
      candidates: [
        {
          sourceType: 'notion',
          sourceRef: 'notion://launch-journal/may',
          observedAt: '2026-05-01',
          rawText:
            '기억 가져오기 데모를 내보내기 전 불안해서 그래프 필터와 추가 다듬기를 붙였다. 결국 출시가 이틀 늦어졌다.',
          provenance: {
            importer: 'notion',
            sourceName: 'Launch Journal',
            sourceUrl: 'https://notion.so/example-launch-journal',
          },
        },
        {
          sourceType: 'obsidian',
          sourceRef: 'obsidian://daily/2026-05-26',
          observedAt: '2026-05-26',
          rawText: 'Review import preview before adding graph polish.',
          provenance: {
            importer: 'obsidian',
            sourceName: 'daily/2026-05-26.md',
            sourcePath: 'daily/2026-05-26.md',
          },
        },
        {
          sourceType: 'markdown',
          sourceRef: 'markdown://exports/week-21.md#review',
          observedAt: '2026-05-26T11:30:00+09:00',
          rawText: 'Decision Replay should cite imported Markdown memories before giving advice.',
          status: 'partial',
          provenance: {
            importer: 'markdown',
            sourceName: 'week-21.md',
            sourcePath: 'exports/week-21.md',
          },
        },
      ],
    });

    expect(preview.contract).toEqual(IMPORT_PREVIEW_CONTRACT);
    expect(preview.requiresLiveOAuth).toBe(false);
    expect(preview.records).toHaveLength(3);
    expect(preview.records.map((record) => record.statusLabel)).toEqual([
      'implemented',
      'implemented',
      'partial',
    ]);
    expect(preview.records[0].duplicate).toEqual({
      state: 'duplicate',
      existingRecordIds: ['mem_launch_may_anxiety_scope_delay'],
    });
    expect(preview.records[1].duplicate.state).toBe('new');
    expect(preview.records[1].provenance).toEqual({
      importer: 'obsidian',
      sourceType: 'obsidian',
      sourceRef: 'obsidian://daily/2026-05-26',
      sourceName: 'daily/2026-05-26.md',
      sourcePath: 'daily/2026-05-26.md',
      capturedAt: '2026-05-26T09:00:00.000Z',
      liveOAuthRequired: false,
    });

    expect(preview.summary.bySource).toEqual([
      { sourceType: 'markdown', count: 1, duplicates: 0, statuses: { partial: 1 } },
      { sourceType: 'notion', count: 1, duplicates: 1, statuses: { implemented: 1 } },
      { sourceType: 'obsidian', count: 1, duplicates: 0, statuses: { implemented: 1 } },
    ]);
    expect(preview.summary.byDate).toEqual([
      { date: '2026-05-01', count: 1, duplicates: 1, statuses: { implemented: 1 } },
      { date: '2026-05-26', count: 2, duplicates: 0, statuses: { implemented: 1, partial: 1 } },
    ]);
    expect(preview.summary.duplicates).toEqual({ duplicate: 1, new: 2, possible: 0 });
    expect(preview.summary.byStatus).toEqual({ implemented: 2, partial: 1 });
  });

  test('creates apply actions for importable records and undo actions for applied records without OAuth', () => {
    const preview = buildImportPreview({
      batchId: 'batch-actions',
      createdAt: '2026-05-26T09:10:00.000Z',
      candidates: [
        {
          sourceType: 'markdown',
          sourceRef: 'markdown://decision.md',
          observedAt: '2026-05-26',
          rawText: 'Ask My Past Self must cite memories from Markdown imports.',
        },
      ],
    });

    const [record] = preview.records;
    const memoryRecord = record.memoryRecord;
    if (!memoryRecord) throw new Error('Expected importable preview record to include a MemoryRecord');

    expect(preview.requiresLiveOAuth).toBe(false);
    expect(record.applyAction).toEqual({
      type: 'apply_import_record',
      batchId: 'batch-actions',
      previewRecordId: record.id,
      memoryRecordId: memoryRecord.id,
      enabled: true,
      label: 'Apply import',
    });
    expect(createImportPreviewUndoAction(preview, [memoryRecord.id])).toEqual({
      type: 'undo_import_batch',
      batchId: 'batch-actions',
      appliedMemoryRecordIds: [memoryRecord.id],
      enabled: true,
      label: 'Undo import',
    });
  });

  test('marks empty candidates as blocked skeleton rows with status labels', () => {
    const preview = buildImportPreview({
      batchId: 'batch-blocked',
      createdAt: '2026-05-26T09:20:00.000Z',
      candidates: [
        {
          sourceType: 'notion',
          sourceRef: 'notion://empty-page',
          rawText: '   ',
          status: 'skeleton',
          provenance: {
            importer: 'notion',
            sourceName: 'Empty Page',
          },
        },
      ],
    });

    expect(preview.records[0].statusLabel).toBe('blocked');
    expect(preview.records[0].memoryRecord).toBeUndefined();
    expect(preview.records[0].applyAction).toEqual({
      type: 'apply_import_record',
      batchId: 'batch-blocked',
      previewRecordId: preview.records[0].id,
      enabled: false,
      label: 'Apply import',
      reason: 'MemoryRecord rawText is empty',
    });
    expect(preview.summary.byStatus).toEqual({ blocked: 1 });
  });
});
