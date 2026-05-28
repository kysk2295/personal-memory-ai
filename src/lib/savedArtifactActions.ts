import type { AskMyPastSelfAnswer } from './askMyPastSelf';
import type { DecisionReplayResult } from './decisionReplay';
import {
  createSavedAskArtifact,
  createSavedDecisionReplayArtifact,
  createSavedWeeklyReportArtifact,
  savedArtifactToMemoryRecord,
  type SavedMemoryArtifact,
  type SavedMemoryArtifactKind,
} from './savedMemoryArtifact';
import type { WeeklyReport } from './weeklyReport';

export type SavedArtifactActionState = 'ready' | 'saved';

export interface SavedArtifactAction {
  id: string;
  kind: SavedMemoryArtifactKind;
  label: string;
  savedLabel: string;
  artifact: SavedMemoryArtifact;
  futureMemoryId: string;
  sourceRef: string;
  citationCount: number;
  endpoint: '/api/capture';
  method: 'POST';
  initialState: SavedArtifactActionState;
}

export interface BuildSavedArtifactActionsInput {
  askQuestion: string;
  ask: AskMyPastSelfAnswer;
  replay: DecisionReplayResult;
  weeklyReport: WeeklyReport;
  createdAt?: string;
}

function actionForArtifact(
  artifact: SavedMemoryArtifact,
  label: string,
  savedLabel: string,
): SavedArtifactAction {
  const futureMemory = savedArtifactToMemoryRecord(artifact);
  return {
    id: `save:${artifact.id}`,
    kind: artifact.kind,
    label,
    savedLabel,
    artifact,
    futureMemoryId: futureMemory.id,
    sourceRef: futureMemory.sourceRef,
    citationCount: artifact.citationMemoryIds.length,
    endpoint: '/api/capture',
    method: 'POST',
    initialState: 'ready',
  };
}

export function buildSavedArtifactActions(input: BuildSavedArtifactActionsInput): SavedArtifactAction[] {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const askArtifact = createSavedAskArtifact({
    question: input.askQuestion,
    answer: input.ask,
    queryId: 'ask_current_more_features',
    createdAt,
  });
  const replayArtifact = createSavedDecisionReplayArtifact({
    replay: input.replay,
    queryId: input.replay.currentDecision.id,
    createdAt,
  });
  const reportArtifact = createSavedWeeklyReportArtifact({
    weeklyReport: input.weeklyReport,
    createdAt,
  });

  return [
    actionForArtifact(askArtifact, '답변 저장', '답변 저장됨'),
    actionForArtifact(replayArtifact, '결정 기록 저장', '결정 기록 저장됨'),
    actionForArtifact(reportArtifact, '주간 패턴 저장', '주간 패턴 저장됨'),
  ];
}
