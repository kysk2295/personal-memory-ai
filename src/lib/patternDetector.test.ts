import { describe, expect, test } from 'vitest';
import {
  insufficientPatternMemoryRecords,
  personalMemoryRecords,
} from './__fixtures__/personalMemoryRecords';
import { detectRepeatedPatterns } from './patternDetector';

describe('detectRepeatedPatterns', () => {
  test('detects anxiety to scope expansion to launch delay from MemoryRecord evidence', () => {
    const result = detectRepeatedPatterns(personalMemoryRecords);

    expect(result.status).toBe('implemented');
    expect(result.patterns).toHaveLength(1);
    expect(result.patterns[0]).toMatchObject({
      id: 'pattern_anxiety_scope_expansion_launch_delay',
      title: '불안 -> 범위 확장 -> 출시 지연',
      evidenceLabel: 'sufficient_evidence',
      supportingMemoryIds: [
        'mem_launch_may_anxiety_scope_delay',
        'mem_launch_june_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ],
      emotions: ['anxiety', 'pressure', 'avoidance'],
      decisions: ['chosen', 'avoided'],
      outcomes: [
        '그래프 필터를 더 붙인 뒤 출시가 이틀 늦어졌다.',
        '온보딩 예시와 결정 되짚기 제어를 추가한 뒤 출시가 늦어졌다.',
        '범위를 덜어내기보다 기능 추가를 택하면 출시가 계속 밀린다.',
      ],
    });
    expect(result.patterns[0].confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.patterns[0].explanation).toContain('mem_launch_may_anxiety_scope_delay');
    expect(result.patterns[0].explanation).toContain('멈춤-vs-기능추가');
  });

  test('labels 근거 부족 when support is below the repeated-pattern threshold', () => {
    const result = detectRepeatedPatterns(insufficientPatternMemoryRecords);

    expect(result.status).toBe('implemented');
    expect(result.patterns).toEqual([
      expect.objectContaining({
        id: 'pattern_insufficient_evidence',
        title: '반복 패턴 근거 부족',
        confidence: 0,
        evidenceLabel: 'insufficient_evidence',
        supportingMemoryIds: ['mem_single_anxiety_scope_delay'],
        emotions: ['anxiety'],
        decisions: ['chosen'],
        outcomes: ['출시가 한 번 늦어졌다.'],
      }),
    ]);
    expect(result.patterns[0].explanation).toContain('최소 2개의 MemoryRecord 인용');
  });

  test('labels 근거 부족 when no MemoryRecord citations support the pattern', () => {
    const result = detectRepeatedPatterns([]);

    expect(result.status).toBe('implemented');
    expect(result.patterns).toEqual([
      expect.objectContaining({
        id: 'pattern_insufficient_evidence',
        title: '반복 패턴 근거 부족',
        confidence: 0,
        evidenceLabel: 'insufficient_evidence',
        supportingMemoryIds: [],
        emotions: [],
        decisions: [],
        outcomes: [],
      }),
    ]);
    expect(result.patterns[0].explanation).toContain('현재 근거: none');
  });

  test('returns deterministic supporting memory order when imported records arrive shuffled', () => {
    const result = detectRepeatedPatterns([...personalMemoryRecords].reverse());

    expect(result.patterns[0].supportingMemoryIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
  });
});
