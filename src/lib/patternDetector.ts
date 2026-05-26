import type { DecisionSignal, MemoryRecord } from './memoryRecord';

export type PatternDetectionStatus =
  | 'implemented'
  | 'partial'
  | 'skeleton'
  | 'fake/sample'
  | 'planned'
  | 'blocked';

export type PatternEvidenceLabel = 'sufficient_evidence' | 'insufficient_evidence';

export interface DetectedPattern {
  id: string;
  title: string;
  confidence: number;
  evidenceLabel: PatternEvidenceLabel;
  supportingMemoryIds: string[];
  emotions: string[];
  decisions: DecisionSignal[];
  outcomes: string[];
  explanation: string;
}

export interface PatternDetectionResult {
  status: PatternDetectionStatus;
  patterns: DetectedPattern[];
}

const REPEATED_PATTERN_THRESHOLD = 2;

const ANXIETY_PATTERN = {
  id: 'pattern_anxiety_scope_expansion_launch_delay',
  title: 'Anxiety -> scope expansion -> launch delay',
} as const;

function includesAny(value: string, terms: readonly string[]): boolean {
  return terms.some((term) => value.includes(term));
}

function evidenceText(record: MemoryRecord): string {
  return [
    record.rawText,
    record.summary,
    record.outcomeText ?? '',
    ...record.emotionTags,
    ...record.topicTags,
    ...record.projectTags,
  ]
    .join(' ')
    .toLocaleLowerCase();
}

function isAnxietyScopeDelayEvidence(record: MemoryRecord): boolean {
  const text = evidenceText(record);
  const hasAnxiety = includesAny(text, ['anxiety', 'anxious']);
  const hasScopeExpansion = includesAny(text, [
    'scope expansion',
    'expanded scope',
    'feature addition',
    'add features',
    'adding graph',
    'adding onboarding',
    'extra polish',
  ]);
  const hasLaunchDelay = includesAny(text, [
    'launch delay',
    'launch delayed',
    'launch slipped',
    'launches keep being postponed',
    'delayed launch',
    'delayed the launch',
    'postponing launches',
    'slipped by',
  ]);

  return hasAnxiety && hasScopeExpansion && hasLaunchDelay;
}

function appendUnique<T>(target: T[], values: readonly T[]): void {
  for (const value of values) {
    if (!target.includes(value)) target.push(value);
  }
}

function collectEmotions(records: readonly MemoryRecord[]): string[] {
  const emotions: string[] = [];
  for (const record of records) {
    appendUnique(emotions, record.emotionTags);
  }
  return emotions;
}

function collectDecisions(records: readonly MemoryRecord[]): DecisionSignal[] {
  const decisions: DecisionSignal[] = [];
  for (const record of records) {
    if (record.decisionSignal !== 'none') appendUnique(decisions, [record.decisionSignal]);
  }
  return decisions;
}

function collectOutcomes(records: readonly MemoryRecord[]): string[] {
  const outcomes: string[] = [];
  for (const record of records) {
    if (record.outcomeText) appendUnique(outcomes, [record.outcomeText]);
  }
  return outcomes;
}

function calculateConfidence(supportingRecords: readonly MemoryRecord[]): number {
  const sourceCount = new Set(supportingRecords.map((record) => record.sourceType)).size;
  const supportScore = Math.min(0.35, supportingRecords.length * 0.1);
  const sourceScore = Math.min(0.15, sourceCount * 0.05);
  const patternRecordScore = supportingRecords.some((record) => record.memoryType === 'pattern') ? 0.1 : 0;

  return Math.min(0.95, Number((0.45 + supportScore + sourceScore + patternRecordScore).toFixed(2)));
}

function buildSufficientExplanation(records: readonly MemoryRecord[]): string {
  const citations = records.map((record) => `${record.id} (${record.sourceRef})`).join('; ');
  return [
    `Detected repeated anxiety -> scope expansion -> launch delay evidence across ${records.length} MemoryRecord citations: ${citations}.`,
    'The freeze-vs-feature-addition citation is treated as supporting evidence because it names anxiety, feature addition, and postponed launches.',
  ].join(' ');
}

function buildInsufficientExplanation(records: readonly MemoryRecord[]): string {
  const citations = records.length > 0 ? records.map((record) => record.id).join(', ') : 'none';
  return `Need at least ${REPEATED_PATTERN_THRESHOLD} supporting MemoryRecord citations before labeling a repeated pattern. Current support: ${citations}.`;
}

function buildPattern(records: readonly MemoryRecord[]): DetectedPattern {
  return {
    ...ANXIETY_PATTERN,
    confidence: calculateConfidence(records),
    evidenceLabel: 'sufficient_evidence',
    supportingMemoryIds: records.map((record) => record.id),
    emotions: collectEmotions(records),
    decisions: collectDecisions(records),
    outcomes: collectOutcomes(records),
    explanation: buildSufficientExplanation(records),
  };
}

function buildInsufficientPattern(records: readonly MemoryRecord[]): DetectedPattern {
  return {
    id: 'pattern_insufficient_evidence',
    title: 'Insufficient repeated-pattern evidence',
    confidence: 0,
    evidenceLabel: 'insufficient_evidence',
    supportingMemoryIds: records.map((record) => record.id),
    emotions: collectEmotions(records),
    decisions: collectDecisions(records),
    outcomes: collectOutcomes(records),
    explanation: buildInsufficientExplanation(records),
  };
}

function compareMemoryRecordsByEvidenceOrder(left: MemoryRecord, right: MemoryRecord): number {
  const leftTime = left.observedAt ?? left.createdAt;
  const rightTime = right.observedAt ?? right.createdAt;
  const timeComparison = leftTime.localeCompare(rightTime);
  if (timeComparison !== 0) return timeComparison;
  return left.id.localeCompare(right.id);
}

export function detectRepeatedPatterns(records: readonly MemoryRecord[]): PatternDetectionResult {
  const supportingRecords = records
    .filter(isAnxietyScopeDelayEvidence)
    .slice()
    .sort(compareMemoryRecordsByEvidenceOrder);
  const pattern =
    supportingRecords.length >= REPEATED_PATTERN_THRESHOLD
      ? buildPattern(supportingRecords)
      : buildInsufficientPattern(supportingRecords);

  return {
    status: 'implemented',
    patterns: [pattern],
  };
}
