import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import {
  buildMemoryReviewLedgerEntry,
  buildMemoryReviewLedgerRecord,
  isMemoryReviewLedgerRecord,
  listMemoryReviewLedgerEntries,
  memoryReviewLedgerRecordToEntry,
} from './memoryReviewLedger';

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
      beforeSummary: '불안하면 멈추거나 기능을 더 넣는 선택으로 빠지고 출시가 밀린다.',
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

  test('persists review entries as private ledger memory records', () => {
    const before = personalMemoryRecords[2];
    const after = {
      ...before,
      summary: 'Edited source-backed freeze decision.',
    };
    const entry = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before,
      after,
      reviewedAt: '2026-05-28T06:00:00.000Z',
    });

    const record = buildMemoryReviewLedgerRecord(entry);

    expect(record).toEqual(
      expect.objectContaining({
        id: entry.id,
        sourceType: 'api',
        sourceRef: `personal-memory-ai://memory-review-ledger/${entry.memoryId}/${entry.id}`,
        createdAt: '2026-05-28T06:00:00.000Z',
        observedAt: '2026-05-28T06:00:00.000Z',
        memoryType: 'reflection',
        privacyScope: 'private',
        extractionStatus: 'ready',
        embeddingStatus: 'skipped',
      }),
    );
    expect(record.topicTags).toEqual(['memory-review-ledger', 'mem_freeze_vs_feature_addition']);
    expect(record.rawText).toContain('"changedFields":["summary"]');
    expect(isMemoryReviewLedgerRecord(record)).toBe(true);
    expect(memoryReviewLedgerRecordToEntry(record)).toEqual(entry);
  });

  test('lists review history for one memory without including unrelated ledger records', () => {
    const before = personalMemoryRecords[2];
    const first = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before,
      after: { ...before, summary: 'First edit.' },
      reviewedAt: '2026-05-28T06:00:00.000Z',
    });
    const second = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before: { ...before, summary: 'First edit.' },
      after: { ...before, summary: 'Second edit.' },
      reviewedAt: '2026-05-28T06:10:00.000Z',
    });
    const otherMemory = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before: personalMemoryRecords[0],
      after: { ...personalMemoryRecords[0], summary: 'Other memory edit.' },
      reviewedAt: '2026-05-28T06:20:00.000Z',
    });

    const history = listMemoryReviewLedgerEntries(
      [
        buildMemoryReviewLedgerRecord(first),
        buildMemoryReviewLedgerRecord(second),
        buildMemoryReviewLedgerRecord(otherMemory),
        personalMemoryRecords[2],
      ],
      'mem_freeze_vs_feature_addition',
    );

    expect(history.map((entry) => entry.id)).toEqual([second.id, first.id]);
    expect(history.map((entry) => entry.memoryId)).toEqual([
      'mem_freeze_vs_feature_addition',
      'mem_freeze_vs_feature_addition',
    ]);
  });
});
