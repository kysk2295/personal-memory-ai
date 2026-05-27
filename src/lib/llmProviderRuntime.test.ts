import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import {
  buildLlmProviderSmokePlan,
  resolveLlmProviderRuntimeConfig,
  runCitationGuardedLlmSmoke,
} from './llmProviderRuntime';

describe('LLM provider runtime smoke harness', () => {
  test('reports blocked readiness without leaking missing or present secret values', () => {
    const config = resolveLlmProviderRuntimeConfig({
      GEMINI_API_KEY: '',
      PMI_LLM_MODEL: '',
    });

    expect(config).toEqual(
      expect.objectContaining({
        status: 'blocked',
        providerName: 'gemini',
        requiredEnvVars: ['GEMINI_API_KEY', 'PMI_LLM_MODEL'],
        presentEnvVars: [],
        missingEnvVars: ['GEMINI_API_KEY', 'PMI_LLM_MODEL'],
        canRunLiveSmoke: false,
        secretValuesRedacted: true,
      }),
    );
    expect(JSON.stringify(config)).not.toContain('sk-');

    const plan = buildLlmProviderSmokePlan(config);
    expect(plan).toEqual(
      expect.objectContaining({
        status: 'blocked',
        liveSmokeGate: 'GEMINI_API_KEY + PMI_LLM_MODEL',
      }),
    );
    expect(plan.steps).toEqual(expect.arrayContaining(['Skip live provider call until missing env vars are present.']));
  });

  test('reports ready readiness with model and redacted secret presence only', () => {
    const config = resolveLlmProviderRuntimeConfig({
      GEMINI_API_KEY: 'gemini-live-secret-should-not-leak',
      PMI_LLM_MODEL: 'gemini-test-memory',
      PMI_LLM_BASE_URL: 'https://generativelanguage.googleapis.example/v1beta',
    });

    expect(config).toEqual(
      expect.objectContaining({
        status: 'ready',
        providerName: 'gemini',
        model: 'gemini-test-memory',
        baseUrl: 'https://generativelanguage.googleapis.example/v1beta',
        presentEnvVars: ['GEMINI_API_KEY', 'PMI_LLM_MODEL'],
        missingEnvVars: [],
        canRunLiveSmoke: true,
        secretValuesRedacted: true,
      }),
    );
    expect(JSON.stringify(config)).not.toContain('gemini-live-secret-should-not-leak');

    const plan = buildLlmProviderSmokePlan(config);
    expect(plan.status).toBe('ready');
    expect(plan.steps).toEqual(
      expect.arrayContaining([
        'Run provider through generateWithCitationGuardedProvider.',
        'Reject any uncited model output before returning personal advice.',
      ]),
    );
  });

  test('skips smoke when config is blocked', async () => {
    const config = resolveLlmProviderRuntimeConfig({});

    const result = await runCitationGuardedLlmSmoke({
      config,
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords.slice(0, 2),
    });

    expect(result).toEqual({
      status: 'skipped',
      reason: 'Missing LLM provider env vars: GEMINI_API_KEY, PMI_LLM_MODEL',
      missingEnvVars: ['GEMINI_API_KEY', 'PMI_LLM_MODEL'],
      secretValuesRedacted: true,
    });
  });

  test('runs ready smoke through the citation guard and preserves rejection of uncited output', async () => {
    const config = resolveLlmProviderRuntimeConfig({
      GEMINI_API_KEY: 'gemini-live-secret-should-not-leak',
      PMI_LLM_MODEL: 'gemini-test-memory',
    });

    const accepted = await runCitationGuardedLlmSmoke({
      config,
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords.slice(0, 2),
      provider: {
        name: 'gemini',
        model: 'gemini-test-memory',
        generate: async () => ({
          providerName: 'gemini',
          model: 'gemini-test-memory',
          answer: 'Freeze scope based on the launch-delay memory. [mem_launch_may_anxiety_scope_delay]',
          recommendation: 'freeze scope',
          citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
          confidence: 0.84,
        }),
      },
    });

    expect(accepted).toEqual(
      expect.objectContaining({
        status: 'completed',
        providerName: 'gemini',
        model: 'gemini-test-memory',
        secretValuesRedacted: true,
        evidenceLabel: 'sufficient_evidence',
      }),
    );
    expect(JSON.stringify(accepted)).not.toContain('gemini-live-secret-should-not-leak');

    const rejected = await runCitationGuardedLlmSmoke({
      config,
      task: 'ask',
      userInput: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords.slice(0, 2),
      provider: {
        name: 'gemini',
        model: 'gemini-test-memory',
        generate: async () => ({
          providerName: 'gemini',
          model: 'gemini-test-memory',
          answer: 'You should trust your instincts.',
          citationMemoryIds: [],
        }),
      },
    });

    expect(rejected).toEqual(
      expect.objectContaining({
        status: 'completed',
        evidenceLabel: 'insufficient_evidence',
        rejectionReason: 'Output must include at least one citation id.',
      }),
    );
  });
});
