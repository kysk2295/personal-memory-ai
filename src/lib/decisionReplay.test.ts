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
        prompt: '오늘 MVP를 보여줄까, 아니면 결정 되짚기 화면을 더 다듬을까?',
        emotions: ['anxiety', 'pressure'],
        choices: ['더 다듬기', '리뷰용으로 고정하기'],
        topicTags: ['launch', 'feature addition', '결정 되짚기'],
      },
      memories: personalMemoryRecords,
      patterns,
    });

    expect(result.status).toBe('implemented');
    expect(result.evidenceLabel).toBe('sufficient_evidence');
    expect(result.currentDecision).toEqual({
      id: 'decision_current_add_replay_polish',
      prompt: '오늘 MVP를 보여줄까, 아니면 결정 되짚기 화면을 더 다듬을까?',
      emotions: ['anxiety', 'pressure'],
      choices: ['더 다듬기', '리뷰용으로 고정하기'],
      topicTags: ['launch', 'feature addition', '결정 되짚기'],
    });
    expect(result.similarPastDecisions).toEqual([
      expect.objectContaining({
        memoryId: 'mem_launch_may_anxiety_scope_delay',
        emotions: ['anxiety', 'pressure'],
        choices: ['chosen'],
        outcome: '그래프 필터를 더 붙인 뒤 출시가 이틀 늦어졌다.',
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
      '그래프 필터를 더 붙인 뒤 출시가 이틀 늦어졌다.',
      '온보딩 예시와 결정 되짚기 제어를 추가한 뒤 출시가 늦어졌다.',
      '범위를 덜어내기보다 기능 추가를 택하면 출시가 계속 밀린다.',
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
        title: '불안 -> 범위 확장 -> 출시 지연',
      }),
    );
    expect(result.recommendation).toBe(
      '인용된 기억에 따르면 더 다듬기보다 결정 되짚기 범위를 고정하고 리뷰를 받는 편이 낫습니다.',
    );
    expect(result.uncertainty).toContain('추천은 인용된 개인 기억 안에서만 유효');
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
      'choice:더-다듬기',
      'choice:리뷰용으로-고정하기',
      'topic:launch',
      'topic:feature-addition',
      'topic:결정-되짚기',
      'memory:mem_launch_may_anxiety_scope_delay',
      'memory:mem_launch_june_anxiety_scope_delay',
      'memory:mem_freeze_vs_feature_addition',
      'decision:chosen',
      'decision:avoided',
      'outcome:그래프-필터를-더-붙인-뒤-출시가-이틀-늦어졌다',
      'outcome:온보딩-예시와-결정-되짚기-제어를-추가한-뒤-출시가-늦어졌다',
      'outcome:범위를-덜어내기보다-기능-추가를-택하면-출시가-계속-밀린다',
      'pattern:pattern_anxiety_scope_expansion_launch_delay',
    ]);
  });

  test('returns 근거 부족 without generic advice when citations are too weak', () => {
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
      '선택을 추천할 만큼 인용된 개인 기억이 부족합니다. 관련 결정을 먼저 가져오거나 기록하세요.',
    );
    expect(result.uncertainty).toContain('최소 2개의 비슷한 과거 결정 인용');
    expect(result.similarPastDecisions).toEqual([
      expect.objectContaining({
        memoryId: 'mem_single_anxiety_scope_delay',
      }),
    ]);
    expect(result.emotions).toEqual(['anxiety']);
    expect(result.choices).toEqual(['chosen']);
    expect(result.outcomes).toEqual(['출시가 한 번 늦어졌다.']);
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
      'outcome:출시가-한-번-늦어졌다',
    ]);
  });
});
