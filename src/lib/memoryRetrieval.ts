import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';

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

function normalizeSearchText(value: string): string {
  return value.toLocaleLowerCase().replace(/[^a-z0-9가-힣]+/g, ' ').trim();
}

function tokenizeQuery(query: string): string[] {
  const seen = new Set<string>();
  const terms: string[] = [];
  for (const term of normalizeSearchText(query).split(/\s+/g)) {
    if (term.length < 2 || seen.has(term)) continue;
    seen.add(term);
    terms.push(term);
  }
  return terms;
}

function buildRecordSearchText(record: MemoryRecord): string {
  return normalizeSearchText(
    [
      record.rawText,
      record.summary,
      record.outcomeText ?? '',
      record.sourceType,
      record.sourceRef,
      record.memoryType,
      record.decisionSignal,
      ...record.emotionTags,
      ...record.topicTags,
      ...record.projectTags,
      ...record.peopleTags,
    ].join(' '),
  );
}

function countOccurrences(text: string, term: string): number {
  let count = 0;
  let index = text.indexOf(term);
  while (index >= 0) {
    count += 1;
    index = text.indexOf(term, index + term.length);
  }
  return count;
}

function scoreRecord(record: MemoryRecord, queryTerms: readonly string[]): RetrievedMemory | null {
  const text = buildRecordSearchText(record);
  const matchedTerms: string[] = [];
  let score = 0;

  for (const term of queryTerms) {
    const occurrences = countOccurrences(text, term);
    if (occurrences === 0) continue;
    matchedTerms.push(term);
    score += occurrences;
  }

  if (score === 0) return null;
  return {
    memory: record,
    score,
    matchedTerms,
  };
}

function compareRetrievedMemories(left: RetrievedMemory, right: RetrievedMemory): number {
  const scoreComparison = right.score - left.score;
  if (scoreComparison !== 0) return scoreComparison;

  const leftTime = left.memory.observedAt ?? left.memory.createdAt;
  const rightTime = right.memory.observedAt ?? right.memory.createdAt;
  const timeComparison = leftTime.localeCompare(rightTime);
  if (timeComparison !== 0) return timeComparison;
  return left.memory.id.localeCompare(right.memory.id);
}

export function retrieveRelevantMemoriesFromRecords(
  input: RetrieveRelevantMemoriesFromRecordsInput,
): MemoryRetrievalResult {
  const queryTerms = tokenizeQuery(input.query);
  const retrievedMemories = input.records
    .map((record) => scoreRecord(record, queryTerms))
    .filter((result): result is RetrievedMemory => Boolean(result))
    .sort(compareRetrievedMemories)
    .slice(0, input.limit);
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
