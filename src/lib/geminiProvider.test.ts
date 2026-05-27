import { describe, expect, test } from 'vitest';
import type { CitationConstrainedPrompt } from './citationConstrainedGeneration';
import { createGeminiCitationGuardedProvider, parseGeminiJsonText } from './geminiProvider';

const prompt: CitationConstrainedPrompt = {
  task: 'ask',
  userInput: '이번에도 기능을 더 넣어야 할까?',
  allowedCitationIds: ['mem_launch_may_anxiety_scope_delay'],
  evidenceText:
    '[mem_launch_may_anxiety_scope_delay] notion:notion://launch observedAt=2026-05-01 Launch delayed after scope expansion.',
  instructions: [
    'Use only the supplied citation evidence.',
    'Every answer must include bracketed citation ids from allowedCitationIds.',
  ],
  outputSchema: {
    type: 'object',
    required: ['answer', 'citationMemoryIds'],
    properties: {
      answer: 'string with bracketed citation ids',
      citationMemoryIds: 'array of allowed memory ids cited in answer',
      recommendation: 'optional string',
      confidence: 'optional number between 0 and 1',
    },
  },
};

describe('Gemini citation guarded provider', () => {
  test('formats generateContent request and parses JSON response without leaking the API key', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const provider = createGeminiCitationGuardedProvider({
      apiKey: 'gemini-secret-should-not-leak',
      model: 'gemini-test-memory',
      fetch: async (url, init) => {
        calls.push({ url: String(url), init: init ?? {} });
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [
                    {
                      text: JSON.stringify({
                        answer:
                          'Freeze scope based on the cited launch delay. [mem_launch_may_anxiety_scope_delay]',
                        citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
                        recommendation: 'freeze scope',
                        confidence: 0.86,
                      }),
                    },
                  ],
                },
              },
            ],
          }),
          { status: 200, headers: { 'content-type': 'application/json' } },
        );
      },
    });

    const output = await provider.generate(prompt);

    expect(calls).toHaveLength(1);
    expect(calls[0].url).toBe(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-test-memory:generateContent',
    );
    expect(calls[0].init.method).toBe('POST');
    expect(calls[0].init.headers).toEqual(
      expect.objectContaining({
        'content-type': 'application/json',
        'x-goog-api-key': 'gemini-secret-should-not-leak',
      }),
    );
    const body = JSON.parse(String(calls[0].init.body));
    expect(body.contents[0].parts[0].text).toContain('allowedCitationIds');
    expect(body.contents[0].parts[0].text).toContain('mem_launch_may_anxiety_scope_delay');
    expect(body.contents[0].parts[0].text).toContain('Return only valid JSON');
    expect(output).toEqual({
      providerName: 'gemini',
      model: 'gemini-test-memory',
      answer: 'Freeze scope based on the cited launch delay. [mem_launch_may_anxiety_scope_delay]',
      citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
      recommendation: 'freeze scope',
      confidence: 0.86,
    });
    expect(JSON.stringify(output)).not.toContain('gemini-secret-should-not-leak');
  });

  test('parses fenced Gemini JSON text', () => {
    expect(
      parseGeminiJsonText(
        '```json\n{"answer":"Use citations. [mem_a]","citationMemoryIds":["mem_a"],"confidence":0.7}\n```',
      ),
    ).toEqual({
      answer: 'Use citations. [mem_a]',
      citationMemoryIds: ['mem_a'],
      confidence: 0.7,
    });
  });
});
