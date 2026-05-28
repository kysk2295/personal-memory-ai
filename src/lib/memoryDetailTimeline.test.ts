import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildMemoryDetailTimeline } from './memoryDetailTimeline';
import { buildMemoryReviewLedgerEntry, buildMemoryReviewLedgerRecord } from './memoryReviewLedger';

describe('buildMemoryDetailTimeline', () => {
  test('builds a newest-first private memory timeline with selected detail metadata', () => {
    const timeline = buildMemoryDetailTimeline(personalMemoryRecords, 'mem_freeze_vs_feature_addition');

    expect(timeline.summary).toEqual({
      totalMemoryCount: 5,
      startDate: '2026-05-01',
      endDate: '2026-05-23',
      selectedMemoryId: 'mem_freeze_vs_feature_addition',
    });
    expect(timeline.entries.map((entry) => entry.memoryId)).toEqual([
      'mem_captured_ship_note',
      'mem_unrelated_calm_import',
      'mem_freeze_vs_feature_addition',
      'mem_launch_june_anxiety_scope_delay',
      'mem_launch_may_anxiety_scope_delay',
    ]);
    expect(timeline.entries.find((entry) => entry.memoryId === 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({
        active: true,
        sourceLabel: 'markdown · markdown://retros/freezing-vs-features.md',
        observedAt: '2026-05-20',
        title: '불안하면 멈추거나 기능을 더 넣는 선택으로 빠지고 출시가 밀린다.',
        privacyScope: 'private',
        rawExcerpt:
          '불안이 커지면 무엇을 덜어낼지 정하지 못하고 멈추거나 기능을 더 넣는다. 기능 추가 쪽을 택하면 출시가 계속 밀린다.',
      }),
    );
  });

  test('links timeline entries through shared facets without including the entry itself', () => {
    const timeline = buildMemoryDetailTimeline(personalMemoryRecords, 'mem_launch_june_anxiety_scope_delay');
    const june = timeline.entries.find((entry) => entry.memoryId === 'mem_launch_june_anxiety_scope_delay');

    expect(june?.active).toBe(true);
    expect(june?.facetLabels).toEqual(
      expect.arrayContaining(['emotion:anxiety', 'topic:launch', 'topic:feature addition', 'project:personal-memory-ai']),
    );
    expect(june?.relatedMemoryIds).toEqual([
      'mem_freeze_vs_feature_addition',
      'mem_launch_may_anxiety_scope_delay',
      'mem_captured_ship_note',
      'mem_unrelated_calm_import',
    ]);
    expect(june?.relatedMemoryIds).not.toContain('mem_launch_june_anxiety_scope_delay');
  });

  test('projects review comparison metadata for source-backed edits', () => {
    const edited = {
      ...personalMemoryRecords[2],
      summary: 'Edited source-backed freeze decision.',
      rawText: 'Edited source text that keeps the same citation.',
    };
    const review = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before: personalMemoryRecords[2],
      after: edited,
      reviewedAt: '2026-05-28T06:30:00.000Z',
    });
    const timeline = buildMemoryDetailTimeline(
      [personalMemoryRecords[2], buildMemoryReviewLedgerRecord(review)],
      'mem_freeze_vs_feature_addition',
    );

    expect(timeline.entries.find((entry) => entry.memoryId === 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({
        reviewComparisons: [
          {
            revisionId: review.id,
            reviewedAt: '2026-05-28T06:30:00.000Z',
            changedFieldLabels: ['summary', 'raw text'],
            sourceRef: 'markdown://retros/freezing-vs-features.md',
            beforeSummary:
              '불안하면 멈추거나 기능을 더 넣는 선택으로 빠지고 출시가 밀린다.',
            afterSummary: 'Edited source-backed freeze decision.',
            deltaLabel: 'summary, raw text changed',
          },
        ],
      }),
    );
  });

  test('caps related memory ids so large imports do not balloon app shell payloads', () => {
    const records = Array.from({ length: 30 }, (_, index) => ({
      ...personalMemoryRecords[0],
      id: `mem_large_related_${index}`,
      observedAt: `2026-05-${String(index + 1).padStart(2, '0')}`,
      summary: `Large related memory ${index}`,
      topicTags: ['shared-topic'],
    }));
    const timeline = buildMemoryDetailTimeline(records, 'mem_large_related_0');

    expect(timeline.entries.every((entry) => entry.relatedMemoryIds.length <= 8)).toBe(true);
  });

  test('skips eager related memory computation for very large timelines', () => {
    const records = Array.from({ length: 501 }, (_, index) => ({
      ...personalMemoryRecords[0],
      id: `mem_very_large_related_${index}`,
      observedAt: `2026-05-${String((index % 28) + 1).padStart(2, '0')}`,
      summary: `Very large related memory ${index}`,
      topicTags: ['shared-topic'],
    }));
    const timeline = buildMemoryDetailTimeline(records, 'mem_very_large_related_0');

    expect(timeline.entries.every((entry) => entry.relatedMemoryIds.length === 0)).toBe(true);
  });
});
