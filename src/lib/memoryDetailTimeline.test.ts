import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildMemoryDetailTimeline } from './memoryDetailTimeline';

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
        title: 'Anxiety creates a freeze-vs-feature-addition choice, and feature addition postpones launches.',
        privacyScope: 'private',
        rawExcerpt:
          'When anxiety spikes I either freeze or add features instead of deciding what to cut. The feature-addition branch keeps postponing launches.',
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
});
