import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildMemoryReviewLedgerEntry, buildMemoryReviewLedgerRecord } from './memoryReviewLedger';
import { buildMemoryProvenanceExport } from './memoryProvenanceExport';

describe('buildMemoryProvenanceExport', () => {
  test('exports one memory with source provenance, review history, and related context', () => {
    const edited = {
      ...personalMemoryRecords[2],
      summary: 'Edited source-backed freeze decision.',
    };
    const review = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before: personalMemoryRecords[2],
      after: edited,
      reviewedAt: '2026-05-28T07:00:00.000Z',
    });

    const exported = buildMemoryProvenanceExport({
      records: [
        personalMemoryRecords[0],
        personalMemoryRecords[1],
        personalMemoryRecords[2],
        buildMemoryReviewLedgerRecord(review),
      ],
      memoryId: 'mem_freeze_vs_feature_addition',
      exportedAt: '2026-05-28T07:05:00.000Z',
    });

    expect(exported).not.toBeNull();
    if (!exported) throw new Error('expected provenance export');

    expect(exported).toEqual({
      exportType: 'memory_provenance',
      exportedAt: '2026-05-28T07:05:00.000Z',
      filename: 'memory-provenance-mem_freeze_vs_feature_addition-2026-05-28.json',
      memory: expect.objectContaining({
        id: 'mem_freeze_vs_feature_addition',
        sourceType: 'markdown',
        sourceRef: 'markdown://retros/freezing-vs-features.md',
        observedAt: '2026-05-20',
        summary: '불안하면 멈추거나 기능을 더 넣는 선택으로 빠지고 출시가 밀린다.',
        rawText: expect.stringContaining('불안이 커지면'),
        emotionTags: ['anxiety', 'avoidance'],
        topicTags: ['freeze', 'feature addition', 'launch delay'],
        projectTags: ['personal-memory-ai'],
        privacyScope: 'private',
      }),
      reviewHistory: [review],
      relatedMemoryIds: ['mem_launch_june_anxiety_scope_delay', 'mem_launch_may_anxiety_scope_delay'],
      evidence: {
        citationMemoryIds: ['mem_freeze_vs_feature_addition'],
        sourceRefs: ['markdown://retros/freezing-vs-features.md'],
        reviewRevisionIds: [review.id],
      },
    });
    expect(exported.relatedMemoryIds).not.toContain(review.id);
  });

  test('returns null when the selected memory is missing', () => {
    expect(
      buildMemoryProvenanceExport({
        records: personalMemoryRecords,
        memoryId: 'mem_missing_export',
        exportedAt: '2026-05-28T07:05:00.000Z',
      }),
    ).toBeNull();
  });
});
