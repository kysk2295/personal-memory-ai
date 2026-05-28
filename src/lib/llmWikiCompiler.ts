import type { MemoryRecord } from './memoryRecord';

export type CompiledWikiNodeType = 'source' | 'concept' | 'decision' | 'pattern';
export type MemoryAtomOrigin = 'captured' | 'imported' | 'synthesized';
export type MemoryAtomFreshness = 'strengthening' | 'stable' | 'stale';
export type MemoryOperation = 'retain' | 'recall' | 'reflect';

export interface CompiledMemoryAtom {
  id: string;
  canonicalClaim: string;
  claimFingerprint: string;
  memoryType: MemoryRecord['memoryType'];
  origin: MemoryAtomOrigin;
  meaningVersion: number;
  confidentiality: MemoryRecord['privacyScope'];
  freshness: MemoryAtomFreshness;
  operations: MemoryOperation[];
  sourceRefs: string[];
  citationIds: string[];
  sourceMemoryIds: string[];
  topicTags: string[];
}

export interface CompiledWikiNode {
  id: string;
  type: CompiledWikiNodeType;
  title: string;
  summary: string;
  sourceMemoryIds: string[];
  relatedNodeIds: string[];
  citationIds: string[];
}

export interface CompiledWikiGraph {
  corpusId: string;
  rawSourceCount: number;
  nodeCount: number;
  atomCount: number;
  citationCount: number;
  operationCounts: Record<MemoryOperation, number>;
  freshnessCounts: Record<MemoryAtomFreshness, number>;
  atoms: CompiledMemoryAtom[];
  nodes: CompiledWikiNode[];
}

function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return `sha-${(hash >>> 0).toString(36).padStart(7, '0')}`;
}

function sortedUnique(values: readonly string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((left, right) => left.localeCompare(right));
}

function summarizeSources(records: readonly MemoryRecord[]): string {
  const orderedRecords = [...records].sort((left, right) => left.id.localeCompare(right.id));
  const first = orderedRecords[0];
  if (!first) return 'No source memories yet.';
  if (orderedRecords.length === 1) return first.summary;
  return `${orderedRecords.length} cited memories synthesize ${orderedRecords.slice(0, 2).map((record) => record.summary).join(' / ')}.`;
}

function createNode(
  type: CompiledWikiNodeType,
  id: string,
  title: string,
  records: readonly MemoryRecord[],
  extraRelatedNodeIds: readonly string[] = [],
): CompiledWikiNode {
  const sourceMemoryIds = sortedUnique(records.map((record) => record.id));
  const relatedNodeIds = sortedUnique([
    ...extraRelatedNodeIds,
    ...records.map((record) => `source:${slugify(record.sourceType)}`),
    ...records.flatMap((record) => record.topicTags.map((tag) => `concept:${slugify(tag)}`)),
    ...records
      .filter((record) => record.decisionSignal !== 'none')
      .map((record) => `decision:${slugify(record.decisionSignal)}`),
  ]).filter((relatedId) => relatedId !== id);

  return {
    id,
    type,
    title,
    summary: summarizeSources(records),
    sourceMemoryIds,
    relatedNodeIds,
    citationIds: sourceMemoryIds,
  };
}

function classifyOrigin(record: MemoryRecord): MemoryAtomOrigin {
  if (record.memoryType === 'pattern' || record.memoryType === 'reflection') return 'synthesized';
  if (record.sourceType === 'mobile' || record.sourceType === 'telegram' || record.sourceType === 'paste') return 'captured';
  return 'imported';
}

function classifyOperations(record: MemoryRecord): MemoryOperation[] {
  const operations: MemoryOperation[] = ['retain', 'recall'];
  if (record.memoryType === 'decision' || record.memoryType === 'reflection' || record.memoryType === 'pattern') {
    operations.push('reflect');
  }
  return operations;
}

function classifyFreshness(record: MemoryRecord, latestObservedAtMs: number): MemoryAtomFreshness {
  const observedAt = record.observedAt ?? record.createdAt;
  const observedMs = new Date(observedAt).getTime();
  if (Number.isNaN(observedMs) || Number.isNaN(latestObservedAtMs)) return 'stable';
  const days = Math.max(0, (latestObservedAtMs - observedMs) / 86_400_000);
  if (days <= 2) return 'strengthening';
  if (days <= 14) return 'stable';
  return 'stale';
}

function createAtom(record: MemoryRecord, latestObservedAtMs: number): CompiledMemoryAtom {
  const canonicalClaim = record.summary;
  return {
    id: `atom:${record.id}`,
    canonicalClaim,
    claimFingerprint: stableHash([record.id, canonicalClaim, record.rawText].join('\u001f')),
    memoryType: record.memoryType,
    origin: classifyOrigin(record),
    meaningVersion: record.memoryType === 'pattern' || record.memoryType === 'reflection' ? 2 : 1,
    confidentiality: record.privacyScope,
    freshness: classifyFreshness(record, latestObservedAtMs),
    operations: classifyOperations(record),
    sourceRefs: sortedUnique([record.sourceRef]),
    citationIds: [record.id],
    sourceMemoryIds: [record.id],
    topicTags: sortedUnique(record.topicTags),
  };
}

export function compileMemoryRecordsToWikiGraph(
  records: readonly MemoryRecord[],
  corpusId = 'personal-memory-ai-fixture-corpus',
): CompiledWikiGraph {
  const nodesById = new Map<string, CompiledWikiNode>();
  const recordsBySource = new Map<string, MemoryRecord[]>();
  const recordsByTopic = new Map<string, MemoryRecord[]>();
  const recordsByDecision = new Map<string, MemoryRecord[]>();
  const latestObservedAtMs = Math.max(
    ...records.map((record) => new Date(record.observedAt ?? record.createdAt).getTime()).filter((value) => !Number.isNaN(value)),
  );

  for (const record of records) {
    const sourceKey = record.sourceType;
    recordsBySource.set(sourceKey, [...(recordsBySource.get(sourceKey) ?? []), record]);

    for (const topic of record.topicTags) {
      const topicKey = slugify(topic);
      recordsByTopic.set(topicKey, [...(recordsByTopic.get(topicKey) ?? []), record]);
    }

    if (record.decisionSignal !== 'none') {
      const decisionKey = slugify(record.decisionSignal);
      recordsByDecision.set(decisionKey, [...(recordsByDecision.get(decisionKey) ?? []), record]);
    }
  }

  for (const [sourceType, sourceRecords] of Array.from(recordsBySource).sort()) {
    const id = `source:${slugify(sourceType)}`;
    nodesById.set(
      id,
      createNode('source', id, `${sourceType} raw source`, sourceRecords, sourceRecords.map((record) => `memory:${record.id}`)),
    );
  }

  for (const [topicSlug, topicRecords] of Array.from(recordsByTopic).sort()) {
    const id = `concept:${topicSlug}`;
    const title = topicRecords.find((record) => record.topicTags.some((tag) => slugify(tag) === topicSlug))?.topicTags.find((tag) => slugify(tag) === topicSlug) ?? topicSlug;
    nodesById.set(id, createNode('concept', id, title, topicRecords));
  }

  for (const [decisionSlug, decisionRecords] of Array.from(recordsByDecision).sort()) {
    const id = `decision:${decisionSlug}`;
    nodesById.set(id, createNode('decision', id, `${decisionSlug} decision branch`, decisionRecords));
  }

  const patternRecords = records.filter((record) => record.memoryType === 'pattern' || record.outcomeText || record.topicTags.some((tag) => /delay|launch|feature/i.test(tag)));
  if (patternRecords.length > 0) {
    const id = 'pattern:launch-delay-from-feature-expansion';
    nodesById.set(
      id,
      createNode('pattern', id, '기능 확장으로 출시 지연', patternRecords, [
        'concept:launch',
        'concept:feature-addition',
        'decision:chosen',
      ]),
    );
  }

  const atoms = [...records]
    .map((record) => createAtom(record, latestObservedAtMs))
    .sort((left, right) => left.id.localeCompare(right.id));
  const nodes = Array.from(nodesById.values()).sort((left, right) => left.id.localeCompare(right.id));
  const citationCount = new Set(nodes.flatMap((node) => node.citationIds)).size;

  return {
    corpusId,
    rawSourceCount: records.length,
    nodeCount: nodes.length,
    atomCount: atoms.length,
    citationCount,
    operationCounts: {
      retain: atoms.filter((atom) => atom.operations.includes('retain')).length,
      recall: atoms.filter((atom) => atom.operations.includes('recall')).length,
      reflect: atoms.filter((atom) => atom.operations.includes('reflect')).length,
    },
    freshnessCounts: {
      strengthening: atoms.filter((atom) => atom.freshness === 'strengthening').length,
      stable: atoms.filter((atom) => atom.freshness === 'stable').length,
      stale: atoms.filter((atom) => atom.freshness === 'stale').length,
    },
    atoms,
    nodes,
  };
}
