import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import {
  buildCitationConstrainedPrompt,
  buildCitationEvidenceFromMemories,
  generateCitationConstrainedOutput,
  validateCitationConstrainedOutput,
} from './citationConstrainedGeneration';

const evidence = buildCitationEvidenceFromMemories(personalMemoryRecords.slice(0, 2));

describe('citation constrained generation', () => {
  test('builds prompt payload only from supplied citation evidence', () => {
    const prompt = buildCitationConstrainedPrompt({
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      evidence,
    });

    expect(prompt.allowedCitationIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
    ]);
    expect(prompt.evidenceText).toContain('mem_launch_may_anxiety_scope_delay');
    expect(prompt.evidenceText).toContain('mem_launch_june_anxiety_scope_delay');
    expect(prompt.evidenceText).not.toContain('mem_freeze_vs_feature_addition');
    expect(prompt.outputSchema.required).toEqual(['answer', 'citationMemoryIds']);
  });

  test('validates that output cites only allowed memories and embeds citation ids in answer text', () => {
    expect(
      validateCitationConstrainedOutput({
        allowedCitationIds: evidence.map((item) => item.citationId),
        output: {
          answer:
            'Freeze scope because both launches slipped after feature additions. [mem_launch_may_anxiety_scope_delay] [mem_launch_june_anxiety_scope_delay]',
          citationMemoryIds: ['mem_launch_may_anxiety_scope_delay', 'mem_launch_june_anxiety_scope_delay'],
        },
      }),
    ).toEqual({ valid: true });

    expect(
      validateCitationConstrainedOutput({
        allowedCitationIds: evidence.map((item) => item.citationId),
        output: {
          answer: 'You should trust your intuition.',
          citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
        },
      }),
    ).toEqual({
      valid: false,
      reason: 'Answer text does not include required citation markers.',
    });

    expect(
      validateCitationConstrainedOutput({
        allowedCitationIds: evidence.map((item) => item.citationId),
        output: {
          answer: 'Freeze scope. [mem_unknown]',
          citationMemoryIds: ['mem_unknown'],
        },
      }),
    ).toEqual({
      valid: false,
      reason: 'Output cited memory ids outside the allowed evidence set.',
    });
  });

  test('falls back to insufficient evidence when generated output is generic or uncited', async () => {
    const generic = await generateCitationConstrainedOutput({
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      evidence,
      generate: async () => ({
        answer: 'You should believe in yourself and make the brave choice.',
        citationMemoryIds: [],
      }),
    });

    expect(generic).toMatchObject({
      status: 'implemented',
      evidenceLabel: 'insufficient_evidence',
      output: {
        answer: 'insufficient evidence: generated output was rejected because it was not grounded in supplied citations.',
        citationMemoryIds: [],
      },
      rejectionReason: 'Output must include at least one citation id.',
    });

    const grounded = await generateCitationConstrainedOutput({
      task: 'weekly_report',
      userInput: 'Summarize this week.',
      evidence,
      generate: async () => ({
        answer:
          'This week repeats launch anxiety before feature additions. [mem_launch_may_anxiety_scope_delay]',
        citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
      }),
    });

    expect(grounded.evidenceLabel).toBe('sufficient_evidence');
    expect(grounded.output.citationMemoryIds).toEqual(['mem_launch_may_anxiety_scope_delay']);
  });
});
