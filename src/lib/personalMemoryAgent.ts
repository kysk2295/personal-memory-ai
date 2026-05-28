import { askMyPastSelf, type AskMyPastSelfAnswer } from './askMyPastSelf';
import { replayDecision, type CurrentDecision, type DecisionReplayResult } from './decisionReplay';
import { buildGraphEvidence, type GraphEvidencePayload } from './graphEvidence';
import { buildMemoryRetrievalQuery, type MemoryRetrievalQuery } from './memoryQueryBridge';
import { retrieveMultiAxisMemoriesFromRecords, type MultiAxisMemoryRetrievalResult } from './multiAxisMemoryRetrieval';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import { detectRepeatedPatterns, type PatternDetectionResult } from './patternDetector';
import { createSavedAskArtifact, type SavedMemoryArtifact } from './savedMemoryArtifact';

export interface AnswerPersonalMemoryQuestionInput {
  store: MemoryStore;
  userId: string;
  question: string;
  currentDecision?: CurrentDecision;
  followUpContext?: PersonalMemoryFollowUpContext;
  queryId?: string;
  createdAt?: string;
  retrievalLimit?: number;
}

export interface PersonalMemoryFollowUpContext {
  previousQuestion?: string;
  previousRecommendation?: string;
  previousCitationMemoryIds?: string[];
}

export interface PersonalMemoryConversationContext {
  mode: 'single_turn' | 'follow_up';
  previousQuestion?: string;
  anchoredCitationMemoryIds: string[];
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
  coachingBrief: PersonalMemoryCoachingBrief;
  savedArtifact: SavedMemoryArtifact;
  conversationContext: PersonalMemoryConversationContext;
  graphEvidence: GraphEvidencePayload;
}

export interface PersonalMemoryCoachingBrief {
  evidenceLabel: AskMyPastSelfAnswer['evidenceLabel'];
  recommendation: string;
  citationCount: number;
  nextActions: string[];
  boundary: string;
  evidenceCoverage: {
    memoryTypes: MemoryRecord['memoryType'][];
    sourceTypes: MemoryRecord['sourceType'][];
    observedRange?: {
      start: string;
      end: string;
    };
  };
}

function uniqueSorted<T extends string>(values: readonly T[]): T[] {
  return Array.from(new Set(values)).sort();
}

function observedDate(memory: MemoryRecord): string {
  return (memory.observedAt ?? memory.createdAt).slice(0, 10);
}

function evidenceCoverage(memories: readonly MemoryRecord[]): PersonalMemoryCoachingBrief['evidenceCoverage'] {
  const dates = memories.map(observedDate).sort();
  return {
    memoryTypes: uniqueSorted(memories.map((memory) => memory.memoryType)),
    sourceTypes: uniqueSorted(memories.map((memory) => memory.sourceType)),
    ...(dates.length
      ? {
          observedRange: {
            start: dates[0],
            end: dates[dates.length - 1],
          },
        }
      : {}),
  };
}

function buildCoachingBrief(input: {
  ask: AskMyPastSelfAnswer;
  memories: readonly MemoryRecord[];
}): PersonalMemoryCoachingBrief {
  const hasSufficientEvidence = input.ask.evidenceLabel === 'sufficient_evidence';
  return {
    evidenceLabel: input.ask.evidenceLabel,
    recommendation: input.ask.recommendation,
    citationCount: input.ask.citationMemoryIds.length,
    nextActions: hasSufficientEvidence
      ? [
          'freeze the current feature scope before adding more work',
          'show the current build to a user feedback source',
          'review the citation-backed memory path before overriding the recommendation',
        ]
      : [
          'Import or write at least two relevant memories before asking for a personal recommendation.',
          'Capture the current decision, emotion, options, and expected outcome as a diary memory.',
        ],
    boundary: hasSufficientEvidence
      ? 'This recommendation is limited to cited personal memories and should not be treated as general advice.'
      : 'No personal recommendation was generated because cited personal memories were insufficient.',
    evidenceCoverage: evidenceCoverage(input.memories),
  };
}

function sortedExistingAnchors(
  memories: readonly MemoryRecord[],
  followUpContext: PersonalMemoryFollowUpContext | undefined,
): string[] {
  if (!followUpContext?.previousCitationMemoryIds?.length) return [];
  const existingIds = new Set(memories.map((memory) => memory.id));
  return uniqueSorted(followUpContext.previousCitationMemoryIds.filter((memoryId) => existingIds.has(memoryId)));
}

function mergeAnchoredMemories(
  retrievedMemories: readonly MemoryRecord[],
  allUserMemories: readonly MemoryRecord[],
  anchoredCitationMemoryIds: readonly string[],
): MemoryRecord[] {
  const memoriesById = new Map(allUserMemories.map((memory) => [memory.id, memory]));
  const merged = new Map(retrievedMemories.map((memory) => [memory.id, memory]));
  for (const memoryId of anchoredCitationMemoryIds) {
    const anchoredMemory = memoriesById.get(memoryId);
    if (anchoredMemory) merged.set(memoryId, anchoredMemory);
  }
  return Array.from(merged.values());
}

export async function answerPersonalMemoryQuestion(
  input: AnswerPersonalMemoryQuestionInput,
): Promise<PersonalMemoryAgentResult> {
  const allUserMemories = await input.store.listByUser(input.userId);
  const retrievalQuery = buildMemoryRetrievalQuery({
    question: input.question,
    currentDecision: input.currentDecision,
    followUpContext: input.followUpContext,
  });
  const retrieval = retrieveMultiAxisMemoriesFromRecords({
    records: allUserMemories,
    query: retrievalQuery.expandedQuery,
    limit: input.retrievalLimit ?? 8,
  });
  const anchoredCitationMemoryIds = sortedExistingAnchors(allUserMemories, input.followUpContext);
  const memories = mergeAnchoredMemories(retrieval.memories, allUserMemories, anchoredCitationMemoryIds);
  const conversationContext: PersonalMemoryConversationContext = {
    mode: input.followUpContext ? 'follow_up' : 'single_turn',
    previousQuestion: input.followUpContext?.previousQuestion,
    anchoredCitationMemoryIds,
  };
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
  const coachingBrief = buildCoachingBrief({ ask, memories });
  const savedArtifact = createSavedAskArtifact({
    question: input.question,
    answer: ask,
    queryId: input.queryId,
    createdAt: input.createdAt,
  });
  savedArtifact.metadata.followUpMode = conversationContext.mode;
  if (conversationContext.previousQuestion) savedArtifact.metadata.previousQuestion = conversationContext.previousQuestion;
  if (conversationContext.anchoredCitationMemoryIds.length) {
    savedArtifact.metadata.anchoredCitationMemoryIds = conversationContext.anchoredCitationMemoryIds;
  }

  return {
    privacyScope: 'private',
    loadedMemoryIds: memories.map((memory) => memory.id),
    memories,
    retrievalQuery,
    retrieval,
    patterns,
    ask,
    replay,
    coachingBrief,
    savedArtifact,
    conversationContext,
    graphEvidence,
  };
}
