import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildMemoryReviewLedgerEntry } from './memoryReviewLedger';

describe('buildMemoryReviewLedgerEntry', () => {
  test('records changed review fields without copying unrelated private memories', () => {
    const before = personalMemoryRecords[2];
    const after = {
      ...before,
      summary: 'Edited source-backed freeze decision.',
      rawText: 'Edited raw source text that keeps citation provenance.',
      topicTags: ['launch', 'review'],
    };

    const entry = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before,
      after,
      reviewedAt: '2026-05-28T05:00:00.000Z',
    });

    expect(entry).toEqual({
      id: expect.stringMatching(/^memory_review_mem_freeze_vs_feature_addition_/),
      userId: 'user-a',
      memoryId: 'mem_freeze_vs_feature_addition',
      reviewedAt: '2026-05-28T05:00:00.000Z',
      changedFields: ['summary', 'rawText', 'topicTags'],
      beforeSummary: 'Anxiety creates a freeze-vs-feature-addition choice, and feature addition postpones launches.',
      afterSummary: 'Edited source-backed freeze decision.',
      sourceRef: 'markdown://retros/freezing-vs-features.md',
    });
  });

  test('records unchanged reviews with an empty changed field list', () => {
    const before = personalMemoryRecords[2];

    const entry = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before,
      after: before,
      reviewedAt: '2026-05-28T05:05:00.000Z',
    });

    expect(entry.changedFields).toEqual([]);
    expect(entry.beforeSummary).toBe(entry.afterSummary);
    expect(entry.id).toMatch(/^memory_review_mem_freeze_vs_feature_addition_/);
  });
});
