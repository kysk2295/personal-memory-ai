import type { MemoryRecord } from './memoryRecord';

export type CompiledWikiNodeType = 'source' | 'concept' | 'decision' | 'pattern';

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
  citationCount: number;
  nodes: CompiledWikiNode[];
}

function slugify(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function addUnique(target: string[], value: string): void {
  if (!value || target.includes(value)) return;
  target.push(value);
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

export function compileMemoryRecordsToWikiGraph(
  records: readonly MemoryRecord[],
  corpusId = 'personal-memory-ai-fixture-corpus',
): CompiledWikiGraph {
  const nodesById = new Map<string, CompiledWikiNode>();
  const recordsBySource = new Map<string, MemoryRecord[]>();
  const recordsByTopic = new Map<string, MemoryRecord[]>();
  const recordsByDecision = new Map<string, MemoryRecord[]>();

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
      createNode('pattern', id, 'Launch delay from feature expansion', patternRecords, [
        'concept:launch',
        'concept:feature-addition',
        'decision:chosen',
      ]),
    );
  }

  const nodes = Array.from(nodesById.values()).sort((left, right) => left.id.localeCompare(right.id));
  const citationCount = new Set(nodes.flatMap((node) => node.citationIds)).size;

  return {
    corpusId,
    rawSourceCount: records.length,
    nodeCount: nodes.length,
    citationCount,
    nodes,
  };
}
