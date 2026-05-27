import { askMyPastSelf, type AskMyPastSelfAnswer } from './askMyPastSelf';
import { replayDecision, type CurrentDecision, type DecisionReplayResult } from './decisionReplay';
import { buildGraphEvidence, type GraphEvidencePayload } from './graphEvidence';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import { detectRepeatedPatterns, type PatternDetectionResult } from './patternDetector';

export interface AnswerPersonalMemoryQuestionInput {
  store: MemoryStore;
  userId: string;
  question: string;
  currentDecision?: CurrentDecision;
  queryId?: string;
  createdAt?: string;
}

export interface PersonalMemoryAgentResult {
  privacyScope: 'private';
  loadedMemoryIds: string[];
  memories: MemoryRecord[];
  patterns: PatternDetectionResult;
  ask: AskMyPastSelfAnswer;
  replay?: DecisionReplayResult;
  graphEvidence: GraphEvidencePayload;
}

export async function answerPersonalMemoryQuestion(
  input: AnswerPersonalMemoryQuestionInput,
): Promise<PersonalMemoryAgentResult> {
  const memories = await input.store.listByUser(input.userId);
  const patterns = detectRepeatedPatterns(memories);
  const ask = askMyPastSelf({
    question: input.question,
    memories,
    patterns: patterns.patterns,
  });
  const replay = input.currentDecision
    ? replayDecision({
        currentDecision: input.currentDecision,
        memories,
        patterns: patterns.patterns,
      })
    : undefined;
  const graphEvidence = buildGraphEvidence({
    currentQuery: {
      id: input.queryId,
      text: input.question,
      createdAt: input.createdAt,
    },
    memories,
    askAnswer: ask,
    patterns: patterns.patterns,
    replay,
  });

  return {
    privacyScope: 'private',
    loadedMemoryIds: memories.map((memory) => memory.id),
    memories,
    patterns,
    ask,
    replay,
    graphEvidence,
  };
}
