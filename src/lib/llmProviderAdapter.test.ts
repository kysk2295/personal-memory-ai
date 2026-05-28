import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { generateWithCitationGuardedProvider } from './llmProviderAdapter';

describe('LLM provider adapter behind citation guard', () => {
  test('accepts provider output only when it cites supplied memory evidence', async () => {
    const result = await generateWithCitationGuardedProvider({
      provider: {
        name: 'local-test-provider',
        model: 'citation-fixture',
        generate: async (prompt) => ({
          answer:
            'Freeze scope because both prior launch memories connect anxiety to feature addition. [mem_launch_may_anxiety_scope_delay]',
          citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
          recommendation: 'freeze scope',
          confidence: 0.82,
          providerName: 'local-test-provider',
          model: 'citation-fixture',
        }),
      },
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords.slice(0, 2),
    });

    expect(result).toMatchObject({
      providerName: 'local-test-provider',
      model: 'citation-fixture',
      evidenceLabel: 'sufficient_evidence',
      output: {
        citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
        recommendation: 'freeze scope',
      },
    });
    expect(result.prompt.allowedCitationIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
    ]);
    expect(result.prompt.evidenceText).not.toContain('mem_freeze_vs_feature_addition');
  });

  test('rejects generic provider output before it can become personal advice', async () => {
    const result = await generateWithCitationGuardedProvider({
      provider: {
        name: 'generic-provider',
        model: 'uncited-fixture',
        generate: async () => ({
          answer: 'Trust your instincts and do what feels right.',
          citationMemoryIds: [],
          providerName: 'generic-provider',
          model: 'uncited-fixture',
        }),
      },
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords.slice(0, 2),
    });

    expect(result).toMatchObject({
      providerName: 'generic-provider',
      model: 'uncited-fixture',
      evidenceLabel: 'insufficient_evidence',
      rejectionReason: 'Output must include at least one citation id.',
      output: {
        citationMemoryIds: [],
      },
    });
    expect(result.output.answer).toContain('근거 부족');
  });
});
