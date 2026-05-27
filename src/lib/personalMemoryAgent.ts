import { askMyPastSelf, type AskMyPastSelfAnswer } from './askMyPastSelf';
import { replayDecision, type CurrentDecision, type DecisionReplayResult } from './decisionReplay';
import { buildGraphEvidence, type GraphEvidencePayload } from './graphEvidence';
import { buildMemoryRetrievalQuery, type MemoryRetrievalQuery } from './memoryQueryBridge';
import { retrieveMultiAxisMemoriesFromRecords, type MultiAxisMemoryRetrievalResult } from './multiAxisMemoryRetrieval';
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
  retrievalLimit?: number;
}

export interface PersonalMemoryAgentResult {
  privacyScope: 'private';
  loadedMemoryIds: string[];
  memories: MemoryRecord[];
  retrievalQuery: MemoryRetrievalQuery;
  retrieval: MultiAxisMemoryRetrievalResult;
  patterns: PatternDetectionResult;
  ask: AskMyPastSelfAnswer;
  replay?: DecisionReplayResult;
  graphEvidence: GraphEvidencePayload;
}

export async function answerPersonalMemoryQuestion(
  input: AnswerPersonalMemoryQuestionInput,
): Promise<PersonalMemoryAgentResult> {
  const allUserMemories = await input.store.listByUser(input.userId);
  const retrievalQuery = buildMemoryRetrievalQuery({
    question: input.question,
    currentDecision: input.currentDecision,
  });
  const retrieval = retrieveMultiAxisMemoriesFromRecords({
    records: allUserMemories,
    query: retrievalQuery.expandedQuery,
    limit: input.retrievalLimit ?? 8,
  });
  const memories = retrieval.memories;
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
    retrievalQuery,
    retrieval,
    patterns,
    ask,
    replay,
    graphEvidence,
  };
}
