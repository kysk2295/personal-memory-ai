import type { MemoryRecord, MemorySourceType } from './memoryRecord';

export type CitationConstrainedTask = 'ask' | 'decision_replay' | 'weekly_report';
export type CitationConstrainedStatus = 'implemented';
export type CitationConstrainedEvidenceLabel = 'sufficient_evidence' | 'insufficient_evidence';

export interface CitationEvidence {
  citationId: string;
  sourceType: MemorySourceType;
  sourceRef: string;
  observedAt?: string;
  text: string;
}

export interface CitationConstrainedPrompt {
  task: CitationConstrainedTask;
  userInput: string;
  allowedCitationIds: string[];
  evidenceText: string;
  instructions: string[];
  outputSchema: {
    type: 'object';
    required: string[];
    properties: Record<string, string>;
  };
}

export interface CitationConstrainedOutput {
  answer: string;
  citationMemoryIds: string[];
  recommendation?: string;
  confidence?: number;
}

export interface CitationValidationInput {
  allowedCitationIds: readonly string[];
  output: CitationConstrainedOutput;
}

export interface CitationValidationResult {
  valid: boolean;
  reason?: string;
}

export interface GenerateCitationConstrainedOutputInput {
  task: CitationConstrainedTask;
  userInput: string;
  evidence: readonly CitationEvidence[];
  generate(prompt: CitationConstrainedPrompt): Promise<CitationConstrainedOutput>;
}

export interface CitationConstrainedGenerationResult {
  status: CitationConstrainedStatus;
  evidenceLabel: CitationConstrainedEvidenceLabel;
  prompt: CitationConstrainedPrompt;
  output: CitationConstrainedOutput;
  rejectionReason?: string;
}

export function buildCitationEvidenceFromMemories(memories: readonly MemoryRecord[]): CitationEvidence[] {
  return memories.map((memory) => ({
    citationId: memory.id,
    sourceType: memory.sourceType,
    sourceRef: memory.sourceRef,
    observedAt: memory.observedAt,
    text: [memory.summary, memory.outcomeText ? `Outcome: ${memory.outcomeText}` : undefined, `[${memory.id}]`]
      .filter((part): part is string => Boolean(part))
      .join(' '),
  }));
}

export function buildCitationConstrainedPrompt(input: {
  task: CitationConstrainedTask;
  userInput: string;
  evidence: readonly CitationEvidence[];
}): CitationConstrainedPrompt {
  const allowedCitationIds = input.evidence.map((item) => item.citationId);
  return {
    task: input.task,
    userInput: input.userInput,
    allowedCitationIds,
    evidenceText: input.evidence
      .map((item) =>
        [
          `[${item.citationId}]`,
          `${item.sourceType}:${item.sourceRef}`,
          item.observedAt ? `observedAt=${item.observedAt}` : undefined,
          item.text,
        ]
          .filter((part): part is string => Boolean(part))
          .join(' '),
      )
      .join('\n'),
    instructions: [
      'Use only the supplied citation evidence.',
      'Do not use generic coaching or facts outside the evidence.',
      'Every answer must include bracketed citation ids from allowedCitationIds.',
      'If evidence is insufficient, return an empty citationMemoryIds array.',
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
}

export function validateCitationConstrainedOutput(
  input: CitationValidationInput,
): CitationValidationResult {
  if (input.output.citationMemoryIds.length === 0) {
    return {
      valid: false,
      reason: 'Output must include at least one citation id.',
    };
  }

  const allowedCitationIds = new Set(input.allowedCitationIds);
  const unknownCitation = input.output.citationMemoryIds.some((citationId) => !allowedCitationIds.has(citationId));
  if (unknownCitation) {
    return {
      valid: false,
      reason: 'Output cited memory ids outside the allowed evidence set.',
    };
  }

  const missingCitationMarker = input.output.citationMemoryIds.some(
    (citationId) => !input.output.answer.includes(`[${citationId}]`),
  );
  if (missingCitationMarker) {
    return {
      valid: false,
      reason: 'Answer text does not include required citation markers.',
    };
  }

  return { valid: true };
}

function buildRejectedOutput(): CitationConstrainedOutput {
  return {
    answer:
      'insufficient evidence: generated output was rejected because it was not grounded in supplied citations.',
    citationMemoryIds: [],
  };
}

export async function generateCitationConstrainedOutput(
  input: GenerateCitationConstrainedOutputInput,
): Promise<CitationConstrainedGenerationResult> {
  const prompt = buildCitationConstrainedPrompt(input);
  const output = await input.generate(prompt);
  const validation = validateCitationConstrainedOutput({
    allowedCitationIds: prompt.allowedCitationIds,
    output,
  });

  if (!validation.valid) {
    return {
      status: 'implemented',
      evidenceLabel: 'insufficient_evidence',
      prompt,
      output: buildRejectedOutput(),
      rejectionReason: validation.reason,
    };
  }

  return {
    status: 'implemented',
    evidenceLabel: 'sufficient_evidence',
    prompt,
    output,
  };
}
