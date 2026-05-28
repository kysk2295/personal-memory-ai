import type { AskMyPastSelfAnswer } from './askMyPastSelf';
import type { DecisionReplayResult } from './decisionReplay';
import { normalizeMemoryRecord, type MemoryRecord, type MemoryRecordType } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import type { WeeklyReport } from './weeklyReport';

export type SavedMemoryArtifactKind = 'ask_answer' | 'decision_replay' | 'weekly_report' | 'memory_session';
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

export interface CreateSavedMemorySessionArtifactInput {
  sourceMemoryId: string;
  relatedMemoryIds: string[];
  askCitationMemoryIds: string[];
  replayCitationMemoryIds: string[];
  weeklyCitationMemoryIds: string[];
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
  return Array.from(new Set(citationMemoryIds)).sort((left, right) => left.localeCompare(right));
}

function artifactMemoryType(kind: SavedMemoryArtifactKind): MemoryRecordType {
  if (kind === 'decision_replay') return 'decision';
  if (kind === 'weekly_report') return 'pattern';
  return 'reflection';
}

function artifactTopicTags(kind: SavedMemoryArtifactKind): string[] {
  if (kind === 'decision_replay') return ['saved artifact', 'decision replay', '결정 되짚기'];
  if (kind === 'weekly_report') return ['saved artifact', 'weekly report', '주간 패턴'];
  if (kind === 'memory_session') return ['saved artifact', 'memory session', '기억 세션'];
  return ['saved artifact', 'ask answer', '과거의 나에게 묻기'];
}

function citationLine(citationMemoryIds: readonly string[]): string {
  return `인용: ${sortedCitationIds(citationMemoryIds).join(', ')}`;
}

function createArtifact(input: Omit<SavedMemoryArtifact, 'privacyScope'>): SavedMemoryArtifact {
  return {
    ...input,
    privacyScope: 'private',
  };
}

export function createSavedAskArtifact(input: CreateSavedAskArtifactInput): SavedMemoryArtifact {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const title = `과거의 나에게 묻기: ${input.question}`;
  const body = [
    `질문: ${input.question}`,
    `답변: ${input.answer.answer}`,
    `추천: ${input.answer.recommendation}`,
    citationLine(input.answer.citationMemoryIds),
    `근거 상태: ${input.answer.evidenceLabel}`,
    `신뢰도: ${input.answer.confidence}`,
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
    `결정: ${input.replay.currentDecision.prompt}`,
    `추천: ${input.replay.recommendation}`,
    `불확실성: ${input.replay.uncertainty}`,
    `선택지: ${input.replay.currentDecision.choices.join(', ')}`,
    `결과: ${input.replay.outcomes.join(', ')}`,
    citationLine(input.replay.citationMemoryIds),
    `근거 상태: ${input.replay.evidenceLabel}`,
    `신뢰도: ${input.replay.confidence}`,
  ].join('\n');

  return createArtifact({
    id: artifactId('decision_replay', [input.replay.currentDecision.id, input.replay.recommendation, createdAt]),
    kind: 'decision_replay',
    title: `결정 되짚기: ${input.replay.currentDecision.prompt}`,
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
  const windowLabel = `${input.weeklyReport.window.startDate} ~ ${input.weeklyReport.window.endDate}`;
  const topEmotions = input.weeklyReport.aggregates.emotions.map((emotion) => `${emotion.value}(${emotion.count})`);
  const topProjects = input.weeklyReport.aggregates.projects.map((project) => `${project.value}(${project.count})`);
  const body = [
    `주간 범위: ${windowLabel}`,
    `포함된 기억: ${input.weeklyReport.includedMemoryIds.join(', ')}`,
    `주요 감정: ${topEmotions.join(', ') || '없음'}`,
    `주요 프로젝트: ${topProjects.join(', ') || '없음'}`,
    `패턴 인사이트: ${input.weeklyReport.patternInsights.map((pattern) => pattern.title).join(', ') || '없음'}`,
    `근거 상태: ${input.weeklyReport.evidenceLabel}`,
  ].join('\n');

  return createArtifact({
    id: artifactId('weekly_report', [input.weeklyReport.id, createdAt]),
    kind: 'weekly_report',
    title: `주간 패턴: ${windowLabel}`,
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

export function createSavedMemorySessionArtifact(input: CreateSavedMemorySessionArtifactInput): SavedMemoryArtifact {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const citationMemoryIds = sortedCitationIds([
    input.sourceMemoryId,
    ...input.relatedMemoryIds,
    ...input.askCitationMemoryIds,
    ...input.replayCitationMemoryIds,
    ...input.weeklyCitationMemoryIds,
  ]);
  const body = [
    `출발 기억: ${input.sourceMemoryId}`,
    `연관 기억: ${input.relatedMemoryIds.join(', ')}`,
    `묻기 인용: ${input.askCitationMemoryIds.join(', ')}`,
    `결정 되짚기 인용: ${input.replayCitationMemoryIds.join(', ')}`,
    `주간 패턴 인용: ${input.weeklyCitationMemoryIds.join(', ')}`,
    citationLine(citationMemoryIds),
    `근거 상태: sufficient_evidence`,
  ].join('\n');

  return createArtifact({
    id: artifactId('memory_session', [input.sourceMemoryId, ...citationMemoryIds, createdAt]),
    kind: 'memory_session',
    title: `기억 세션: ${input.sourceMemoryId}`,
    body,
    createdAt,
    observedAt: observedAtFromCreatedAt(createdAt),
    evidenceLabel: 'sufficient_evidence',
    confidence: citationMemoryIds.length ? 0.86 : 0,
    citationMemoryIds,
    graphHighlightIds: citationMemoryIds.map((memoryId) => `memory:${memoryId}`),
    metadata: {
      sourceMemoryId: input.sourceMemoryId,
      relatedMemoryIds: input.relatedMemoryIds,
      relatedMemoryCount: input.relatedMemoryIds.length,
      askCitationCount: input.askCitationMemoryIds.length,
      replayCitationCount: input.replayCitationMemoryIds.length,
      weeklyCitationCount: input.weeklyCitationMemoryIds.length,
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
      `아티팩트: ${artifact.id}`,
      `아티팩트 종류: ${artifact.kind}`,
      citationLine(artifact.citationMemoryIds),
      `그래프 하이라이트: ${artifact.graphHighlightIds.join(', ')}`,
    ].join('\n'),
    summary: artifact.title,
    memoryType: artifactMemoryType(artifact.kind),
    topicTags: artifactTopicTags(artifact.kind),
    projectTags: ['personal-memory-ai'],
    decisionSignal: artifact.kind === 'decision_replay' ? 'chosen' : 'none',
    outcomeText:
      artifact.kind === 'weekly_report'
        ? `주간 패턴을 ${artifact.citationMemoryIds.length}개의 인용 기억과 함께 저장했다.`
        : `${artifact.kind.replace('_', ' ')} 결과를 ${artifact.citationMemoryIds.length}개의 인용 기억과 함께 저장했다.`,
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
