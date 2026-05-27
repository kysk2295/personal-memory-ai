import { buildMemoryKnowledgeLedger, type TypedKnowledgeEdge } from './memoryKnowledgeLedger';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';

export type MultiAxisRetrievalStatus = 'implemented';
export type MultiAxisRetrievalEvidenceLabel = 'sufficient_evidence' | 'insufficient_evidence';

export interface MultiAxisRetrievalScores {
  keyword: number;
  semantic: number;
  graph: number;
  temporal: number;
}

export interface MultiAxisRetrievedMemory {
  memory: MemoryRecord;
  score: number;
  matchedTerms: string[];
  axisScores: MultiAxisRetrievalScores;
  reasons: string[];
  supportingEdgeIds: string[];
}

export interface MultiAxisMemoryRetrievalResult {
  status: MultiAxisRetrievalStatus;
  query: string;
  evidenceLabel: MultiAxisRetrievalEvidenceLabel;
  axisWeights: MultiAxisRetrievalScores;
  retrievedMemories: MultiAxisRetrievedMemory[];
  memories: MemoryRecord[];
  retrievedMemoryIds: string[];
  ledgerCheckpointId: string;
  insufficientEvidenceReason?: string;
}

export interface RetrieveMultiAxisMemoriesFromRecordsInput {
  records: readonly MemoryRecord[];
  query: string;
  limit: number;
}

export interface RetrieveMultiAxisMemoriesInput {
  store: MemoryStore;
  userId: string;
  query: string;
  limit: number;
}

const AXIS_WEIGHTS: MultiAxisRetrievalScores = {
  keyword: 1,
  semantic: 1.2,
  graph: 0.7,
  temporal: 0.15,
};

const GRAPH_EDGE_KINDS = new Set<TypedKnowledgeEdge['kind']>([
  'has-topic',
  'has-emotion',
  'belongs-to-project',
  'supports-decision',
  'produced-outcome',
  'reinforces-pattern',
]);

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

function buildKeywordSearchText(record: MemoryRecord): string {
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

function buildSemanticSearchText(record: MemoryRecord): string {
  return normalizeSearchText(
    [
      record.summary,
      record.outcomeText ?? '',
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

function scoreKeyword(record: MemoryRecord, queryTerms: readonly string[]): { score: number; matchedTerms: string[] } {
  const text = buildKeywordSearchText(record);
  const matchedTerms: string[] = [];
  let score = 0;

  for (const term of queryTerms) {
    const occurrences = countOccurrences(text, term);
    if (occurrences === 0) continue;
    matchedTerms.push(term);
    score += occurrences;
  }

  return { score, matchedTerms };
}

function scoreSemantic(record: MemoryRecord, queryTerms: readonly string[]): number {
  const text = buildSemanticSearchText(record);
  return queryTerms.filter((term) => text.includes(term)).length;
}

function observedTime(record: MemoryRecord): number {
  const parsed = new Date(record.observedAt ?? record.createdAt).getTime();
  return Number.isNaN(parsed) ? 0 : parsed;
}

function scoreTemporal(record: MemoryRecord, latestObservedAtMs: number): number {
  const recordObservedAtMs = observedTime(record);
  if (!recordObservedAtMs || !latestObservedAtMs) return 0;
  const days = Math.max(0, (latestObservedAtMs - recordObservedAtMs) / 86_400_000);
  return 1 / (1 + days / 7);
}

function compareRetrievedMemories(left: MultiAxisRetrievedMemory, right: MultiAxisRetrievedMemory): number {
  const scoreComparison = right.score - left.score;
  if (scoreComparison !== 0) return scoreComparison;

  const timeComparison = observedTime(right.memory) - observedTime(left.memory);
  if (timeComparison !== 0) return timeComparison;
  return left.memory.id.localeCompare(right.memory.id);
}

function relevantGraphEdgesForMemory(memoryId: string, edges: readonly TypedKnowledgeEdge[]): TypedKnowledgeEdge[] {
  const sourceId = `atom:${memoryId}`;
  return edges.filter((edge) => edge.sourceId === sourceId && GRAPH_EDGE_KINDS.has(edge.kind));
}

function graphEdgesByMemoryId(records: readonly MemoryRecord[], edges: readonly TypedKnowledgeEdge[]): Map<string, TypedKnowledgeEdge[]> {
  const result = new Map<string, TypedKnowledgeEdge[]>();
  for (const record of records) {
    result.set(record.id, relevantGraphEdgesForMemory(record.id, edges));
  }
  return result;
}

function scoreGraph(
  memoryId: string,
  seedTargetIds: ReadonlySet<string>,
  edgesByMemoryId: Map<string, TypedKnowledgeEdge[]>,
): { score: number; supportingEdgeIds: string[] } {
  const supportingEdges = (edgesByMemoryId.get(memoryId) ?? []).filter((edge) => seedTargetIds.has(edge.targetId));
  const targetCount = new Set(supportingEdges.map((edge) => edge.targetId)).size;
  return {
    score: targetCount,
    supportingEdgeIds: supportingEdges.map((edge) => edge.id).sort((left, right) => left.localeCompare(right)),
  };
}

function reasonsForScores(axisScores: MultiAxisRetrievalScores): string[] {
  const reasons: string[] = [];
  if (axisScores.keyword > 0) reasons.push(`keyword matched ${axisScores.keyword} term occurrence(s)`);
  if (axisScores.semantic > 0) reasons.push(`semantic matched ${axisScores.semantic} high-signal field(s)`);
  if (axisScores.graph > 0) reasons.push(`graph traversal matched ${axisScores.graph} shared ledger edge target(s)`);
  if (axisScores.temporal > 0) reasons.push(`temporal freshness contributed ${axisScores.temporal.toFixed(2)}`);
  return reasons;
}

function weightedScore(axisScores: MultiAxisRetrievalScores): number {
  return (
    axisScores.keyword * AXIS_WEIGHTS.keyword +
    axisScores.semantic * AXIS_WEIGHTS.semantic +
    axisScores.graph * AXIS_WEIGHTS.graph +
    axisScores.temporal * AXIS_WEIGHTS.temporal
  );
}

export function retrieveMultiAxisMemoriesFromRecords(
  input: RetrieveMultiAxisMemoriesFromRecordsInput,
): MultiAxisMemoryRetrievalResult {
  const orderedRecords = [...input.records].sort((left, right) => left.id.localeCompare(right.id));
  const ledger = buildMemoryKnowledgeLedger(orderedRecords);
  const queryTerms = tokenizeQuery(input.query);
  const directScores = new Map<string, { keyword: number; semantic: number; matchedTerms: string[] }>();
  const seedMemoryIds = new Set<string>();

  for (const record of orderedRecords) {
    const keyword = scoreKeyword(record, queryTerms);
    const semantic = scoreSemantic(record, queryTerms);
    directScores.set(record.id, {
      keyword: keyword.score,
      semantic,
      matchedTerms: keyword.matchedTerms,
    });
    if (keyword.score > 0 || semantic > 0) {
      seedMemoryIds.add(record.id);
    }
  }

  const edgesByMemoryId = graphEdgesByMemoryId(orderedRecords, ledger.typedEdges);
  const seedTargetIds = new Set<string>();
  for (const seedMemoryId of seedMemoryIds) {
    for (const edge of edgesByMemoryId.get(seedMemoryId) ?? []) {
      seedTargetIds.add(edge.targetId);
    }
  }

  const latestObservedAtMs = Math.max(...orderedRecords.map(observedTime));
  const retrievedMemories = orderedRecords
    .map((record): MultiAxisRetrievedMemory | null => {
      const direct = directScores.get(record.id) ?? { keyword: 0, semantic: 0, matchedTerms: [] };
      const graph = scoreGraph(record.id, seedTargetIds, edgesByMemoryId);
      const passesRetrievalGate = direct.keyword > 0 || direct.semantic > 0 || graph.score > 0;
      if (!passesRetrievalGate) return null;

      const axisScores: MultiAxisRetrievalScores = {
        keyword: direct.keyword,
        semantic: direct.semantic,
        graph: graph.score,
        temporal: scoreTemporal(record, latestObservedAtMs),
      };

      return {
        memory: record,
        score: weightedScore(axisScores),
        matchedTerms: direct.matchedTerms,
        axisScores,
        reasons: reasonsForScores(axisScores),
        supportingEdgeIds: graph.supportingEdgeIds,
      };
    })
    .filter((entry): entry is MultiAxisRetrievedMemory => Boolean(entry))
    .sort(compareRetrievedMemories)
    .slice(0, input.limit);

  const memories = retrievedMemories.map((entry) => entry.memory);
  const evidenceLabel = retrievedMemories.length > 0 ? 'sufficient_evidence' : 'insufficient_evidence';

  return {
    status: 'implemented',
    query: input.query,
    evidenceLabel,
    axisWeights: AXIS_WEIGHTS,
    retrievedMemories,
    memories,
    retrievedMemoryIds: memories.map((memory) => memory.id),
    ledgerCheckpointId: ledger.checkpoint.id,
    insufficientEvidenceReason:
      evidenceLabel === 'insufficient_evidence'
        ? 'No user-scoped MemoryRecord matched semantic, keyword, graph, or temporal retrieval gates.'
        : undefined,
  };
}

export async function retrieveMultiAxisMemories(
  input: RetrieveMultiAxisMemoriesInput,
): Promise<MultiAxisMemoryRetrievalResult> {
  return retrieveMultiAxisMemoriesFromRecords({
    records: await input.store.listByUser(input.userId),
    query: input.query,
    limit: input.limit,
  });
}
