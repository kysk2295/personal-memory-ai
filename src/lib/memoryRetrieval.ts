import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import { retrieveMultiAxisMemoriesFromRecords } from './multiAxisMemoryRetrieval';

export type MemoryRetrievalStatus = 'implemented';
export type MemoryRetrievalEvidenceLabel = 'sufficient_evidence' | 'insufficient_evidence';

export interface RetrievedMemory {
  memory: MemoryRecord;
  score: number;
  matchedTerms: string[];
}

export interface MemoryRetrievalResult {
  status: MemoryRetrievalStatus;
  query: string;
  evidenceLabel: MemoryRetrievalEvidenceLabel;
  retrievedMemories: RetrievedMemory[];
  memories: MemoryRecord[];
  retrievedMemoryIds: string[];
  insufficientEvidenceReason?: string;
}

export interface RetrieveRelevantMemoriesFromRecordsInput {
  records: readonly MemoryRecord[];
  query: string;
  limit: number;
}

export interface RetrieveRelevantMemoriesInput {
  store: MemoryStore;
  userId: string;
  query: string;
  limit: number;
}

export function retrieveRelevantMemoriesFromRecords(
  input: RetrieveRelevantMemoriesFromRecordsInput,
): MemoryRetrievalResult {
  const multiAxis = retrieveMultiAxisMemoriesFromRecords(input);
  const retrievedMemories: RetrievedMemory[] = multiAxis.retrievedMemories.map((entry) => ({
    memory: entry.memory,
    score: entry.score,
    matchedTerms: entry.matchedTerms,
  }));
  const memories = retrievedMemories.map((result) => result.memory);
  const evidenceLabel = retrievedMemories.length > 0 ? 'sufficient_evidence' : 'insufficient_evidence';

  return {
    status: 'implemented',
    query: input.query,
    evidenceLabel,
    retrievedMemories,
    memories,
    retrievedMemoryIds: memories.map((memory) => memory.id),
    insufficientEvidenceReason:
      evidenceLabel === 'insufficient_evidence'
        ? 'No user-scoped MemoryRecord matched the retrieval query.'
        : undefined,
  };
}

export async function retrieveRelevantMemories(
  input: RetrieveRelevantMemoriesInput,
): Promise<MemoryRetrievalResult> {
  return retrieveRelevantMemoriesFromRecords({
    records: await input.store.listByUser(input.userId),
    query: input.query,
    limit: input.limit,
  });
}
