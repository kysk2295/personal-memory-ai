import { describe, expect, test } from 'vitest';
import {
  insufficientPatternMemoryRecords,
  personalMemoryRecords,
} from './__fixtures__/personalMemoryRecords';
import { askMyPastSelf } from './askMyPastSelf';
import { detectRepeatedPatterns } from './patternDetector';

describe('askMyPastSelf', () => {
  test('builds a cited answer with evidence bullets, recommendation, and graph highlights', () => {
    const patterns = detectRepeatedPatterns(personalMemoryRecords).patterns;

    const result = askMyPastSelf({
      question: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords,
      patterns,
    });

    expect(result.status).toBe('implemented');
    expect(result.evidenceLabel).toBe('sufficient_evidence');
    expect(result.recommendation).toBe(
      '이번에는 기능을 더 넣기보다 freeze하고 사용자 피드백을 먼저 받으세요.',
    );
    expect(result.citationMemoryIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(result.evidenceBullets).toEqual([
      expect.objectContaining({
        citationId: 'mem_launch_may_anxiety_scope_delay',
        graphHighlightIds: expect.arrayContaining([
          'question:이번에도-기능을-더-넣어야-할까',
          'memory:mem_launch_may_anxiety_scope_delay',
          'emotion:anxiety',
          'decision:chosen',
          'outcome:launch-delayed-by-two-days-after-adding-graph-filters',
        ]),
      }),
      expect.objectContaining({
        citationId: 'mem_launch_june_anxiety_scope_delay',
      }),
      expect.objectContaining({
        citationId: 'mem_freeze_vs_feature_addition',
      }),
    ]);
    expect(result.answer).toContain('mem_launch_may_anxiety_scope_delay');
    expect(result.answer).toContain('기능을 더 넣기보다 freeze');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.graphHighlightIds).toEqual(
      expect.arrayContaining([
        'question:이번에도-기능을-더-넣어야-할까',
        'memory:mem_launch_may_anxiety_scope_delay',
        'memory:mem_launch_june_anxiety_scope_delay',
        'memory:mem_freeze_vs_feature_addition',
        'emotion:anxiety',
        'emotion:pressure',
        'emotion:avoidance',
        'decision:chosen',
        'decision:avoided',
        'outcome:launch-delayed-by-two-days-after-adding-graph-filters',
        'outcome:launch-delayed-after-onboarding-examples-and-replay-controls-were-added',
        'outcome:launches-keep-being-postponed-when-feature-addition-wins-over-cutting-scope',
        'pattern:pattern_anxiety_scope_expansion_launch_delay',
      ]),
    );
    expect(new Set(result.graphHighlightIds).size).toBe(result.graphHighlightIds.length);
  });

  test('returns insufficient evidence instead of generic advice when citations are too weak', () => {
    const patterns = detectRepeatedPatterns(insufficientPatternMemoryRecords).patterns;

    const result = askMyPastSelf({
      question: '이번에도 기능을 더 넣어야 할까?',
      memories: insufficientPatternMemoryRecords,
      patterns,
    });

    expect(result.status).toBe('implemented');
    expect(result.evidenceLabel).toBe('insufficient_evidence');
    expect(result.recommendation).toBe(
      '아직 답변할 만큼의 개인 기억 근거가 부족합니다. 관련 기억을 더 가져온 뒤 다시 물어보세요.',
    );
    expect(result.answer).toContain('insufficient evidence');
    expect(result.answer).not.toContain('일반적으로');
    expect(result.citationMemoryIds).toEqual(['mem_single_anxiety_scope_delay']);
    expect(result.evidenceBullets).toEqual([
      expect.objectContaining({
        citationId: 'mem_single_anxiety_scope_delay',
      }),
    ]);
    expect(result.graphHighlightIds).toEqual([
      'question:이번에도-기능을-더-넣어야-할까',
      'memory:mem_single_anxiety_scope_delay',
      'emotion:anxiety',
      'decision:chosen',
      'outcome:one-launch-was-delayed',
    ]);
    expect(result.confidence).toBe(0);
  });

  test('works with imported records when input order is shuffled', () => {
    const shuffled = [...personalMemoryRecords].reverse();
    const patterns = detectRepeatedPatterns(shuffled).patterns;

    const result = askMyPastSelf({
      question: 'Should I add more features again?',
      memories: shuffled,
      patterns,
    });

    expect(result.evidenceLabel).toBe('sufficient_evidence');
    expect(result.citationMemoryIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(result.evidenceBullets.map((bullet) => bullet.sourceType)).toEqual([
      'notion',
      'obsidian',
      'markdown',
    ]);
  });
});
