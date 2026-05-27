import type { MemoryRecord, MemorySourceType } from './memoryRecord';
import type { DetectedPattern, PatternDetectionStatus, PatternEvidenceLabel } from './patternDetector';

export type AskMyPastSelfStatus = PatternDetectionStatus;

export interface AskMyPastSelfInput {
  question: string;
  memories: readonly MemoryRecord[];
  patterns: readonly DetectedPattern[];
}

export interface AskMyPastSelfEvidenceBullet {
  citationId: string;
  sourceType: MemorySourceType;
  sourceRef: string;
  observedAt?: string;
  text: string;
  graphHighlightIds: string[];
}

export interface AskMyPastSelfAnswer {
  status: AskMyPastSelfStatus;
  evidenceLabel: PatternEvidenceLabel;
  answer: string;
  recommendation: string;
  evidenceBullets: AskMyPastSelfEvidenceBullet[];
  citationMemoryIds: string[];
  confidence: number;
  graphHighlightIds: string[];
}

const SUFFICIENT_RECOMMENDATION = '이번에는 기능을 더 넣기보다 freeze하고 사용자 피드백을 먼저 받으세요.';
const MIN_REQUIRED_CITATIONS = 2;
const MIN_REQUIRED_SOURCE_TYPES = 2;
const INSUFFICIENT_RECOMMENDATION =
  '근거 부족: 개인 기억 citation이 2개 이상이고 서로 다른 source 2개 이상에서 반복 확인되기 전에는 추천하지 않습니다.';

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

function createQuestionHighlightId(question: string): string {
  return `question:${slugifyGraphValue(question)}`;
}

function createOutcomeHighlightId(outcomeText: string): string {
  return `outcome:${slugifyGraphValue(outcomeText)}`;
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

function collectPatternMemoryEvidence(
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

function buildEvidenceText(memory: MemoryRecord): string {
  const source = memory.observedAt ? `${memory.sourceType} ${memory.observedAt}` : memory.sourceType;
  const outcome = memory.outcomeText ? ` Outcome: ${memory.outcomeText}` : '';
  return `${source}: ${memory.summary}${outcome} [${memory.id}]`;
}

function buildMemoryGraphHighlightIds(questionHighlightId: string, memory: MemoryRecord): string[] {
  const graphHighlightIds = [questionHighlightId, `memory:${memory.id}`];
  appendUnique(
    graphHighlightIds,
    memory.emotionTags.map((emotion) => `emotion:${slugifyGraphValue(emotion)}`),
  );
  if (memory.decisionSignal !== 'none') {
    appendUnique(graphHighlightIds, [`decision:${slugifyGraphValue(memory.decisionSignal)}`]);
  }
  if (memory.outcomeText) {
    appendUnique(graphHighlightIds, [createOutcomeHighlightId(memory.outcomeText)]);
  }
  return graphHighlightIds;
}

function buildEvidenceBullets(
  questionHighlightId: string,
  supportingMemories: readonly MemoryRecord[],
): AskMyPastSelfEvidenceBullet[] {
  return supportingMemories.map((memory) => ({
    citationId: memory.id,
    sourceType: memory.sourceType,
    sourceRef: memory.sourceRef,
    observedAt: memory.observedAt,
    text: buildEvidenceText(memory),
    graphHighlightIds: buildMemoryGraphHighlightIds(questionHighlightId, memory),
  }));
}

function buildGraphHighlightIds(
  questionHighlightId: string,
  evidenceBullets: readonly AskMyPastSelfEvidenceBullet[],
  pattern: DetectedPattern | undefined,
): string[] {
  const graphHighlightIds = [questionHighlightId];
  for (const bullet of evidenceBullets) {
    appendUnique(
      graphHighlightIds,
      bullet.graphHighlightIds.filter((highlightId) => highlightId !== questionHighlightId),
    );
  }
  if (pattern?.evidenceLabel === 'sufficient_evidence') {
    appendUnique(graphHighlightIds, [`pattern:${pattern.id}`]);
  }
  return graphHighlightIds;
}

function buildSufficientAnswer(
  question: string,
  recommendation: string,
  evidenceBullets: readonly AskMyPastSelfEvidenceBullet[],
): string {
  const citations = evidenceBullets.map((bullet) => bullet.citationId).join(', ');
  return [
    `질문: ${question}`,
    `추천: ${recommendation}`,
    `근거: ${citations}.`,
    '이 답변은 과거 기억에서 반복된 anxiety -> feature addition/scope expansion -> launch delay 흐름에만 근거합니다.',
  ].join(' ');
}

function buildInsufficientAnswer(
  question: string,
  evidenceBullets: readonly AskMyPastSelfEvidenceBullet[],
): string {
  const citations =
    evidenceBullets.length > 0 ? evidenceBullets.map((bullet) => bullet.citationId).join(', ') : 'none';
  const sourceTypes = new Set(evidenceBullets.map((bullet) => bullet.sourceType)).size;
  return [
    `질문: ${question}`,
    'insufficient evidence: 반복 근거가 기준에 미달합니다.',
    `현재 확인된 citation ids: ${citations}.`,
    `현재 source 수: ${sourceTypes}; 필요 최소치: citation ${MIN_REQUIRED_CITATIONS}개 / source ${MIN_REQUIRED_SOURCE_TYPES}개.`,
    'No generic advice was generated.',
  ].join(' ');
}

function hasSufficientAskEvidence(
  pattern: DetectedPattern | undefined,
  evidenceBullets: readonly AskMyPastSelfEvidenceBullet[],
): boolean {
  if (pattern?.evidenceLabel !== 'sufficient_evidence') return false;
  if (evidenceBullets.length < MIN_REQUIRED_CITATIONS) return false;
  const distinctSourceTypes = new Set(evidenceBullets.map((bullet) => bullet.sourceType)).size;
  return distinctSourceTypes >= MIN_REQUIRED_SOURCE_TYPES;
}

export function askMyPastSelf(input: AskMyPastSelfInput): AskMyPastSelfAnswer {
  const primaryPattern = pickPrimaryPattern(input.patterns);
  const supportingMemories = collectPatternMemoryEvidence(primaryPattern, input.memories);
  const questionHighlightId = createQuestionHighlightId(input.question);
  const evidenceBullets = buildEvidenceBullets(questionHighlightId, supportingMemories);
  const citationMemoryIds = evidenceBullets.map((bullet) => bullet.citationId);
  const graphHighlightIds = buildGraphHighlightIds(questionHighlightId, evidenceBullets, primaryPattern);
  const sufficientPattern = primaryPattern?.evidenceLabel === 'sufficient_evidence' ? primaryPattern : undefined;
  const hasSufficientEvidence = hasSufficientAskEvidence(sufficientPattern, evidenceBullets);
  const recommendation = hasSufficientEvidence ? SUFFICIENT_RECOMMENDATION : INSUFFICIENT_RECOMMENDATION;

  return {
    status: 'implemented',
    evidenceLabel: hasSufficientEvidence ? 'sufficient_evidence' : 'insufficient_evidence',
    answer: hasSufficientEvidence
      ? buildSufficientAnswer(input.question, recommendation, evidenceBullets)
      : buildInsufficientAnswer(input.question, evidenceBullets),
    recommendation,
    evidenceBullets,
    citationMemoryIds,
    confidence: sufficientPattern && hasSufficientEvidence ? sufficientPattern.confidence : 0,
    graphHighlightIds,
  };
}
