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

const SUFFICIENT_RECOMMENDATION = '이번에는 기능을 더 넣기보다 범위를 고정하고 사용자 피드백을 먼저 받으세요.';
const INSUFFICIENT_RECOMMENDATION =
  '아직 답변할 만큼의 개인 기억 근거가 부족합니다. 관련 기억을 더 가져온 뒤 다시 물어보세요.';

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
    '이 답변은 과거 기억에서 반복된 불안 -> 기능 추가/범위 확장 -> 출시 지연 흐름에만 근거합니다.',
  ].join(' ');
}

function buildInsufficientAnswer(
  question: string,
  evidenceBullets: readonly AskMyPastSelfEvidenceBullet[],
): string {
  const citations =
    evidenceBullets.length > 0 ? evidenceBullets.map((bullet) => bullet.citationId).join(', ') : 'none';
  return [
    `질문: ${question}`,
    `근거 부족: 답변을 만들 개인 기억 인용이 부족합니다.`,
    `현재 확인된 인용 id: ${citations}.`,
    '일반 조언은 생성하지 않았습니다.',
  ].join(' ');
}

export function askMyPastSelf(input: AskMyPastSelfInput): AskMyPastSelfAnswer {
  const primaryPattern = pickPrimaryPattern(input.patterns);
  const supportingMemories = collectPatternMemoryEvidence(primaryPattern, input.memories);
  const questionHighlightId = createQuestionHighlightId(input.question);
  const evidenceBullets = buildEvidenceBullets(questionHighlightId, supportingMemories);
  const citationMemoryIds = evidenceBullets.map((bullet) => bullet.citationId);
  const graphHighlightIds = buildGraphHighlightIds(questionHighlightId, evidenceBullets, primaryPattern);
  const sufficientPattern = primaryPattern?.evidenceLabel === 'sufficient_evidence' ? primaryPattern : undefined;
  const hasSufficientEvidence = Boolean(sufficientPattern) && citationMemoryIds.length > 0;
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
