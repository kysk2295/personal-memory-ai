import type { MemoryRecord } from './memoryRecord';

export type MemoryGraphNodeKind = 'memory' | 'emotion' | 'topic' | 'project' | 'decision' | 'outcome' | 'source';
export type MemoryGraphEdgeKind = 'emotion' | 'topic' | 'project' | 'decision' | 'outcome' | 'source';

export interface CytoscapeMemoryGraphElement {
  group?: 'nodes' | 'edges';
  data: {
    id: string;
    label?: string;
    graphLabel?: string;
    kind: MemoryGraphNodeKind | MemoryGraphEdgeKind;
    filterKind?: string;
    recordId?: string;
    source?: string;
    target?: string;
    observedAt?: string;
    sourceType?: string;
    recordType?: string;
    searchText?: string;
  };
}

export interface MemoryGraphStats {
  memoryNodeCount: number;
  graphNodeCount: number;
  edgeCount: number;
}

export interface MemoryGraphModel {
  library: 'cytoscape';
  elements: CytoscapeMemoryGraphElement[];
  stats: MemoryGraphStats;
}

const MAX_RENDERED_MEMORY_NODES = 300;

function slugifyGraphValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function compactGraphLabel(value: string, maxLength: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 3).trimEnd()}...`;
}

function compactSearchText(parts: readonly unknown[], maxLength = 800): string {
  const text = parts.filter(Boolean).join(' ').replace(/\s+/g, ' ').trim().toLocaleLowerCase();
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd();
}

function compactRawTextForSearch(value: string): string {
  return compactGraphLabel(value.replace(/\s+/g, ' '), 240);
}

function appendNode(
  nodes: Map<string, CytoscapeMemoryGraphElement>,
  kind: MemoryGraphNodeKind,
  label: string,
  options: Partial<CytoscapeMemoryGraphElement['data']> = {},
): string {
  const id = kind === 'memory' && options.recordId ? `memory:${options.recordId}` : `${kind}:${slugifyGraphValue(label)}`;
  const graphLabel = options.graphLabel ?? compactGraphLabel(label, kind === 'memory' ? 48 : 28);
  if (!nodes.has(id)) {
    nodes.set(id, {
      group: 'nodes',
      data: {
        id,
        kind,
        label,
        graphLabel,
        filterKind: filterKindForNode(kind),
        searchText: compactSearchText([label, kind, options.recordId, options.sourceType, options.recordType, options.observedAt]),
        ...options,
      },
    });
  }
  return id;
}

function appendEdge(edges: Map<string, CytoscapeMemoryGraphElement>, source: string, target: string, kind: MemoryGraphEdgeKind): void {
  const id = `${source}->${target}`;
  if (edges.has(id)) return;
  edges.set(id, {
    group: 'edges',
    data: {
      id,
      source,
      target,
      kind,
      filterKind: filterKindForEdge(kind),
    },
  });
}

function filterKindForNode(kind: MemoryGraphNodeKind): string {
  if (kind === 'memory' || kind === 'topic' || kind === 'project') return 'semantic';
  if (kind === 'emotion') return 'reflective';
  if (kind === 'decision' || kind === 'outcome') return 'thesis';
  return 'source';
}

function filterKindForEdge(kind: MemoryGraphEdgeKind): string {
  if (kind === 'emotion') return 'reflective';
  if (kind === 'decision' || kind === 'outcome') return 'thesis';
  if (kind === 'source') return 'source';
  return 'semantic';
}

function appendTagEdges(
  nodes: Map<string, CytoscapeMemoryGraphElement>,
  edges: Map<string, CytoscapeMemoryGraphElement>,
  memoryNodeId: string,
  kind: 'emotion' | 'topic' | 'project',
  values: readonly string[],
): void {
  for (const value of values) {
    const nodeId = appendNode(nodes, kind, value);
    appendEdge(edges, memoryNodeId, nodeId, kind);
  }
}

export function buildMemoryGraphModel(records: readonly MemoryRecord[]): MemoryGraphModel {
  const nodes = new Map<string, CytoscapeMemoryGraphElement>();
  const edges = new Map<string, CytoscapeMemoryGraphElement>();
  const renderedRecords = records.slice(0, MAX_RENDERED_MEMORY_NODES);

  for (const record of renderedRecords) {
    const memoryNodeId = appendNode(nodes, 'memory', record.summary, {
      recordId: record.id,
      sourceType: record.sourceType,
      recordType: record.memoryType,
      observedAt: record.observedAt ?? record.createdAt.slice(0, 10),
      searchText: compactSearchText([
        record.summary,
        record.memoryType,
        record.sourceType,
        record.observedAt,
        record.id,
        ...record.emotionTags,
        ...record.topicTags,
        ...record.projectTags,
        compactRawTextForSearch(record.rawText),
      ]),
    });

    appendTagEdges(nodes, edges, memoryNodeId, 'emotion', record.emotionTags);
    appendTagEdges(nodes, edges, memoryNodeId, 'topic', record.topicTags);
    appendTagEdges(nodes, edges, memoryNodeId, 'project', record.projectTags);

    if (record.decisionSignal !== 'none') {
      const decisionNodeId = appendNode(nodes, 'decision', record.decisionSignal);
      appendEdge(edges, memoryNodeId, decisionNodeId, 'decision');
    }

    if (record.outcomeText) {
      const outcomeNodeId = appendNode(nodes, 'outcome', record.outcomeText);
      appendEdge(edges, memoryNodeId, outcomeNodeId, 'outcome');
    }

    const sourceNodeId = appendNode(nodes, 'source', record.sourceType);
    appendEdge(edges, memoryNodeId, sourceNodeId, 'source');
  }

  const elements = [...nodes.values(), ...edges.values()];
  return {
    library: 'cytoscape',
    elements,
    stats: {
      memoryNodeCount: records.length,
      graphNodeCount: nodes.size,
      edgeCount: edges.size,
    },
  };
}
