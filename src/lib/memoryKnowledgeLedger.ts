import { compileMemoryRecordsToWikiGraph, type CompiledMemoryAtom, type MemoryAtomFreshness } from './llmWikiCompiler';
import type { MemoryRecord } from './memoryRecord';

export type KnowledgeEdgeKind =
  | 'cites-raw'
  | 'has-topic'
  | 'has-emotion'
  | 'belongs-to-project'
  | 'supports-decision'
  | 'produced-outcome'
  | 'from-source'
  | 'reinforces-pattern';

export type KnowledgeEdgeStatus = 'active' | 'stale';

export interface RawMemoryArchiveEntry {
  id: string;
  memoryId: string;
  sourceType: MemoryRecord['sourceType'];
  sourceRef: string;
  capturedAt: string;
  observedAt?: string;
  rawText: string;
  rawTextFingerprint: string;
  confidentiality: MemoryRecord['privacyScope'];
  immutable: true;
}

export interface CanonicalMemoryThought extends CompiledMemoryAtom {
  id: string;
  atomId: string;
  sourceArchiveIds: string[];
  edgeIds: string[];
}

export interface TypedKnowledgeEdge {
  id: string;
  kind: KnowledgeEdgeKind;
  sourceId: string;
  targetId: string;
  citationIds: string[];
  confidence: number;
  status: KnowledgeEdgeStatus;
  createdFrom: 'memory-record' | 'compiled-wiki-pattern';
}

export interface KnowledgeLedgerCheckpoint {
  id: string;
  operation: 'atomize-dedup-apply';
  rawArchiveCount: number;
  canonicalThoughtCount: number;
  typedEdgeCount: number;
  staleEdgeCount: number;
  safeToApply: boolean;
}

export interface KnowledgeLedgerStats {
  rawArchiveCount: number;
  canonicalThoughtCount: number;
  typedEdgeCount: number;
  staleEdgeCount: number;
}

export interface MemoryKnowledgeLedger {
  rawArchiveEntries: RawMemoryArchiveEntry[];
  canonicalThoughts: CanonicalMemoryThought[];
  typedEdges: TypedKnowledgeEdge[];
  checkpoint: KnowledgeLedgerCheckpoint;
  stats: KnowledgeLedgerStats;
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `sha-${(hash >>> 0).toString(36).padStart(7, '0')}`;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sortedUnique(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function rawArchiveEntryFromRecord(record: MemoryRecord): RawMemoryArchiveEntry {
  return {
    id: `raw:${record.id}`,
    memoryId: record.id,
    sourceType: record.sourceType,
    sourceRef: record.sourceRef,
    capturedAt: record.createdAt,
    observedAt: record.observedAt,
    rawText: record.rawText,
    rawTextFingerprint: stableHash([record.id, record.sourceRef, record.rawText].join('\u001f')),
    confidentiality: record.privacyScope,
    immutable: true,
  };
}

function edgeStatus(citationIds: readonly string[], freshnessByMemoryId: Map<string, MemoryAtomFreshness>): KnowledgeEdgeStatus {
  const citedFreshness = citationIds.map((citationId) => freshnessByMemoryId.get(citationId)).filter(Boolean);
  if (!citedFreshness.length) return 'active';
  return citedFreshness.every((freshness) => freshness === 'stale') ? 'stale' : 'active';
}

function appendEdge(
  edgesById: Map<string, TypedKnowledgeEdge>,
  freshnessByMemoryId: Map<string, MemoryAtomFreshness>,
  kind: KnowledgeEdgeKind,
  sourceId: string,
  targetId: string,
  citationIds: readonly string[],
  confidence: number,
  createdFrom: TypedKnowledgeEdge['createdFrom'] = 'memory-record',
): void {
  const normalizedCitationIds = sortedUnique(citationIds);
  const id = `edge:${kind}:${sourceId}->${targetId}`;
  const existing = edgesById.get(id);
  if (existing) {
    existing.citationIds = sortedUnique([...existing.citationIds, ...normalizedCitationIds]);
    existing.status = edgeStatus(existing.citationIds, freshnessByMemoryId);
    existing.confidence = Math.max(existing.confidence, confidence);
    return;
  }

  edgesById.set(id, {
    id,
    kind,
    sourceId,
    targetId,
    citationIds: normalizedCitationIds,
    confidence,
    status: edgeStatus(normalizedCitationIds, freshnessByMemoryId),
    createdFrom,
  });
}

function createCanonicalThought(atom: CompiledMemoryAtom): CanonicalMemoryThought {
  const memoryId = atom.sourceMemoryIds[0];
  return {
    ...atom,
    id: `thought:${memoryId}`,
    atomId: atom.id,
    sourceArchiveIds: atom.sourceMemoryIds.map((sourceMemoryId) => `raw:${sourceMemoryId}`),
    edgeIds: [],
  };
}

function checkpointFor(
  rawArchiveEntries: readonly RawMemoryArchiveEntry[],
  canonicalThoughts: readonly CanonicalMemoryThought[],
  typedEdges: readonly TypedKnowledgeEdge[],
): KnowledgeLedgerCheckpoint {
  const staleEdgeCount = typedEdges.filter((edge) => edge.status === 'stale').length;
  const basis = [
    ...rawArchiveEntries.map((entry) => entry.rawTextFingerprint),
    ...canonicalThoughts.map((thought) => thought.claimFingerprint),
    ...typedEdges.map((edge) => edge.id),
  ].join('\u001f');

  return {
    id: `checkpoint:${stableHash(basis)}`,
    operation: 'atomize-dedup-apply',
    rawArchiveCount: rawArchiveEntries.length,
    canonicalThoughtCount: canonicalThoughts.length,
    typedEdgeCount: typedEdges.length,
    staleEdgeCount,
    safeToApply: rawArchiveEntries.length === canonicalThoughts.length,
  };
}

export function buildMemoryKnowledgeLedger(records: readonly MemoryRecord[]): MemoryKnowledgeLedger {
  const orderedRecords = [...records].sort((left, right) => left.id.localeCompare(right.id));
  const wikiGraph = compileMemoryRecordsToWikiGraph(orderedRecords);
  const rawArchiveEntries = orderedRecords.map(rawArchiveEntryFromRecord);
  const canonicalThoughts = wikiGraph.atoms.map(createCanonicalThought);
  const freshnessByMemoryId = new Map<string, MemoryAtomFreshness>(
    canonicalThoughts.flatMap((thought) => thought.sourceMemoryIds.map((memoryId) => [memoryId, thought.freshness] as const)),
  );
  const edgesById = new Map<string, TypedKnowledgeEdge>();

  for (const record of orderedRecords) {
    const atomId = `atom:${record.id}`;
    appendEdge(edgesById, freshnessByMemoryId, 'cites-raw', atomId, `raw:${record.id}`, [record.id], 1);
    appendEdge(edgesById, freshnessByMemoryId, 'from-source', atomId, `source:${slugify(record.sourceType)}`, [record.id], 1);

    for (const topic of record.topicTags) {
      appendEdge(edgesById, freshnessByMemoryId, 'has-topic', atomId, `concept:${slugify(topic)}`, [record.id], 0.86);
    }
    for (const emotion of record.emotionTags) {
      appendEdge(edgesById, freshnessByMemoryId, 'has-emotion', atomId, `emotion:${slugify(emotion)}`, [record.id], 0.82);
    }
    for (const project of record.projectTags) {
      appendEdge(edgesById, freshnessByMemoryId, 'belongs-to-project', atomId, `project:${slugify(project)}`, [record.id], 0.84);
    }
    if (record.decisionSignal !== 'none') {
      appendEdge(edgesById, freshnessByMemoryId, 'supports-decision', atomId, `decision:${slugify(record.decisionSignal)}`, [record.id], 0.92);
    }
    if (record.outcomeText) {
      appendEdge(edgesById, freshnessByMemoryId, 'produced-outcome', atomId, `outcome:${slugify(record.outcomeText)}`, [record.id], 0.9);
    }
  }

  for (const patternNode of wikiGraph.nodes.filter((node) => node.type === 'pattern')) {
    for (const memoryId of patternNode.sourceMemoryIds) {
      appendEdge(
        edgesById,
        freshnessByMemoryId,
        'reinforces-pattern',
        `atom:${memoryId}`,
        patternNode.id,
        [memoryId],
        0.78,
        'compiled-wiki-pattern',
      );
    }
  }

  const typedEdges = Array.from(edgesById.values()).sort((left, right) => left.id.localeCompare(right.id));
  const edgesBySource = new Map<string, string[]>();
  for (const edge of typedEdges) {
    edgesBySource.set(edge.sourceId, [...(edgesBySource.get(edge.sourceId) ?? []), edge.id]);
  }
  const thoughtsWithEdges = canonicalThoughts
    .map((thought) => ({
      ...thought,
      edgeIds: edgesBySource.get(thought.atomId) ?? [],
    }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const sortedRawArchiveEntries = rawArchiveEntries.sort((left, right) => left.id.localeCompare(right.id));
  const checkpoint = checkpointFor(sortedRawArchiveEntries, thoughtsWithEdges, typedEdges);

  return {
    rawArchiveEntries: sortedRawArchiveEntries,
    canonicalThoughts: thoughtsWithEdges,
    typedEdges,
    checkpoint,
    stats: {
      rawArchiveCount: sortedRawArchiveEntries.length,
      canonicalThoughtCount: thoughtsWithEdges.length,
      typedEdgeCount: typedEdges.length,
      staleEdgeCount: checkpoint.staleEdgeCount,
    },
  };
}
