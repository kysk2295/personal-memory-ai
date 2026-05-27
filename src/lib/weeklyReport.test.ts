import { describe, expect, test } from 'vitest';
import {
  insufficientPatternMemoryRecords,
  personalMemoryRecords,
} from './__fixtures__/personalMemoryRecords';
import { normalizeMemoryRecord } from './memoryRecord';
import { generateWeeklyReport } from './weeklyReport';

describe('generateWeeklyReport', () => {
  test('uses an explicit inclusive date window and reports insufficient weekly evidence', () => {
    const report = generateWeeklyReport({
      records: insufficientPatternMemoryRecords,
      startDate: '2026-05-24',
      endDate: '2026-05-30',
      generatedAt: '2026-05-27T11:00:00.000Z',
    });

    expect(report).toMatchObject({
      id: 'weekly_report_2026-05-24_2026-05-30',
      status: 'implemented',
      generatedAt: '2026-05-27T11:00:00.000Z',
      window: {
        startDate: '2026-05-24',
        endDate: '2026-05-30',
      },
      evidenceLabel: 'insufficient_evidence',
      totalMemoryRecords: 1,
      includedMemoryIds: ['mem_single_anxiety_scope_delay'],
      insufficientEvidenceReason: 'Need at least 2 MemoryRecord citations in the weekly window.',
    });
  });

  test('aggregates weekly emotions, decisions, outcomes, and projects with supporting memories', () => {
    const report = generateWeeklyReport({
      records: personalMemoryRecords,
      startDate: '2026-05-01',
      endDate: '2026-05-20',
      generatedAt: '2026-05-27T11:05:00.000Z',
    });

    expect(report.evidenceLabel).toBe('sufficient_evidence');
    expect(report.includedMemoryIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(report.aggregates.emotions).toContainEqual({
      value: 'anxiety',
      count: 3,
      supportingMemoryIds: [
        'mem_launch_may_anxiety_scope_delay',
        'mem_launch_june_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ],
    });
    expect(report.aggregates.decisions).toContainEqual({
      value: 'chosen',
      count: 2,
      supportingMemoryIds: ['mem_launch_may_anxiety_scope_delay', 'mem_launch_june_anxiety_scope_delay'],
    });
    expect(report.aggregates.projects).toContainEqual({
      value: 'personal-memory-ai',
      count: 3,
      supportingMemoryIds: [
        'mem_launch_may_anxiety_scope_delay',
        'mem_launch_june_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ],
    });
    expect(report.aggregates.outcomes).toContainEqual({
      value: 'Launch delayed by two days after adding graph filters.',
      count: 1,
      supportingMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
    });
  });

  test('includes repeated-pattern insight from memories inside the weekly window', () => {
    const report = generateWeeklyReport({
      records: [
        ...personalMemoryRecords,
        normalizeMemoryRecord({
          id: 'mem_outside_window',
          sourceType: 'markdown',
          sourceRef: 'markdown://outside.md',
          observedAt: '2026-04-01',
          rawText: 'An older anxiety and scope expansion memory should be outside this report.',
          emotionTags: ['anxiety'],
          topicTags: ['scope expansion'],
          projectTags: ['personal-memory-ai'],
          decisionSignal: 'chosen',
        }),
      ],
      startDate: '2026-05-01',
      endDate: '2026-05-20',
      generatedAt: '2026-05-27T11:10:00.000Z',
    });

    expect(report.patternInsights).toEqual([
      expect.objectContaining({
        id: 'pattern_anxiety_scope_expansion_launch_delay',
        evidenceLabel: 'sufficient_evidence',
        supportingMemoryIds: [
          'mem_launch_may_anxiety_scope_delay',
          'mem_launch_june_anxiety_scope_delay',
          'mem_freeze_vs_feature_addition',
        ],
      }),
    ]);
  });
});
