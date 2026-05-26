import { describe, expect, test } from 'vitest';
import {
  insufficientPatternMemoryRecords,
  personalMemoryRecords,
} from './__fixtures__/personalMemoryRecords';
import { replayDecision } from './decisionReplay';
import { detectRepeatedPatterns } from './patternDetector';

describe('replayDecision', () => {
  test('compares a current decision with similar past decisions and returns cited replay evidence', () => {
    const patterns = detectRepeatedPatterns(personalMemoryRecords).patterns;

    const result = replayDecision({
      currentDecision: {
        id: 'decision_current_add_replay_polish',
        prompt: 'Should I add more Decision Replay polish before review?',
        emotions: ['anxiety', 'pressure'],
        choices: ['add polish', 'freeze for review'],
        topicTags: ['launch', 'feature addition', 'Decision Replay'],
      },
      memories: personalMemoryRecords,
      patterns,
    });

    expect(result.status).toBe('implemented');
    expect(result.evidenceLabel).toBe('sufficient_evidence');
    expect(result.currentDecision).toEqual({
      id: 'decision_current_add_replay_polish',
      prompt: 'Should I add more Decision Replay polish before review?',
      emotions: ['anxiety', 'pressure'],
      choices: ['add polish', 'freeze for review'],
      topicTags: ['launch', 'feature addition', 'Decision Replay'],
    });
    expect(result.similarPastDecisions).toEqual([
      expect.objectContaining({
        memoryId: 'mem_launch_may_anxiety_scope_delay',
        emotions: ['anxiety', 'pressure'],
        choices: ['chosen'],
        outcome: 'Launch delayed by two days after adding graph filters.',
        citations: [
          expect.objectContaining({
            citationId: 'mem_launch_may_anxiety_scope_delay',
            sourceType: 'notion',
            sourceRef: 'notion://launch-journal/may',
          }),
        ],
      }),
      expect.objectContaining({
        memoryId: 'mem_launch_june_anxiety_scope_delay',
      }),
      expect.objectContaining({
        memoryId: 'mem_freeze_vs_feature_addition',
      }),
    ]);
    expect(result.emotions).toEqual(['anxiety', 'pressure', 'avoidance']);
    expect(result.choices).toEqual(['chosen', 'avoided']);
    expect(result.outcomes).toEqual([
      'Launch delayed by two days after adding graph filters.',
      'Launch delayed after onboarding examples and replay controls were added.',
      'Launches keep being postponed when feature addition wins over cutting scope.',
    ]);
    expect(result.citations).toEqual([
      expect.objectContaining({
        citationId: 'mem_launch_may_anxiety_scope_delay',
        sourceType: 'notion',
        sourceRef: 'notion://launch-journal/may',
        graphHighlightIds: expect.arrayContaining([
          'decision:decision_current_add_replay_polish',
          'memory:mem_launch_may_anxiety_scope_delay',
        ]),
      }),
      expect.objectContaining({
        citationId: 'mem_launch_june_anxiety_scope_delay',
      }),
      expect.objectContaining({
        citationId: 'mem_freeze_vs_feature_addition',
      }),
    ]);
    expect(result.pattern).toEqual(
      expect.objectContaining({
        id: 'pattern_anxiety_scope_expansion_launch_delay',
        title: 'Anxiety -> scope expansion -> launch delay',
      }),
    );
    expect(result.recommendation).toBe(
      'Based on cited memories, freeze Decision Replay scope for review instead of adding more polish.',
    );
    expect(result.uncertainty).toContain('Recommendation is bounded to cited personal memories');
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.citationMemoryIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(result.graphHighlightIds).toEqual([
      'decision:decision_current_add_replay_polish',
      'emotion:anxiety',
      'emotion:pressure',
      'choice:add-polish',
      'choice:freeze-for-review',
      'topic:launch',
      'topic:feature-addition',
      'topic:decision-replay',
      'memory:mem_launch_may_anxiety_scope_delay',
      'memory:mem_launch_june_anxiety_scope_delay',
      'memory:mem_freeze_vs_feature_addition',
      'decision:chosen',
      'decision:avoided',
      'outcome:launch-delayed-by-two-days-after-adding-graph-filters',
      'outcome:launch-delayed-after-onboarding-examples-and-replay-controls-were-added',
      'outcome:launches-keep-being-postponed-when-feature-addition-wins-over-cutting-scope',
      'pattern:pattern_anxiety_scope_expansion_launch_delay',
    ]);
  });

  test('returns insufficient evidence without generic advice when citations are too weak', () => {
    const patterns = detectRepeatedPatterns(insufficientPatternMemoryRecords).patterns;

    const result = replayDecision({
      currentDecision: {
        id: 'decision_current_add_polish',
        prompt: 'Should I add polish?',
        emotions: ['uncertain'],
        choices: ['add polish', 'ship'],
        topicTags: ['polish'],
      },
      memories: insufficientPatternMemoryRecords,
      patterns,
    });

    expect(result.status).toBe('implemented');
    expect(result.evidenceLabel).toBe('insufficient_evidence');
    expect(result.recommendation).toBe(
      'Insufficient cited personal memory to recommend a choice. Import or capture more relevant decisions first.',
    );
    expect(result.uncertainty).toContain('Need at least 2 similar past decision citations');
    expect(result.similarPastDecisions).toEqual([
      expect.objectContaining({
        memoryId: 'mem_single_anxiety_scope_delay',
      }),
    ]);
    expect(result.emotions).toEqual(['anxiety']);
    expect(result.choices).toEqual(['chosen']);
    expect(result.outcomes).toEqual(['One launch was delayed.']);
    expect(result.citations).toEqual([
      expect.objectContaining({
        citationId: 'mem_single_anxiety_scope_delay',
      }),
    ]);
    expect(result.citationMemoryIds).toEqual(['mem_single_anxiety_scope_delay']);
    expect(result.confidence).toBe(0);
    expect(result.graphHighlightIds).toEqual([
      'decision:decision_current_add_polish',
      'emotion:uncertain',
      'choice:add-polish',
      'choice:ship',
      'topic:polish',
      'memory:mem_single_anxiety_scope_delay',
      'decision:chosen',
      'outcome:one-launch-was-delayed',
    ]);
  });
});
