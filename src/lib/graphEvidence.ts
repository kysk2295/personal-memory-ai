import type { AskMyPastSelfAnswer } from './askMyPastSelf';
import type { DecisionReplayResult } from './decisionReplay';
import type { MemoryRecord } from './memoryRecord';
import type { DetectedPattern, PatternDetectionStatus } from './patternDetector';

export type GraphEvidenceStatus = PatternDetectionStatus;

export type GraphEvidenceTrace =
  | {
      type: 'memory';
      id: string;
    }
  | {
      type: 'query';
      id: string;
    };

export type GraphEvidenceNodeKind =
  | 'query'
  | 'memory'
  | 'pattern'
  | 'emotion'
  | 'decision'
  | 'outcome'
  | 'choice'
  | 'topic'
  | 'unknown';

export type GraphEvidenceEdgeKind = 'ask_citation' | 'pattern_support' | 'decision_replay' | 'highlight_context';

export interface CurrentQueryEvidence {
  id?: string;
  text: string;
  createdAt?: string;
}

export interface EvidenceDrawerItem {
  highlightId: string;
  source: string;
  date: string;
  citation: string;
  status: GraphEvidenceStatus;
  trace: GraphEvidenceTrace[];
}

export interface GraphEvidenceNode {
  id: string;
  kind: GraphEvidenceNodeKind;
  label: string;
  highlighted: boolean;
  status: GraphEvidenceStatus;
  trace: GraphEvidenceTrace[];
  drawer: EvidenceDrawerItem;
}

export interface GraphEvidenceEdge {
  id: string;
  sourceId: string;
  targetId: string;
  kind: GraphEvidenceEdgeKind;
  highlighted: boolean;
  status: GraphEvidenceStatus;
  trace: GraphEvidenceTrace[];
  drawer: EvidenceDrawerItem;
}

export interface GraphEvidenceInput {
  currentQuery?: CurrentQueryEvidence;
  memories: readonly MemoryRecord[];
  askAnswer?: AskMyPastSelfAnswer;
  patterns?: readonly DetectedPattern[];
  replay?: DecisionReplayResult;
}

export interface GraphEvidencePayload {
  status: GraphEvidenceStatus;
  nodes: GraphEvidenceNode[];
  edges: GraphEvidenceEdge[];
  drawerItems: EvidenceDrawerItem[];
  highlightIds: string[];
}

function appendUnique<T>(target: T[], values: readonly T[]): void {
  for (const value of values) {
    if (!target.includes(value)) target.push(value);
  }
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

function slugifyGraphValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function createQueryNodeId(query: CurrentQueryEvidence): string {
  return `query:${query.id ?? stableHash(query.text)}`;
}

function createQuestionHighlightId(question: string): string {
  return `question:${slugifyGraphValue(question)}`;
}

function getNodeKind(highlightId: string): GraphEvidenceNodeKind {
  const [prefix] = highlightId.split(':', 1);
  if (prefix === 'query') return 'query';
  if (prefix === 'memory') return 'memory';
  if (prefix === 'pattern') return 'pattern';
  if (prefix === 'emotion') return 'emotion';
  if (prefix === 'decision') return 'decision';
  if (prefix === 'outcome') return 'outcome';
  if (prefix === 'choice') return 'choice';
  if (prefix === 'topic') return 'topic';
  return 'unknown';
}

function labelFromHighlightId(highlightId: string): string {
  const [, ...rest] = highlightId.split(':');
  return rest.join(':').replace(/-/g, ' ');
}

function getMemoryDate(memory: MemoryRecord): string {
  return memory.observedAt ?? memory.createdAt;
}

function buildMemoryCitation(memory: MemoryRecord): string {
  const outcome = memory.outcomeText ? ` Outcome: ${memory.outcomeText}` : '';
  return `${memory.summary}${outcome} [${memory.id}]`;
}

function buildMemoryDrawer(memory: MemoryRecord, status: GraphEvidenceStatus): EvidenceDrawerItem {
  return {
    highlightId: `memory:${memory.id}`,
    source: `${memory.sourceType}:${memory.sourceRef}`,
    date: getMemoryDate(memory),
    citation: buildMemoryCitation(memory),
    status,
    trace: [{ type: 'memory', id: memory.id }],
  };
}

function buildQueryDrawer(query: CurrentQueryEvidence, queryNodeId: string, status: GraphEvidenceStatus): EvidenceDrawerItem {
  return {
    highlightId: queryNodeId,
    source: 'current_query',
    date: query.createdAt ?? 'current_query',
    citation: query.text,
    status,
    trace: [{ type: 'query', id: query.id ?? queryNodeId }],
  };
}

function buildPatternDrawer(
  pattern: DetectedPattern,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  status: GraphEvidenceStatus,
): EvidenceDrawerItem {
  const supportingMemories = pattern.supportingMemoryIds
    .map((memoryId) => memoriesById.get(memoryId))
    .filter((memory): memory is MemoryRecord => Boolean(memory));

  return {
    highlightId: `pattern:${pattern.id}`,
    source: 'memory_records',
    date: supportingMemories[0] ? getMemoryDate(supportingMemories[0]) : 'no_memory_evidence',
    citation: `${pattern.explanation} [${pattern.supportingMemoryIds.join(', ')}]`,
    status,
    trace: pattern.supportingMemoryIds.map((id) => ({ type: 'memory', id })),
  };
}

function buildDerivedDrawer(
  highlightId: string,
  memories: readonly MemoryRecord[],
  status: GraphEvidenceStatus,
): EvidenceDrawerItem {
  const traces = memories.map((memory) => ({ type: 'memory' as const, id: memory.id }));
  return {
    highlightId,
    source: 'memory_records',
    date: memories[0] ? getMemoryDate(memories[0]) : 'current_query',
    citation: memories.map((memory) => `${memory.id}: ${memory.summary}`).join(' | '),
    status,
    trace: traces,
  };
}

function mapAskHighlightId(highlightId: string, input: GraphEvidenceInput, queryNodeId: string | undefined): string {
  if (!queryNodeId || !input.currentQuery) return highlightId;
  if (highlightId === createQuestionHighlightId(input.currentQuery.text)) return queryNodeId;
  return highlightId;
}

function buildHighlightIds(input: GraphEvidenceInput, queryNodeId: string | undefined): string[] {
  const rawHighlightIds: string[] = [];
  const orderedHighlightIds: string[] = [];
  const currentDecisionId = input.replay ? `decision:${input.replay.currentDecision.id}` : undefined;

  if (queryNodeId) appendUnique(rawHighlightIds, [queryNodeId]);
  if (currentDecisionId) appendUnique(rawHighlightIds, [currentDecisionId]);
  if (input.askAnswer) {
    appendUnique(
      rawHighlightIds,
      input.askAnswer.graphHighlightIds.map((highlightId) => mapAskHighlightId(highlightId, input, queryNodeId)),
    );
  }
  if (input.replay) appendUnique(rawHighlightIds, input.replay.graphHighlightIds);
  if (input.patterns) {
    appendUnique(
      rawHighlightIds,
      input.patterns
        .filter((pattern) => pattern.supportingMemoryIds.length > 0)
        .map((pattern) => `pattern:${pattern.id}`),
    );
  }

  const filteredHighlightIds = rawHighlightIds.filter((highlightId) => !highlightId.startsWith('question:'));
  if (queryNodeId) appendUnique(orderedHighlightIds, [queryNodeId]);
  if (currentDecisionId) appendUnique(orderedHighlightIds, [currentDecisionId]);
  for (const prefix of ['memory:', 'emotion:', 'decision:', 'outcome:', 'pattern:', 'choice:', 'topic:']) {
    appendUnique(
      orderedHighlightIds,
      filteredHighlightIds.filter((highlightId) => {
        if (highlightId === queryNodeId || highlightId === currentDecisionId) return false;
        return highlightId.startsWith(prefix);
      }),
    );
  }
  appendUnique(
    orderedHighlightIds,
    filteredHighlightIds.filter((highlightId) => !orderedHighlightIds.includes(highlightId)),
  );
  return orderedHighlightIds;
}

function traceForHighlightId(
  highlightId: string,
  input: GraphEvidenceInput,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  patternsById: ReadonlyMap<string, DetectedPattern>,
  queryNodeId: string | undefined,
): GraphEvidenceTrace[] {
  const replayDecisionId = input.replay?.currentDecision.id;
  const replayQueryId = input.currentQuery?.id ?? replayDecisionId;

  if (queryNodeId && highlightId === queryNodeId && input.currentQuery) {
    return [{ type: 'query', id: input.currentQuery.id ?? queryNodeId }];
  }

  if (highlightId.startsWith('memory:')) {
    const memoryId = highlightId.slice('memory:'.length);
    return memoriesById.has(memoryId) ? [{ type: 'memory', id: memoryId }] : [];
  }

  if (highlightId.startsWith('pattern:')) {
    const patternId = highlightId.slice('pattern:'.length);
    return (patternsById.get(patternId)?.supportingMemoryIds ?? []).map((id) => ({ type: 'memory', id }));
  }

  if (replayDecisionId && highlightId === `decision:${replayDecisionId}`) {
    return [{ type: 'query', id: replayQueryId ?? replayDecisionId }];
  }

  if (input.replay) {
    const currentDecisionHighlightIds = new Set([
      ...input.replay.currentDecision.emotions.map((emotion) => `emotion:${slugifyGraphValue(emotion)}`),
      ...input.replay.currentDecision.choices.map((choice) => `choice:${slugifyGraphValue(choice)}`),
      ...input.replay.currentDecision.topicTags.map((topic) => `topic:${slugifyGraphValue(topic)}`),
    ]);
    if (currentDecisionHighlightIds.has(highlightId)) {
      return [{ type: 'query', id: replayQueryId ?? input.replay.currentDecision.id }];
    }
  }

  const supportingMemoryIds = new Set([
    ...(input.askAnswer?.citationMemoryIds ?? []),
    ...(input.replay?.citationMemoryIds ?? []),
    ...((input.patterns ?? []).flatMap((pattern) => pattern.supportingMemoryIds)),
  ]);
  return [...supportingMemoryIds]
    .filter((memoryId) => memoriesById.has(memoryId))
    .map((id) => ({ type: 'memory', id }));
}

function drawerForHighlightId(
  highlightId: string,
  input: GraphEvidenceInput,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  patternsById: ReadonlyMap<string, DetectedPattern>,
  queryNodeId: string | undefined,
  status: GraphEvidenceStatus,
): EvidenceDrawerItem {
  if (queryNodeId && highlightId === queryNodeId && input.currentQuery) {
    return buildQueryDrawer(input.currentQuery, queryNodeId, status);
  }

  if (highlightId.startsWith('memory:')) {
    const memory = memoriesById.get(highlightId.slice('memory:'.length));
    if (memory) return buildMemoryDrawer(memory, status);
  }

  if (highlightId.startsWith('pattern:')) {
    const pattern = patternsById.get(highlightId.slice('pattern:'.length));
    if (pattern) return buildPatternDrawer(pattern, memoriesById, status);
  }

  const trace = traceForHighlightId(highlightId, input, memoriesById, patternsById, queryNodeId);
  const memories = trace
    .filter((item): item is Extract<GraphEvidenceTrace, { type: 'memory' }> => item.type === 'memory')
    .map((item) => memoriesById.get(item.id))
    .filter((memory): memory is MemoryRecord => Boolean(memory));
  const queryTrace = trace.find((item): item is Extract<GraphEvidenceTrace, { type: 'query' }> => item.type === 'query');
  if (queryTrace && memories.length === 0) {
    return {
      highlightId,
      source: 'current_query',
      date: input.currentQuery?.createdAt ?? 'current_query',
      citation: input.currentQuery?.text ?? input.replay?.currentDecision.prompt ?? labelFromHighlightId(highlightId),
      status,
      trace,
    };
  }

  const drawer = buildDerivedDrawer(highlightId, memories, status);
  return { ...drawer, trace };
}

function upsertNode(nodes: GraphEvidenceNode[], node: GraphEvidenceNode): void {
  if (nodes.some((existing) => existing.id === node.id)) return;
  nodes.push(node);
}

function createNode(
  highlightId: string,
  highlighted: boolean,
  input: GraphEvidenceInput,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  patternsById: ReadonlyMap<string, DetectedPattern>,
  queryNodeId: string | undefined,
  status: GraphEvidenceStatus,
): GraphEvidenceNode {
  const drawer = drawerForHighlightId(highlightId, input, memoriesById, patternsById, queryNodeId, status);
  return {
    id: highlightId,
    kind: getNodeKind(highlightId),
    label: labelFromHighlightId(highlightId),
    highlighted,
    status,
    trace: drawer.trace,
    drawer,
  };
}

function createEdge(
  sourceId: string,
  targetId: string,
  kind: GraphEvidenceEdgeKind,
  trace: readonly GraphEvidenceTrace[],
  status: GraphEvidenceStatus,
  input: GraphEvidenceInput,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  patternsById: ReadonlyMap<string, DetectedPattern>,
  queryNodeId: string | undefined,
): GraphEvidenceEdge {
  const drawer = drawerForHighlightId(targetId, input, memoriesById, patternsById, queryNodeId, status);
  const edgeDrawer: EvidenceDrawerItem = {
    ...drawer,
    highlightId: `edge:${sourceId}->${targetId}:${kind}`,
    trace: [...trace],
  };

  return {
    id: `edge:${sourceId}->${targetId}:${kind}`,
    sourceId,
    targetId,
    kind,
    highlighted: true,
    status,
    trace: [...trace],
    drawer: edgeDrawer,
  };
}

function appendEdge(edges: GraphEvidenceEdge[], edge: GraphEvidenceEdge): void {
  if (edges.some((existing) => existing.id === edge.id)) return;
  if (edge.trace.length === 0) return;
  edges.push(edge);
}

function buildEdges(
  input: GraphEvidenceInput,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  patternsById: ReadonlyMap<string, DetectedPattern>,
  queryNodeId: string | undefined,
  status: GraphEvidenceStatus,
): GraphEvidenceEdge[] {
  const edges: GraphEvidenceEdge[] = [];

  if (queryNodeId) {
    for (const memoryId of input.askAnswer?.citationMemoryIds ?? []) {
      appendEdge(
        edges,
        createEdge(
          queryNodeId,
          `memory:${memoryId}`,
          'ask_citation',
          [{ type: 'memory', id: memoryId }],
          status,
          input,
          memoriesById,
          patternsById,
          queryNodeId,
        ),
      );
    }
  }

  for (const pattern of patternsById.values()) {
    for (const memoryId of pattern.supportingMemoryIds) {
      appendEdge(
        edges,
        createEdge(
          `memory:${memoryId}`,
          `pattern:${pattern.id}`,
          'pattern_support',
          [{ type: 'memory', id: memoryId }],
          status,
          input,
          memoriesById,
          patternsById,
          queryNodeId,
        ),
      );
    }
  }

  if (input.replay) {
    const currentDecisionId = `decision:${input.replay.currentDecision.id}`;
    for (const memoryId of input.replay.citationMemoryIds) {
      appendEdge(
        edges,
        createEdge(
          currentDecisionId,
          `memory:${memoryId}`,
          'decision_replay',
          memoriesById.has(memoryId) ? [{ type: 'memory', id: memoryId }] : [],
          status,
          input,
          memoriesById,
          patternsById,
          queryNodeId,
        ),
      );
    }
  }

  return edges;
}

function resolveStatus(input: GraphEvidenceInput): GraphEvidenceStatus {
  if (input.askAnswer?.status === 'blocked' || input.replay?.status === 'blocked') return 'blocked';
  if (input.askAnswer?.status === 'fake/sample' || input.replay?.status === 'fake/sample') return 'fake/sample';
  if (input.askAnswer?.status === 'skeleton' || input.replay?.status === 'skeleton') return 'skeleton';
  if (input.askAnswer?.status === 'partial' || input.replay?.status === 'partial') return 'partial';
  if (input.askAnswer?.status === 'planned' || input.replay?.status === 'planned') return 'planned';
  return 'implemented';
}

export function buildGraphEvidence(input: GraphEvidenceInput): GraphEvidencePayload {
  const status = resolveStatus(input);
  const memoriesById = new Map(input.memories.map((memory) => [memory.id, memory]));
  const patternsById = new Map((input.patterns ?? []).map((pattern) => [pattern.id, pattern]));
  const queryNodeId = input.currentQuery ? createQueryNodeId(input.currentQuery) : undefined;
  const highlightIds = buildHighlightIds(input, queryNodeId);
  const highlightSet = new Set(highlightIds);
  const nodes: GraphEvidenceNode[] = [];

  if (queryNodeId) {
    upsertNode(nodes, createNode(queryNodeId, highlightSet.has(queryNodeId), input, memoriesById, patternsById, queryNodeId, status));
  }
  if (input.replay) {
    const currentDecisionId = `decision:${input.replay.currentDecision.id}`;
    upsertNode(
      nodes,
      createNode(currentDecisionId, highlightSet.has(currentDecisionId), input, memoriesById, patternsById, queryNodeId, status),
    );
  }
  for (const memory of input.memories) {
    const memoryNodeId = `memory:${memory.id}`;
    upsertNode(
      nodes,
      createNode(memoryNodeId, highlightSet.has(memoryNodeId), input, memoriesById, patternsById, queryNodeId, status),
    );
  }
  for (const highlightId of highlightIds) {
    if (highlightId.startsWith('query:') || highlightId.startsWith('memory:')) continue;
    if (input.replay && highlightId === `decision:${input.replay.currentDecision.id}`) continue;
    upsertNode(nodes, createNode(highlightId, true, input, memoriesById, patternsById, queryNodeId, status));
  }

  const edges = buildEdges(input, memoriesById, patternsById, queryNodeId, status);
  const drawerItems = [
    ...nodes.filter((node) => node.highlighted).map((node) => node.drawer),
    ...edges.filter((edge) => edge.highlighted).map((edge) => edge.drawer),
  ];

  return {
    status,
    nodes,
    edges,
    drawerItems,
    highlightIds,
  };
}

export type GraphEvidenceAdapterTrace =
  | {
      type: 'memory';
      memoryId: string;
    }
  | {
      type: 'current_query';
      queryId: string;
    };

export type GraphEvidenceAdapterNodeKind =
  | 'current_query'
  | 'memory'
  | 'pattern'
  | 'emotion'
  | 'decision'
  | 'outcome'
  | 'choice'
  | 'topic'
  | 'unknown';

export interface GraphEvidenceAdapterDrawer {
  source: string;
  date: string;
  citation: string;
  sourceRef?: string;
  status: GraphEvidenceStatus;
}

export interface GraphEvidenceAdapterNode {
  id: string;
  kind: GraphEvidenceAdapterNodeKind;
  label: string;
  status: GraphEvidenceStatus;
  traces: GraphEvidenceAdapterTrace[];
  drawer: GraphEvidenceAdapterDrawer;
}

export interface GraphEvidenceAdapterEdge {
  id: string;
  from: string;
  to: string;
  kind: 'supports' | 'has_choice';
  status: GraphEvidenceStatus;
  traces: GraphEvidenceAdapterTrace[];
  drawer: GraphEvidenceAdapterDrawer;
}

export interface GraphEvidenceAdapterResult {
  status: GraphEvidenceStatus;
  nodes: GraphEvidenceAdapterNode[];
  edges: GraphEvidenceAdapterEdge[];
  highlightIds: string[];
}

export interface CreateGraphEvidenceFromAskInput {
  answer: AskMyPastSelfAnswer;
  memories: readonly MemoryRecord[];
  currentQuery: Required<Pick<CurrentQueryEvidence, 'id' | 'text'>> & Pick<CurrentQueryEvidence, 'createdAt'>;
  patterns?: readonly DetectedPattern[];
}

export interface CreateGraphEvidenceFromPatternsInput {
  result: {
    status: GraphEvidenceStatus;
    patterns: readonly DetectedPattern[];
  };
  memories: readonly MemoryRecord[];
}

export interface CreateGraphEvidenceFromDecisionReplayInput {
  result: DecisionReplayResult;
  memories: readonly MemoryRecord[];
}

function adapterKindFromHighlightId(highlightId: string, currentQueryId?: string): GraphEvidenceAdapterNodeKind {
  if (highlightId === currentQueryId) return 'current_query';
  const kind = getNodeKind(highlightId);
  return kind === 'query' ? 'current_query' : kind;
}

function adapterMemoryDrawer(memory: MemoryRecord, status: GraphEvidenceStatus): GraphEvidenceAdapterDrawer {
  return {
    source: memory.sourceType,
    date: memory.observedAt ?? memory.createdAt,
    citation: memory.id,
    sourceRef: memory.sourceRef,
    status,
  };
}

function adapterCurrentQueryDrawer(queryId: string, status: GraphEvidenceStatus): GraphEvidenceAdapterDrawer {
  return {
    source: 'current_query',
    date: 'current_query',
    citation: `current_query:${queryId}`,
    status,
  };
}

function adapterPatternDrawer(
  pattern: DetectedPattern,
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  status: GraphEvidenceStatus,
): GraphEvidenceAdapterDrawer {
  const firstMemory = pattern.supportingMemoryIds
    .map((memoryId) => memoriesById.get(memoryId))
    .find((memory): memory is MemoryRecord => Boolean(memory));

  if (!firstMemory) {
    return {
      source: 'memory_records',
      date: 'no_memory_evidence',
      citation: pattern.id,
      status,
    };
  }

  return {
    source: firstMemory.sourceType,
    date: firstMemory.observedAt ?? firstMemory.createdAt,
    citation: firstMemory.id,
    sourceRef: firstMemory.sourceRef,
    status,
  };
}

function adapterTraceForMemoryIds(memoryIds: readonly string[]): GraphEvidenceAdapterTrace[] {
  return memoryIds.map((memoryId) => ({ type: 'memory', memoryId }));
}

function adapterDerivedDrawer(
  traces: readonly GraphEvidenceAdapterTrace[],
  memoriesById: ReadonlyMap<string, MemoryRecord>,
  status: GraphEvidenceStatus,
): GraphEvidenceAdapterDrawer {
  const firstMemoryTrace = traces.find(
    (trace): trace is Extract<GraphEvidenceAdapterTrace, { type: 'memory' }> => trace.type === 'memory',
  );
  const firstMemory = firstMemoryTrace ? memoriesById.get(firstMemoryTrace.memoryId) : undefined;
  if (firstMemory) return adapterMemoryDrawer(firstMemory, status);

  const firstQueryTrace = traces.find(
    (trace): trace is Extract<GraphEvidenceAdapterTrace, { type: 'current_query' }> => trace.type === 'current_query',
  );
  if (firstQueryTrace) return adapterCurrentQueryDrawer(firstQueryTrace.queryId, status);

  return {
    source: 'memory_records',
    date: 'missing_trace',
    citation: 'missing_trace',
    status,
  };
}

function createAdapterNode(
  id: string,
  status: GraphEvidenceStatus,
  traces: readonly GraphEvidenceAdapterTrace[],
  drawer: GraphEvidenceAdapterDrawer,
  currentQueryId?: string,
): GraphEvidenceAdapterNode {
  return {
    id,
    kind: adapterKindFromHighlightId(id, currentQueryId),
    label: labelFromHighlightId(id),
    status,
    traces: [...traces],
    drawer,
  };
}

function appendAdapterNode(nodes: GraphEvidenceAdapterNode[], node: GraphEvidenceAdapterNode): void {
  if (node.traces.length === 0) return;
  if (nodes.some((existing) => existing.id === node.id)) return;
  nodes.push(node);
}

function appendAdapterEdge(edges: GraphEvidenceAdapterEdge[], edge: GraphEvidenceAdapterEdge): void {
  if (edge.traces.length === 0) return;
  if (edges.some((existing) => existing.id === edge.id)) return;
  edges.push(edge);
}

function sortedHighlightIds(highlightIds: readonly string[]): string[] {
  return [...new Set(highlightIds)].sort((left, right) => left.localeCompare(right));
}

function buildMemoryLookupForAdapter(memories: readonly MemoryRecord[]): Map<string, MemoryRecord> {
  return new Map(memories.map((memory) => [memory.id, memory]));
}

function traceForDerivedAskNode(
  highlightId: string,
  citationMemoryIds: readonly string[],
  patternsById: ReadonlyMap<string, DetectedPattern>,
): GraphEvidenceAdapterTrace[] {
  if (highlightId.startsWith('pattern:')) {
    const pattern = patternsById.get(highlightId.slice('pattern:'.length));
    if (pattern) return adapterTraceForMemoryIds(pattern.supportingMemoryIds);
  }
  return adapterTraceForMemoryIds(citationMemoryIds);
}

export function createGraphEvidenceFromAsk(input: CreateGraphEvidenceFromAskInput): GraphEvidenceAdapterResult {
  const memoriesById = buildMemoryLookupForAdapter(input.memories);
  const patternsById = new Map((input.patterns ?? []).map((pattern) => [pattern.id, pattern]));
  const nodes: GraphEvidenceAdapterNode[] = [];
  const edges: GraphEvidenceAdapterEdge[] = [];
  const questionId = input.answer.graphHighlightIds.find((highlightId) => highlightId.startsWith('question:'));
  const highlightIds = sortedHighlightIds(input.answer.graphHighlightIds);

  for (const highlightId of highlightIds) {
    if (highlightId === questionId) {
      appendAdapterNode(
        nodes,
        createAdapterNode(
          highlightId,
          input.answer.status,
          [{ type: 'current_query', queryId: input.currentQuery.id }],
          adapterCurrentQueryDrawer(input.currentQuery.id, input.answer.status),
          questionId,
        ),
      );
      continue;
    }

    if (highlightId.startsWith('memory:')) {
      const memory = memoriesById.get(highlightId.slice('memory:'.length));
      if (!memory) continue;
      appendAdapterNode(
        nodes,
        createAdapterNode(
          highlightId,
          input.answer.status,
          [{ type: 'memory', memoryId: memory.id }],
          adapterMemoryDrawer(memory, input.answer.status),
          questionId,
        ),
      );
      continue;
    }

    if (highlightId.startsWith('pattern:')) {
      const pattern = patternsById.get(highlightId.slice('pattern:'.length));
      if (!pattern) continue;
      appendAdapterNode(
        nodes,
        createAdapterNode(
          highlightId,
          input.answer.status,
          adapterTraceForMemoryIds(pattern.supportingMemoryIds),
          adapterPatternDrawer(pattern, memoriesById, input.answer.status),
          questionId,
        ),
      );
      continue;
    }

    const traces = traceForDerivedAskNode(highlightId, input.answer.citationMemoryIds, patternsById);
    appendAdapterNode(
      nodes,
      createAdapterNode(
        highlightId,
        input.answer.status,
        traces,
        adapterDerivedDrawer(traces, memoriesById, input.answer.status),
        questionId,
      ),
    );
  }

  if (questionId) {
    for (const memoryId of input.answer.citationMemoryIds) {
      const memory = memoriesById.get(memoryId);
      if (!memory) continue;
      appendAdapterEdge(edges, {
        id: `edge:supports:${questionId}->memory:${memoryId}`,
        from: questionId,
        to: `memory:${memoryId}`,
        kind: 'supports',
        status: input.answer.status,
        traces: [{ type: 'memory', memoryId }],
        drawer: adapterMemoryDrawer(memory, input.answer.status),
      });
    }
  }

  return {
    status: input.answer.status,
    nodes,
    edges,
    highlightIds,
  };
}

export function createGraphEvidenceFromPatterns(input: CreateGraphEvidenceFromPatternsInput): GraphEvidenceAdapterResult {
  const memoriesById = buildMemoryLookupForAdapter(input.memories);
  const nodes: GraphEvidenceAdapterNode[] = [];
  const edges: GraphEvidenceAdapterEdge[] = [];
  const rawHighlightIds: string[] = [];

  for (const pattern of input.result.patterns) {
    if (pattern.supportingMemoryIds.length === 0) continue;

    const patternId = `pattern:${pattern.id}`;
    appendUnique(rawHighlightIds, [patternId]);
    appendAdapterNode(
      nodes,
      createAdapterNode(
        patternId,
        input.result.status,
        adapterTraceForMemoryIds(pattern.supportingMemoryIds),
        adapterPatternDrawer(pattern, memoriesById, input.result.status),
      ),
    );

    for (const memoryId of pattern.supportingMemoryIds) {
      const memory = memoriesById.get(memoryId);
      if (!memory) continue;
      const memoryNodeId = `memory:${memoryId}`;
      appendUnique(rawHighlightIds, [memoryNodeId]);
      appendAdapterNode(
        nodes,
        createAdapterNode(
          memoryNodeId,
          input.result.status,
          [{ type: 'memory', memoryId }],
          adapterMemoryDrawer(memory, input.result.status),
        ),
      );
      appendAdapterEdge(edges, {
        id: `edge:supports:${memoryNodeId}->${patternId}`,
        from: memoryNodeId,
        to: patternId,
        kind: 'supports',
        status: input.result.status,
        traces: [{ type: 'memory', memoryId }],
        drawer: adapterMemoryDrawer(memory, input.result.status),
      });
    }
  }

  return {
    status: input.result.status,
    nodes,
    edges,
    highlightIds: sortedHighlightIds(rawHighlightIds),
  };
}

function findMemoryIdForOutcome(
  outcomeHighlightId: string,
  memories: readonly MemoryRecord[],
): string | undefined {
  const outcomeSlug = outcomeHighlightId.slice('outcome:'.length);
  return memories.find((memory) => memory.outcomeText && slugifyGraphValue(memory.outcomeText) === outcomeSlug)?.id;
}

export function createGraphEvidenceFromDecisionReplay(
  input: CreateGraphEvidenceFromDecisionReplayInput,
): GraphEvidenceAdapterResult {
  const memoriesById = buildMemoryLookupForAdapter(input.memories);
  const nodes: GraphEvidenceAdapterNode[] = [];
  const edges: GraphEvidenceAdapterEdge[] = [];
  const currentDecisionId = `decision:${input.result.currentDecision.id}`;
  const currentDecisionTrace: GraphEvidenceAdapterTrace = {
    type: 'current_query',
    queryId: input.result.currentDecision.id,
  };
  const highlightIds = sortedHighlightIds(input.result.graphHighlightIds);

  for (const highlightId of highlightIds) {
    if (highlightId === currentDecisionId || highlightId.startsWith('choice:') || highlightId.startsWith('topic:')) {
      appendAdapterNode(
        nodes,
        createAdapterNode(
          highlightId,
          input.result.status,
          [currentDecisionTrace],
          adapterCurrentQueryDrawer(input.result.currentDecision.id, input.result.status),
          currentDecisionId,
        ),
      );
      continue;
    }

    if (highlightId.startsWith('memory:')) {
      const memory = memoriesById.get(highlightId.slice('memory:'.length));
      if (!memory) continue;
      appendAdapterNode(
        nodes,
        createAdapterNode(
          highlightId,
          input.result.status,
          [{ type: 'memory', memoryId: memory.id }],
          adapterMemoryDrawer(memory, input.result.status),
          currentDecisionId,
        ),
      );
      continue;
    }

    if (highlightId.startsWith('outcome:')) {
      const memoryId = findMemoryIdForOutcome(highlightId, input.memories);
      const traces = memoryId ? [{ type: 'memory' as const, memoryId }] : adapterTraceForMemoryIds(input.result.citationMemoryIds);
      appendAdapterNode(
        nodes,
        createAdapterNode(
          highlightId,
          input.result.status,
          traces,
          adapterDerivedDrawer(traces, memoriesById, input.result.status),
          currentDecisionId,
        ),
      );
      continue;
    }

    const traces = highlightId.startsWith('emotion:')
      ? [currentDecisionTrace]
      : adapterTraceForMemoryIds(input.result.citationMemoryIds);
    appendAdapterNode(
      nodes,
      createAdapterNode(
        highlightId,
        input.result.status,
        traces,
        adapterDerivedDrawer(traces, memoriesById, input.result.status),
        currentDecisionId,
      ),
    );
  }

  for (const memoryId of input.result.citationMemoryIds) {
    const memory = memoriesById.get(memoryId);
    if (!memory) continue;
    appendAdapterEdge(edges, {
      id: `edge:supports:${currentDecisionId}->memory:${memoryId}`,
      from: currentDecisionId,
      to: `memory:${memoryId}`,
      kind: 'supports',
      status: input.result.status,
      traces: [{ type: 'memory', memoryId }],
      drawer: adapterMemoryDrawer(memory, input.result.status),
    });
  }

  for (const choice of input.result.currentDecision.choices) {
    const choiceId = `choice:${slugifyGraphValue(choice)}`;
    appendAdapterEdge(edges, {
      id: `edge:has_choice:${currentDecisionId}->${choiceId}`,
      from: currentDecisionId,
      to: choiceId,
      kind: 'has_choice',
      status: input.result.status,
      traces: [currentDecisionTrace],
      drawer: adapterCurrentQueryDrawer(input.result.currentDecision.id, input.result.status),
    });
  }

  return {
    status: input.result.status,
    nodes,
    edges,
    highlightIds,
  };
}
