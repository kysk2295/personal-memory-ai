import type { MemoryRecord, MemorySourceType } from './memoryRecord';
import type { DetectedPattern, PatternDetectionStatus, PatternEvidenceLabel } from './patternDetector';

export type DecisionReplayStatus = PatternDetectionStatus;

export interface CurrentDecision {
  id: string;
  prompt: string;
  emotions: string[];
  choices: string[];
  topicTags: string[];
}

export interface DecisionReplayInput {
  currentDecision: CurrentDecision;
  memories: readonly MemoryRecord[];
  patterns: readonly DetectedPattern[];
}

export interface DecisionReplayCitation {
  citationId: string;
  sourceType: MemorySourceType;
  sourceRef: string;
  observedAt?: string;
  text: string;
  graphHighlightIds: string[];
}

export interface SimilarPastDecision {
  memoryId: string;
  summary: string;
  emotions: string[];
  choices: string[];
  outcome?: string;
  citations: DecisionReplayCitation[];
  graphHighlightIds: string[];
}

export interface DecisionReplayPatternSummary {
  id: string;
  title: string;
  emotions: string[];
  choices: string[];
  outcomes: string[];
  explanation: string;
}

export interface DecisionReplayResult {
  status: DecisionReplayStatus;
  evidenceLabel: PatternEvidenceLabel;
  currentDecision: CurrentDecision;
  similarPastDecisions: SimilarPastDecision[];
  emotions: string[];
  choices: string[];
  outcomes: string[];
  citations: DecisionReplayCitation[];
  pattern?: DecisionReplayPatternSummary;
  recommendation: string;
  uncertainty: string;
  confidence: number;
  citationMemoryIds: string[];
  graphHighlightIds: string[];
}

const SIMILAR_DECISION_THRESHOLD = 2;
const OUTCOME_CITATION_THRESHOLD = 2;
const SUFFICIENT_RECOMMENDATION =
  'Based on cited memories, freeze Decision Replay scope for review instead of adding more polish.';
const INSUFFICIENT_RECOMMENDATION =
  'Insufficient cited personal memory to recommend a choice. Import or capture more relevant decisions first.';

function appendUnique(target: string[], values: readonly string[]): void {
  for (const value of values) {
    if (!target.includes(value)) target.push(value);
  }
}

function slugifyGraphValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function graphIdsForValues(prefix: string, values: readonly string[]): string[] {
  return values.map((value) => `${prefix}:${slugifyGraphValue(value)}`);
}

function compareMemoryRecordsByEvidenceOrder(left: MemoryRecord, right: MemoryRecord): number {
  const leftTime = left.observedAt ?? left.createdAt;
  const rightTime = right.observedAt ?? right.createdAt;
  const timeComparison = leftTime.localeCompare(rightTime);
  if (timeComparison !== 0) return timeComparison;
  return left.id.localeCompare(right.id);
}

function pickPrimaryPattern(patterns: readonly DetectedPattern[]): DetectedPattern | undefined {
  const sufficientPattern = patterns.find((pattern) => pattern.evidenceLabel === 'sufficient_evidence');
  return sufficientPattern ?? patterns[0];
}

function buildMemoryLookup(memories: readonly MemoryRecord[]): Map<string, MemoryRecord> {
  return new Map(memories.map((memory) => [memory.id, memory]));
}

function collectPatternMemories(
  pattern: DetectedPattern | undefined,
  memories: readonly MemoryRecord[],
): MemoryRecord[] {
  if (!pattern) return [];

  const memoryById = buildMemoryLookup(memories);
  return pattern.supportingMemoryIds
    .map((memoryId) => memoryById.get(memoryId))
    .filter((memory): memory is MemoryRecord => Boolean(memory))
    .sort(compareMemoryRecordsByEvidenceOrder);
}

function buildCitation(currentDecisionId: string, memory: MemoryRecord): DecisionReplayCitation {
  const outcome = memory.outcomeText ? ` Outcome: ${memory.outcomeText}` : '';
  return {
    citationId: memory.id,
    sourceType: memory.sourceType,
    sourceRef: memory.sourceRef,
    observedAt: memory.observedAt,
    text: `${memory.summary}${outcome} [${memory.id}]`,
    graphHighlightIds: buildPastDecisionGraphHighlightIds(currentDecisionId, memory),
  };
}

function buildPastDecisionGraphHighlightIds(currentDecisionId: string, memory: MemoryRecord): string[] {
  const graphHighlightIds = [`decision:${currentDecisionId}`, `memory:${memory.id}`];
  if (memory.decisionSignal !== 'none') {
    appendUnique(graphHighlightIds, [`decision:${slugifyGraphValue(memory.decisionSignal)}`]);
  }
  if (memory.outcomeText) {
    appendUnique(graphHighlightIds, [`outcome:${slugifyGraphValue(memory.outcomeText)}`]);
  }
  return graphHighlightIds;
}

function buildSimilarPastDecision(currentDecisionId: string, memory: MemoryRecord): SimilarPastDecision {
  return {
    memoryId: memory.id,
    summary: memory.summary,
    emotions: memory.emotionTags,
    choices: memory.decisionSignal === 'none' ? [] : [memory.decisionSignal],
    outcome: memory.outcomeText,
    citations: [buildCitation(currentDecisionId, memory)],
    graphHighlightIds: buildPastDecisionGraphHighlightIds(currentDecisionId, memory),
  };
}

function buildCurrentDecisionGraphHighlightIds(currentDecision: CurrentDecision): string[] {
  return [
    `decision:${currentDecision.id}`,
    ...graphIdsForValues('emotion', currentDecision.emotions),
    ...graphIdsForValues('choice', currentDecision.choices),
    ...graphIdsForValues('topic', currentDecision.topicTags),
  ];
}

function buildPatternSummary(pattern: DetectedPattern): DecisionReplayPatternSummary {
  return {
    id: pattern.id,
    title: pattern.title,
    emotions: pattern.emotions,
    choices: pattern.decisions,
    outcomes: pattern.outcomes,
    explanation: pattern.explanation,
  };
}

function collectEmotions(memories: readonly MemoryRecord[]): string[] {
  const emotions: string[] = [];
  for (const memory of memories) {
    appendUnique(emotions, memory.emotionTags);
  }
  return emotions;
}

function collectChoices(memories: readonly MemoryRecord[]): string[] {
  const choices: string[] = [];
  for (const memory of memories) {
    if (memory.decisionSignal !== 'none') appendUnique(choices, [memory.decisionSignal]);
  }
  return choices;
}

function collectOutcomes(memories: readonly MemoryRecord[]): string[] {
  const outcomes: string[] = [];
  for (const memory of memories) {
    if (memory.outcomeText) appendUnique(outcomes, [memory.outcomeText]);
  }
  return outcomes;
}

function countOutcomeCitations(memories: readonly MemoryRecord[]): number {
  return memories.filter((memory) => Boolean(memory.outcomeText)).length;
}

function buildGraphHighlightIds(
  currentDecision: CurrentDecision,
  similarPastDecisions: readonly SimilarPastDecision[],
  pattern: DetectedPattern | undefined,
  hasSufficientEvidence: boolean,
): string[] {
  const graphHighlightIds = buildCurrentDecisionGraphHighlightIds(currentDecision);
  for (const pastDecision of similarPastDecisions) {
    appendUnique(graphHighlightIds, [`memory:${pastDecision.memoryId}`]);
  }
  for (const pastDecision of similarPastDecisions) {
    appendUnique(
      graphHighlightIds,
      pastDecision.graphHighlightIds.filter((highlightId) => highlightId.startsWith('decision:')),
    );
  }
  for (const pastDecision of similarPastDecisions) {
    appendUnique(
      graphHighlightIds,
      pastDecision.graphHighlightIds.filter((highlightId) => highlightId.startsWith('outcome:')),
    );
  }
  if (hasSufficientEvidence && pattern) {
    appendUnique(graphHighlightIds, [`pattern:${pattern.id}`]);
  }
  return graphHighlightIds;
}

function buildUncertainty(
  hasSufficientEvidence: boolean,
  similarPastDecisionCount: number,
  outcomeCitationCount: number,
): string {
  if (!hasSufficientEvidence) {
    return `Need at least ${SIMILAR_DECISION_THRESHOLD} similar past decision citations and ${OUTCOME_CITATION_THRESHOLD} cited past outcomes with a sufficient pattern before recommending. Current cited support: ${similarPastDecisionCount}; cited outcomes: ${outcomeCitationCount}.`;
  }

  return 'Recommendation is bounded to cited personal memories and should not be treated as general advice.';
}

export function replayDecision(input: DecisionReplayInput): DecisionReplayResult {
  const primaryPattern = pickPrimaryPattern(input.patterns);
  const supportingMemories = collectPatternMemories(primaryPattern, input.memories);
  const similarPastDecisions = supportingMemories.map((memory) =>
    buildSimilarPastDecision(input.currentDecision.id, memory),
  );
  const citationMemoryIds = similarPastDecisions.map((decision) => decision.memoryId);
  const citations = supportingMemories.map((memory) => buildCitation(input.currentDecision.id, memory));
  const outcomeCitationCount = countOutcomeCitations(supportingMemories);
  const hasSufficientEvidence =
    primaryPattern?.evidenceLabel === 'sufficient_evidence' &&
    citationMemoryIds.length >= SIMILAR_DECISION_THRESHOLD &&
    outcomeCitationCount >= OUTCOME_CITATION_THRESHOLD;

  return {
    status: 'implemented',
    evidenceLabel: hasSufficientEvidence ? 'sufficient_evidence' : 'insufficient_evidence',
    currentDecision: input.currentDecision,
    similarPastDecisions,
    emotions: collectEmotions(supportingMemories),
    choices: collectChoices(supportingMemories),
    outcomes: collectOutcomes(supportingMemories),
    citations,
    pattern: primaryPattern && hasSufficientEvidence ? buildPatternSummary(primaryPattern) : undefined,
    recommendation: hasSufficientEvidence ? SUFFICIENT_RECOMMENDATION : INSUFFICIENT_RECOMMENDATION,
    uncertainty: buildUncertainty(hasSufficientEvidence, citationMemoryIds.length, outcomeCitationCount),
    confidence: hasSufficientEvidence ? primaryPattern.confidence : 0,
    citationMemoryIds,
    graphHighlightIds: buildGraphHighlightIds(
      input.currentDecision,
      similarPastDecisions,
      primaryPattern,
      hasSufficientEvidence,
    ),
  };
}
