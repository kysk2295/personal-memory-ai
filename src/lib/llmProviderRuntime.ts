import type { CitationConstrainedTask } from './citationConstrainedGeneration';
import {
  generateWithCitationGuardedProvider,
  type CitationGuardedLlmProvider,
  type CitationGuardedProviderResult,
} from './llmProviderAdapter';
import type { MemoryRecord } from './memoryRecord';

export type LlmProviderRuntimeStatus = 'ready' | 'blocked';
export type LlmProviderSmokeStatus = 'ready' | 'blocked';

export interface LlmProviderRuntimeEnv {
  GEMINI_API_KEY?: string;
  GOOGLE_API_KEY?: string;
  OPENAI_API_KEY?: string;
  PMI_LLM_PROVIDER?: string;
  PMI_LLM_MODEL?: string;
  PMI_LLM_BASE_URL?: string;
}

export interface LlmProviderRuntimeConfig {
  status: LlmProviderRuntimeStatus;
  providerName: string;
  model?: string;
  baseUrl?: string;
  requiredEnvVars: string[];
  presentEnvVars: string[];
  missingEnvVars: string[];
  canRunLiveSmoke: boolean;
  secretValuesRedacted: true;
}

export interface LlmProviderSmokePlan {
  status: LlmProviderSmokeStatus;
  providerName: string;
  model?: string;
  liveSmokeGate: string;
  requiredEnvVars: string[];
  missingEnvVars: string[];
  command: 'npm test -- src/lib/llmProviderRuntime.test.ts';
  steps: string[];
  secretValuesRedacted: true;
}

export type LlmProviderSmokeResult =
  | {
      status: 'skipped';
      reason: string;
      missingEnvVars: string[];
      secretValuesRedacted: true;
    }
  | (Omit<CitationGuardedProviderResult, 'status'> & {
      status: 'completed';
      generationStatus: CitationGuardedProviderResult['status'];
      secretValuesRedacted: true;
    });

export interface RunCitationGuardedLlmSmokeInput {
  config: LlmProviderRuntimeConfig;
  task: CitationConstrainedTask;
  userInput: string;
  memories: readonly MemoryRecord[];
  provider?: CitationGuardedLlmProvider;
}

const GEMINI_REQUIRED_ENV_VARS = ['GEMINI_API_KEY', 'PMI_LLM_MODEL'];
const OPENAI_REQUIRED_ENV_VARS = ['OPENAI_API_KEY', 'PMI_LLM_MODEL'];

function hasValue(value: string | undefined): boolean {
  return Boolean(value?.trim());
}

function providerNameFromEnv(env: LlmProviderRuntimeEnv): string {
  return env.PMI_LLM_PROVIDER?.trim() || 'gemini';
}

function requiredEnvVarsForProvider(providerName: string): string[] {
  return providerName === 'openai-compatible' || providerName === 'openai'
    ? OPENAI_REQUIRED_ENV_VARS
    : GEMINI_REQUIRED_ENV_VARS;
}

function envValueForKey(env: LlmProviderRuntimeEnv, key: string): string | undefined {
  if (key === 'GEMINI_API_KEY') return env.GEMINI_API_KEY ?? env.GOOGLE_API_KEY;
  return env[key as keyof LlmProviderRuntimeEnv];
}

export function resolveLlmProviderRuntimeConfig(env: LlmProviderRuntimeEnv): LlmProviderRuntimeConfig {
  const providerName = providerNameFromEnv(env);
  const requiredEnvVars = requiredEnvVarsForProvider(providerName);
  const presentEnvVars = requiredEnvVars.filter((key) => hasValue(envValueForKey(env, key)));
  const missingEnvVars = requiredEnvVars.filter((key) => !hasValue(envValueForKey(env, key)));
  const model = hasValue(env.PMI_LLM_MODEL) ? env.PMI_LLM_MODEL?.trim() : undefined;
  const baseUrl = hasValue(env.PMI_LLM_BASE_URL) ? env.PMI_LLM_BASE_URL?.trim() : undefined;
  const status: LlmProviderRuntimeStatus = missingEnvVars.length === 0 ? 'ready' : 'blocked';

  return {
    status,
    providerName,
    model,
    baseUrl,
    requiredEnvVars,
    presentEnvVars,
    missingEnvVars,
    canRunLiveSmoke: status === 'ready',
    secretValuesRedacted: true,
  };
}

export function buildLlmProviderSmokePlan(config: LlmProviderRuntimeConfig): LlmProviderSmokePlan {
  return {
    status: config.status,
    providerName: config.providerName,
    model: config.model,
    liveSmokeGate: config.requiredEnvVars.join(' + '),
    requiredEnvVars: config.requiredEnvVars,
    missingEnvVars: config.missingEnvVars,
    command: 'npm test -- src/lib/llmProviderRuntime.test.ts',
    steps:
      config.status === 'ready'
        ? [
            'Run provider through generateWithCitationGuardedProvider.',
            'Reject any uncited model output before returning personal advice.',
            'Return provider/model metadata without returning secret values.',
          ]
        : ['Skip live provider call until missing env vars are present.'],
    secretValuesRedacted: true,
  };
}

export async function runCitationGuardedLlmSmoke(
  input: RunCitationGuardedLlmSmokeInput,
): Promise<LlmProviderSmokeResult> {
  if (!input.config.canRunLiveSmoke) {
    return {
      status: 'skipped',
      reason: `Missing LLM provider env vars: ${input.config.missingEnvVars.join(', ')}`,
      missingEnvVars: input.config.missingEnvVars,
      secretValuesRedacted: true,
    };
  }

  if (!input.provider) {
    return {
      status: 'skipped',
      reason: 'Live LLM provider is not attached in this local run.',
      missingEnvVars: [],
      secretValuesRedacted: true,
    };
  }

  const result = await generateWithCitationGuardedProvider({
    provider: input.provider,
    task: input.task,
    userInput: input.userInput,
    memories: input.memories,
  });
  const { status: generationStatus, ...guardedResult } = result;

  return {
    ...guardedResult,
    status: 'completed',
    generationStatus,
    secretValuesRedacted: true,
  };
}
