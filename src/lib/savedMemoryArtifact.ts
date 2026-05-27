import type { AskMyPastSelfAnswer } from './askMyPastSelf';
import type { DecisionReplayResult } from './decisionReplay';
import { normalizeMemoryRecord, type MemoryRecord, type MemoryRecordType } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import type { WeeklyReport } from './weeklyReport';

export type SavedMemoryArtifactKind = 'ask_answer' | 'decision_replay' | 'weekly_report';
export type SavedMemoryArtifactEvidenceLabel = 'sufficient_evidence' | 'insufficient_evidence';

export interface SavedMemoryArtifact {
  id: string;
  kind: SavedMemoryArtifactKind;
  title: string;
  body: string;
  createdAt: string;
  observedAt: string;
  evidenceLabel: SavedMemoryArtifactEvidenceLabel;
  confidence: number;
  citationMemoryIds: string[];
  graphHighlightIds: string[];
  privacyScope: 'private';
  queryId?: string;
  metadata: Record<string, string | number | string[] | undefined>;
}

export interface CreateSavedAskArtifactInput {
  question: string;
  answer: AskMyPastSelfAnswer;
  queryId?: string;
  createdAt?: string;
}

export interface CreateSavedDecisionReplayArtifactInput {
  replay: DecisionReplayResult;
  queryId?: string;
  createdAt?: string;
}

export interface CreateSavedWeeklyReportArtifactInput {
  weeklyReport: WeeklyReport;
  createdAt?: string;
}

export interface SaveArtifactAsMemoryRecordInput {
  store: MemoryStore;
  userId: string;
  artifact: SavedMemoryArtifact;
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `sha-${(hash >>> 0).toString(36).padStart(7, '0')}`;
}

function artifactId(kind: SavedMemoryArtifactKind, basis: readonly string[]): string {
  return `artifact_${kind}_${stableHash([kind, ...basis].join('\u001f'))}`;
}

function observedAtFromCreatedAt(createdAt: string): string {
  return createdAt.slice(0, 10);
}

function sortedCitationIds(citationMemoryIds: readonly string[]): string[] {
  return [...citationMemoryIds].sort((left, right) => left.localeCompare(right));
}

function artifactMemoryType(kind: SavedMemoryArtifactKind): MemoryRecordType {
  if (kind === 'decision_replay') return 'decision';
  if (kind === 'weekly_report') return 'pattern';
  return 'reflection';
}

function artifactTopicTags(kind: SavedMemoryArtifactKind): string[] {
  if (kind === 'decision_replay') return ['saved artifact', 'decision replay'];
  if (kind === 'weekly_report') return ['saved artifact', 'weekly report'];
  return ['saved artifact', 'ask my past self'];
}

function citationLine(citationMemoryIds: readonly string[]): string {
  return `Citations: ${sortedCitationIds(citationMemoryIds).join(', ')}`;
}

function createArtifact(input: Omit<SavedMemoryArtifact, 'privacyScope'>): SavedMemoryArtifact {
  return {
    ...input,
    privacyScope: 'private',
  };
}

export function createSavedAskArtifact(input: CreateSavedAskArtifactInput): SavedMemoryArtifact {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const title = `Ask My Past Self: ${input.question}`;
  const body = [
    `Question: ${input.question}`,
    `Answer: ${input.answer.answer}`,
    `Recommendation: ${input.answer.recommendation}`,
    citationLine(input.answer.citationMemoryIds),
    `Evidence label: ${input.answer.evidenceLabel}`,
    `Confidence: ${input.answer.confidence}`,
  ].join('\n');

  return createArtifact({
    id: artifactId('ask_answer', [input.question, input.answer.answer, createdAt]),
    kind: 'ask_answer',
    title,
    body,
    createdAt,
    observedAt: observedAtFromCreatedAt(createdAt),
    evidenceLabel: input.answer.evidenceLabel,
    confidence: input.answer.confidence,
    citationMemoryIds: input.answer.citationMemoryIds,
    graphHighlightIds: input.answer.graphHighlightIds,
    queryId: input.queryId,
    metadata: {
      question: input.question,
      recommendation: input.answer.recommendation,
      citationCount: input.answer.citationMemoryIds.length,
    },
  });
}

export function createSavedDecisionReplayArtifact(
  input: CreateSavedDecisionReplayArtifactInput,
): SavedMemoryArtifact {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const body = [
    `Decision: ${input.replay.currentDecision.prompt}`,
    `Recommendation: ${input.replay.recommendation}`,
    `Uncertainty: ${input.replay.uncertainty}`,
    `Choices: ${input.replay.currentDecision.choices.join(', ')}`,
    `Outcomes: ${input.replay.outcomes.join(', ')}`,
    citationLine(input.replay.citationMemoryIds),
    `Evidence label: ${input.replay.evidenceLabel}`,
    `Confidence: ${input.replay.confidence}`,
  ].join('\n');

  return createArtifact({
    id: artifactId('decision_replay', [input.replay.currentDecision.id, input.replay.recommendation, createdAt]),
    kind: 'decision_replay',
    title: `Decision Replay: ${input.replay.currentDecision.prompt}`,
    body,
    createdAt,
    observedAt: observedAtFromCreatedAt(createdAt),
    evidenceLabel: input.replay.evidenceLabel,
    confidence: input.replay.confidence,
    citationMemoryIds: input.replay.citationMemoryIds,
    graphHighlightIds: input.replay.graphHighlightIds,
    queryId: input.queryId,
    metadata: {
      currentDecisionId: input.replay.currentDecision.id,
      choices: input.replay.currentDecision.choices,
      citationCount: input.replay.citationMemoryIds.length,
    },
  });
}

export function createSavedWeeklyReportArtifact(
  input: CreateSavedWeeklyReportArtifactInput,
): SavedMemoryArtifact {
  const createdAt = input.createdAt ?? input.weeklyReport.generatedAt;
  const windowLabel = `${input.weeklyReport.window.startDate} to ${input.weeklyReport.window.endDate}`;
  const topEmotions = input.weeklyReport.aggregates.emotions.map((emotion) => `${emotion.value}(${emotion.count})`);
  const topProjects = input.weeklyReport.aggregates.projects.map((project) => `${project.value}(${project.count})`);
  const body = [
    `Weekly report window: ${windowLabel}`,
    `Included memories: ${input.weeklyReport.includedMemoryIds.join(', ')}`,
    `Top emotions: ${topEmotions.join(', ') || 'none'}`,
    `Top projects: ${topProjects.join(', ') || 'none'}`,
    `Pattern insights: ${input.weeklyReport.patternInsights.map((pattern) => pattern.title).join(', ') || 'none'}`,
    `Evidence label: ${input.weeklyReport.evidenceLabel}`,
  ].join('\n');

  return createArtifact({
    id: artifactId('weekly_report', [input.weeklyReport.id, createdAt]),
    kind: 'weekly_report',
    title: `Weekly Report: ${windowLabel}`,
    body,
    createdAt,
    observedAt: observedAtFromCreatedAt(createdAt),
    evidenceLabel: input.weeklyReport.evidenceLabel,
    confidence:
      input.weeklyReport.patternInsights.reduce((total, pattern) => total + pattern.confidence, 0) /
        Math.max(1, input.weeklyReport.patternInsights.length),
    citationMemoryIds: input.weeklyReport.includedMemoryIds,
    graphHighlightIds: input.weeklyReport.includedMemoryIds.map((memoryId) => `memory:${memoryId}`),
    metadata: {
      startDate: input.weeklyReport.window.startDate,
      endDate: input.weeklyReport.window.endDate,
      totalMemoryRecords: input.weeklyReport.totalMemoryRecords,
      reportId: input.weeklyReport.id,
    },
  });
}

export function savedArtifactToMemoryRecord(artifact: SavedMemoryArtifact): MemoryRecord {
  return normalizeMemoryRecord({
    id: `mem_api_${artifact.id}`,
    sourceType: 'api',
    sourceRef: `personal-memory-ai://saved-artifacts/${artifact.id}`,
    createdAt: artifact.createdAt,
    observedAt: artifact.observedAt,
    rawText: [
      artifact.body,
      `Artifact: ${artifact.id}`,
      `Artifact kind: ${artifact.kind}`,
      citationLine(artifact.citationMemoryIds),
      `Graph highlights: ${artifact.graphHighlightIds.join(', ')}`,
    ].join('\n'),
    summary: artifact.title,
    memoryType: artifactMemoryType(artifact.kind),
    topicTags: artifactTopicTags(artifact.kind),
    projectTags: ['personal-memory-ai'],
    decisionSignal: artifact.kind === 'decision_replay' ? 'chosen' : 'none',
    outcomeText:
      artifact.kind === 'weekly_report'
        ? `Saved weekly report with ${artifact.citationMemoryIds.length} cited memories.`
        : `Saved ${artifact.kind.replace('_', ' ')} with ${artifact.citationMemoryIds.length} cited memories.`,
    extractionStatus: 'ready',
  });
}

export async function saveArtifactAsMemoryRecord(
  input: SaveArtifactAsMemoryRecordInput,
): Promise<MemoryRecord> {
  const record = savedArtifactToMemoryRecord(input.artifact);
  await input.store.create(input.userId, record);
  return record;
}
