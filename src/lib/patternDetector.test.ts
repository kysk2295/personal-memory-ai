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
      title: 'Anxiety -> scope expansion -> launch delay',
      evidenceLabel: 'sufficient_evidence',
      supportingMemoryIds: [
        'mem_launch_may_anxiety_scope_delay',
        'mem_launch_june_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ],
      emotions: ['anxiety', 'pressure', 'avoidance'],
      decisions: ['chosen', 'avoided'],
      outcomes: [
        'Launch delayed by two days after adding graph filters.',
        'Launch delayed after onboarding examples and replay controls were added.',
        'Launches keep being postponed when feature addition wins over cutting scope.',
      ],
    });
    expect(result.patterns[0].confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.patterns[0].explanation).toContain('mem_launch_may_anxiety_scope_delay');
    expect(result.patterns[0].explanation).toContain('freeze-vs-feature-addition');
  });

  test('labels insufficient evidence when support is below the repeated-pattern threshold', () => {
    const result = detectRepeatedPatterns(insufficientPatternMemoryRecords);

    expect(result.status).toBe('implemented');
    expect(result.patterns).toEqual([
      expect.objectContaining({
        id: 'pattern_insufficient_evidence',
        title: 'Insufficient repeated-pattern evidence',
        confidence: 0,
        evidenceLabel: 'insufficient_evidence',
        supportingMemoryIds: ['mem_single_anxiety_scope_delay'],
        emotions: ['anxiety'],
        decisions: ['chosen'],
        outcomes: ['One launch was delayed.'],
      }),
    ]);
    expect(result.patterns[0].explanation).toContain('Need at least 2 supporting MemoryRecord citations');
  });

  test('labels insufficient evidence when no MemoryRecord citations support the pattern', () => {
    const result = detectRepeatedPatterns([]);

    expect(result.status).toBe('implemented');
    expect(result.patterns).toEqual([
      expect.objectContaining({
        id: 'pattern_insufficient_evidence',
        title: 'Insufficient repeated-pattern evidence',
        confidence: 0,
        evidenceLabel: 'insufficient_evidence',
        supportingMemoryIds: [],
        emotions: [],
        decisions: [],
        outcomes: [],
      }),
    ]);
    expect(result.patterns[0].explanation).toContain('Current support: none');
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
