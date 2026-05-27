import {
  buildCitationEvidenceFromMemories,
  generateCitationConstrainedOutput,
  type CitationConstrainedGenerationResult,
  type CitationConstrainedOutput,
  type CitationConstrainedPrompt,
  type CitationConstrainedTask,
} from './citationConstrainedGeneration';
import type { MemoryRecord } from './memoryRecord';

export interface CitationGuardedProviderOutput extends CitationConstrainedOutput {
  providerName: string;
  model: string;
}

export interface CitationGuardedLlmProvider {
  name: string;
  model: string;
  generate(prompt: CitationConstrainedPrompt): Promise<CitationGuardedProviderOutput>;
}

export interface GenerateWithCitationGuardedProviderInput {
  provider: CitationGuardedLlmProvider;
  task: CitationConstrainedTask;
  userInput: string;
  memories: readonly MemoryRecord[];
}

export interface CitationGuardedProviderResult extends CitationConstrainedGenerationResult {
  providerName: string;
  model: string;
}

export async function generateWithCitationGuardedProvider(
  input: GenerateWithCitationGuardedProviderInput,
): Promise<CitationGuardedProviderResult> {
  const result = await generateCitationConstrainedOutput({
    task: input.task,
    userInput: input.userInput,
    evidence: buildCitationEvidenceFromMemories(input.memories),
    generate: async (prompt) => {
      const providerOutput = await input.provider.generate(prompt);
      return {
        answer: providerOutput.answer,
        citationMemoryIds: providerOutput.citationMemoryIds,
        recommendation: providerOutput.recommendation,
        confidence: providerOutput.confidence,
      };
    },
  });

  return {
    ...result,
    providerName: input.provider.name,
    model: input.provider.model,
  };
}
