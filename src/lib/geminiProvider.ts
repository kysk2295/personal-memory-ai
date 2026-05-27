import type { CitationConstrainedOutput, CitationConstrainedPrompt } from './citationConstrainedGeneration';
import type { CitationGuardedLlmProvider, CitationGuardedProviderOutput } from './llmProviderAdapter';

export interface GeminiProviderFetch {
  (url: string, init?: RequestInit): Promise<Response>;
}

export interface CreateGeminiCitationGuardedProviderInput {
  apiKey: string;
  model: string;
  baseUrl?: string;
  fetch?: GeminiProviderFetch;
}

interface GeminiPart {
  text?: string;
}

interface GeminiGenerateContentResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[];
    };
  }>;
  error?: {
    message?: string;
  };
}

function stripJsonFence(value: string): string {
  const trimmed = value.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced?.[1]?.trim() ?? trimmed;
}

function normalizeOutput(value: unknown): CitationConstrainedOutput {
  const candidate = value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
  return {
    answer: typeof candidate.answer === 'string' ? candidate.answer : '',
    citationMemoryIds: Array.isArray(candidate.citationMemoryIds)
      ? candidate.citationMemoryIds.filter((item): item is string => typeof item === 'string')
      : [],
    recommendation: typeof candidate.recommendation === 'string' ? candidate.recommendation : undefined,
    confidence: typeof candidate.confidence === 'number' ? candidate.confidence : undefined,
  };
}

export function parseGeminiJsonText(value: string): CitationConstrainedOutput {
  return normalizeOutput(JSON.parse(stripJsonFence(value)));
}

function buildGeminiPromptText(prompt: CitationConstrainedPrompt): string {
  return [
    'Return only valid JSON. Do not include markdown outside the JSON object.',
    `task: ${prompt.task}`,
    `userInput: ${prompt.userInput}`,
    `allowedCitationIds: ${JSON.stringify(prompt.allowedCitationIds)}`,
    `instructions: ${JSON.stringify(prompt.instructions)}`,
    `outputSchema: ${JSON.stringify(prompt.outputSchema)}`,
    'evidence:',
    prompt.evidenceText,
  ].join('\n');
}

function geminiEndpoint(input: CreateGeminiCitationGuardedProviderInput): string {
  const baseUrl = input.baseUrl ?? 'https://generativelanguage.googleapis.com/v1beta';
  return `${baseUrl.replace(/\/+$/g, '')}/models/${encodeURIComponent(input.model)}:generateContent`;
}

function extractGeminiText(response: GeminiGenerateContentResponse): string {
  return (
    response.candidates?.[0]?.content?.parts
      ?.map((part) => part.text ?? '')
      .join('')
      .trim() ?? ''
  );
}

export function createGeminiCitationGuardedProvider(
  input: CreateGeminiCitationGuardedProviderInput,
): CitationGuardedLlmProvider {
  const fetchImpl = input.fetch ?? fetch;

  return {
    name: 'gemini',
    model: input.model,
    async generate(prompt: CitationConstrainedPrompt): Promise<CitationGuardedProviderOutput> {
      const response = await fetchImpl(geminiEndpoint(input), {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-goog-api-key': input.apiKey,
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: buildGeminiPromptText(prompt) }],
            },
          ],
        }),
      });
      const body = (await response.json()) as GeminiGenerateContentResponse;
      if (!response.ok) throw new Error(body.error?.message ?? `Gemini generateContent failed with ${response.status}`);
      const parsed = parseGeminiJsonText(extractGeminiText(body));
      return {
        providerName: 'gemini',
        model: input.model,
        ...parsed,
      };
    },
  };
}
