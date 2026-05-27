import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

const SELECTED_NODE_ID = 'memory:mem_freeze_vs_feature_addition';
export const BENCHMARK_GRAPH_NODE_COUNT = 225;
export const BENCHMARK_GRAPH_EDGE_COUNT = 1010;

const MEMORY_POSITIONS: Record<string, { x: number; y: number }> = {
  'memory:mem_launch_may_anxiety_scope_delay': { x: 382, y: 248 },
  'memory:mem_launch_june_anxiety_scope_delay': { x: 542, y: 210 },
  'memory:mem_freeze_vs_feature_addition': { x: 498, y: 332 },
  'memory:mem_unrelated_calm_import': { x: 392, y: 462 },
  'memory:mem_captured_ship_note': { x: 648, y: 408 },
};

const AMBIENT_NODE_COUNT = BENCHMARK_GRAPH_NODE_COUNT;
const GRAPH_VIEW_BOX = { width: 860, height: 620 };

const AMBIENT_LABELS = [
  'semantic',
  'reflective',
  'procedural',
  'trigger',
  'supports',
  'import',
  'near-miss',
  'topic',
  'thesis',
  'preview',
  'rename-notes',
  'release',
  'knowledge-base',
  'embeddings',
  'plugins',
  'backlinks',
];

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function buildAmbientNodePositions(): Array<{ x: number; y: number }> {
  const clusters = [
    { x: 180, y: 142, rx: 128, ry: 82 },
    { x: 690, y: 148, rx: 134, ry: 96 },
    { x: 220, y: 454, rx: 150, ry: 112 },
    { x: 656, y: 468, rx: 152, ry: 106 },
    { x: 498, y: 330, rx: 210, ry: 146 },
  ];

  return Array.from({ length: AMBIENT_NODE_COUNT }, (_, index) => {
    const cluster = clusters[index % clusters.length];
    const angle = index * 2.399963 + (index % clusters.length) * 0.37;
    const ring = 0.2 + (((index * 37) % 100) / 100) * 0.84;
    const x =
      cluster.x +
      Math.cos(angle) * cluster.rx * ring +
      Math.sin(index * 1.83) * (8 + (index % 5) * 3);
    const y =
      cluster.y +
      Math.sin(angle) * cluster.ry * ring +
      Math.cos(index * 1.41) * (6 + (index % 4) * 4);

    return {
      x: Math.round(clamp(x, 26, GRAPH_VIEW_BOX.width - 30)),
      y: Math.round(clamp(y, 36, GRAPH_VIEW_BOX.height - 34)),
    };
  });
}

function buildAmbientEdges(): Array<[number, number]> {
  const edges: Array<[number, number]> = [];
  const seen = new Set<string>();

  const addEdge = (left: number, right: number): boolean => {
    if (left === right) return false;
    const key = left < right ? `${left}:${right}` : `${right}:${left}`;
    if (seen.has(key)) return false;
    seen.add(key);
    edges.push([left, right]);
    return true;
  };

  const offsets = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89];
  for (const offset of offsets) {
    for (let index = 0; index < AMBIENT_NODE_COUNT; index += 1) {
      addEdge(index, (index + offset) % AMBIENT_NODE_COUNT);
      if (edges.length >= BENCHMARK_GRAPH_EDGE_COUNT) return edges;
    }
  }

  let seed = 0;
  while (edges.length < BENCHMARK_GRAPH_EDGE_COUNT) {
    const left = seed % AMBIENT_NODE_COUNT;
    const right = (seed * 37 + 17) % AMBIENT_NODE_COUNT;
    addEdge(left, right);
    seed += 1;
  }

  return edges;
}

const BACKGROUND_NODE_POSITIONS = buildAmbientNodePositions();
const BACKGROUND_EDGES = buildAmbientEdges();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.slice(0, Math.max(0, maxLength - 3)).trimEnd()}...`;
}

function renderHighlightAttributes(highlightId: string, highlightedIds: ReadonlySet<string>): string {
  return `data-highlight-id="${escapeHtml(highlightId)}" data-highlight-status="${
    highlightedIds.has(highlightId) ? 'active' : 'inactive'
  }"`;
}

function nodePosition(nodeId: string): { x: number; y: number } {
  return MEMORY_POSITIONS[nodeId] ?? { x: 498, y: 332 };
}

function ambientFilterKind(index: number): string {
  if (index % 11 === 0) return 'thesis';
  if (index % 7 === 0) return 'source';
  if (index % 5 === 0) return 'reflective';
  if (index % 3 === 0) return 'episodic';
  return 'semantic';
}

function memoryFilterKind(recordType: string): string {
  if (recordType === 'decision' || recordType === 'outcome') return 'thesis';
  if (recordType === 'reflection' || recordType === 'pattern') return 'reflective';
  if (recordType === 'episodic' || recordType === 'diary') return 'episodic';
  if (recordType === 'project' || recordType === 'emotion') return 'semantic';
  return 'source';
}

function highlightFilterKind(highlightId: string): string {
  if (highlightId.startsWith('outcome:') || highlightId.startsWith('choice:') || highlightId.startsWith('decision:')) return 'thesis';
  if (highlightId.startsWith('pattern:') || highlightId.startsWith('emotion:')) return 'reflective';
  if (highlightId.startsWith('source:')) return 'source';
  return 'semantic';
}

function renderBackgroundEdges(): string {
  return BACKGROUND_EDGES.map(([left, right], index) => {
    const source = BACKGROUND_NODE_POSITIONS[left];
    const target = BACKGROUND_NODE_POSITIONS[right];
    if (!source || !target) return '';
    const filterKind = ambientFilterKind(index);
    return `<line class="ghost-memory-edge obsidian-faded-edge" data-filter-kind="${filterKind}" data-filter-active="true" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke-dasharray="${
      index % 4 === 0 ? '0' : '2 4'
    }" />`;
  }).join('');
}

function renderBackgroundNodes(): string {
  return BACKGROUND_NODE_POSITIONS.map((position, index) => {
    const label =
      index % 6 === 0 ? AMBIENT_LABELS[Math.floor(index / 6) % AMBIENT_LABELS.length] : index % 17 === 0 ? `trace-${index + 1}` : '';
    const offsetX = index % 2 === 0 ? 12 : -8;
    const anchor = index % 2 === 0 ? 'start' : 'end';
    const filterKind = ambientFilterKind(index);
    return `<g class="ghost-memory-cluster obsidian-background-cluster" data-filter-kind="${filterKind}" data-filter-active="true">
      <circle class="ghost-memory-node obsidian-background-node" cx="${position.x}" cy="${position.y}" r="${
        index % 13 === 0 ? 5.6 : index % 4 === 0 ? 4.2 : 2.9
      }" />
      ${
        label
          ? `<text class="ghost-memory-label obsidian-faded-label" x="${position.x + offsetX}" y="${position.y + 4}" text-anchor="${anchor}">${escapeHtml(label)}</text>`
          : ''
      }
    </g>`;
  }).join('');
}

function renderSelectedHalo(position: { x: number; y: number }): string {
  return `<g class="selected-node-affordance obsidian-selected-affordance" aria-label="Selected node affordance">
    <circle class="selected-node-halo obsidian-selected-halo" cx="${position.x}" cy="${position.y}" r="52" />
    <circle class="selected-node-handle obsidian-selected-handle" cx="${position.x + 48}" cy="${position.y - 48}" r="4" />
  </g>`;
}

function renderQuestionNode(question: string, highlightedIds: ReadonlySet<string>): string {
  const questionHighlightId = `question:${question}`;
  return `<g class="graph-question-node obsidian-question-pill" data-filter-kind="semantic" data-filter-active="true" ${renderHighlightAttributes(questionHighlightId, highlightedIds)}>
    <rect x="384" y="40" width="230" height="30" rx="15" />
    <text x="499" y="59" text-anchor="middle">${escapeHtml(truncate(question, 32))}</text>
  </g>`;
}

function renderCurrentDecision(layout: InitialAppShellEvidenceLayout, highlightedIds: ReadonlySet<string>): string {
  const highlightId = `decision:${layout.replay.currentDecision.id}`;
  return `<g class="graph-current-decision-node obsidian-decision-chip" data-filter-kind="thesis" data-filter-active="true" ${renderHighlightAttributes(highlightId, highlightedIds)}>
    <circle cx="672" cy="160" r="6" />
    <text x="686" y="165" class="obsidian-node-label">${escapeHtml(truncate(layout.replay.currentDecision.prompt, 28))}</text>
  </g>`;
}

function renderMemoryEdges(layout: InitialAppShellEvidenceLayout): string {
  const selectedPosition = nodePosition(SELECTED_NODE_ID);
  return layout.primaryNodes
    .filter((node) => node.id !== SELECTED_NODE_ID)
    .map((node) => {
      const position = nodePosition(node.id);
      const fromCitationId = SELECTED_NODE_ID.replace(/^memory:/, '');
      const toCitationId = node.id.replace(/^memory:/, '');
      return `<line class="semantic-edge obsidian-spoke-edge" data-filter-kind="semantic" data-filter-active="true" data-edge-from="${escapeHtml(fromCitationId)}" data-edge-to="${escapeHtml(
        toCitationId,
      )}" data-edge-active="true" x1="${
        selectedPosition.x
      }" y1="${selectedPosition.y}" x2="${position.x}" y2="${position.y}" />`;
    })
    .join('');
}

function renderHighlightEchoNodes(highlightIds: readonly string[], highlightedIds: ReadonlySet<string>): string {
  const filtered = highlightIds.filter((highlightId) => /^(emotion|outcome|pattern|topic|choice):/.test(highlightId)).slice(0, 6);
  const echoPositions = [
    { x: 302, y: 284 },
    { x: 344, y: 408 },
    { x: 556, y: 470 },
    { x: 736, y: 364 },
    { x: 606, y: 506 },
    { x: 748, y: 278 },
  ];
  return filtered
    .map((highlightId, index) => {
      const position = echoPositions[index] ?? { x: 760, y: 180 + index * 22 };
      return `<g class="graph-highlight-node obsidian-echo-node" data-filter-kind="${highlightFilterKind(
        highlightId,
      )}" data-filter-active="true" ${renderHighlightAttributes(highlightId, highlightedIds)}>
        <circle cx="${position.x}" cy="${position.y}" r="5" />
        <text x="${position.x + 12}" y="${position.y + 4}" class="satellite-label obsidian-faded-label">${escapeHtml(
          truncate(highlightId.replace(/^[^:]+:/, ''), 24),
        )}</text>
      </g>`;
    })
    .join('');
}

function renderMemoryNodes(layout: InitialAppShellEvidenceLayout, highlightedIds: ReadonlySet<string>): string {
  return layout.primaryNodes
    .map((node) => {
      const position = nodePosition(node.id);
      const citationId = node.id.replace(/^memory:/, '');
      const isSelected = node.id === SELECTED_NODE_ID;
      const isHighlighted = highlightedIds.has(node.id);
      const label = isSelected ? truncate(node.summary, 18) : truncate(node.summary, 28);
      const labelX = isSelected ? position.x + 28 : position.x + 14;
      const labelY = isSelected ? position.y - 18 : position.y + 4;
      const filterKind = memoryFilterKind(node.recordType);
      const searchText = [node.summary, node.recordType, node.sourceType, node.observedAt, citationId].join(' ').toLocaleLowerCase();
      return `<g class="memory-node obsidian-memory-node ${isSelected ? 'obsidian-selected-memory' : 'obsidian-secondary-memory'} ${
        isHighlighted ? 'graph-highlight-active' : ''
      }" ${renderHighlightAttributes(node.id, highlightedIds)} data-filter-kind="${filterKind}" data-filter-active="true" data-search-text="${escapeHtml(
        searchText,
      )}" data-search-match="true" data-control="select-memory" data-selected="${String(
        isSelected,
      )}" data-inspector-title="${escapeHtml(node.summary)}" data-inspector-source="${escapeHtml(
        `${node.sourceType} · ${node.recordType} · ${node.observedAt}`,
      )}" data-inspector-body="${escapeHtml(
        `선택한 기억: ${node.summary} Outcome and source evidence stay linked through ${citationId}.`,
      )}" data-inspector-citation="${escapeHtml(citationId)}" tabindex="0" role="button" aria-label="Select memory ${escapeHtml(
        truncate(node.summary, 48),
      )}">
        <title>${escapeHtml(node.summary)}</title>
        <circle class="obsidian-node-core" cx="${position.x}" cy="${position.y}" r="${isSelected ? '22' : '6'}" />
        <circle class="obsidian-node-ring" cx="${position.x}" cy="${position.y}" r="${isSelected ? '24' : '6'}" />
        <text x="${labelX}" y="${labelY}" class="node-title obsidian-node-label ${
          isSelected ? 'obsidian-selected-label' : ''
        }">${escapeHtml(label)}</text>
      </g>`;
    })
    .join('');
}

export function renderMemoryGraph(layout: InitialAppShellEvidenceLayout): string {
  const graphHighlightIds = [...layout.ask.graphHighlightIds];
  for (const highlightId of layout.replay.graphHighlightIds) {
    if (!graphHighlightIds.includes(highlightId)) graphHighlightIds.push(highlightId);
  }
  const highlightedIds = new Set(graphHighlightIds);
  const selectedPosition = nodePosition(SELECTED_NODE_ID);

  return `<section class="graph-workspace obsidian-graph-workspace" aria-label="Initial loaded memory-brain graph private evidence workspace" data-ambient-node-count="${AMBIENT_NODE_COUNT}" data-ambient-edge-count="${BACKGROUND_EDGES.length}" data-graph-density="benchmark-dense">
    <svg class="memory-graph obsidian-memory-graph" viewBox="0 0 ${GRAPH_VIEW_BOX.width} ${
      GRAPH_VIEW_BOX.height
    }" role="img" aria-label="Private memory brain graph linking diary and imported records to emotion, project, decision, outcome, and source evidence" data-ambient-node-count="${AMBIENT_NODE_COUNT}" data-ambient-edge-count="${BACKGROUND_EDGES.length}" data-graph-density="benchmark-dense" data-current-question-id="${escapeHtml(
      layout.ask.graphHighlightIds[0] ?? '',
    )}">
      <rect x="0" y="0" width="${GRAPH_VIEW_BOX.width}" height="${GRAPH_VIEW_BOX.height}" rx="0" class="obsidian-graph-surface" />
      ${renderBackgroundEdges()}
      ${renderMemoryEdges(layout)}
      ${renderBackgroundNodes()}
      ${renderQuestionNode(layout.askQuestion, highlightedIds)}
      ${renderCurrentDecision(layout, highlightedIds)}
      ${renderHighlightEchoNodes(graphHighlightIds, highlightedIds)}
      ${renderSelectedHalo(selectedPosition)}
      ${renderMemoryNodes(layout, highlightedIds)}
    </svg>
    <div class="graph-support-copy" aria-label="Graph supporting cues">
      <span class="hero-pill">Private diary and imported records become citation-backed memory nodes</span>
      <span class="hero-pill">Selected node remains wired to Ask My Past Self inspector</span>
    </div>
    <div class="graph-highlight-manifest" aria-label="Active Ask My Past Self graph highlights">
      ${graphHighlightIds
        .map((highlightId) => `<span data-highlight-id="${escapeHtml(highlightId)}">${escapeHtml(highlightId)}</span>`)
        .join('')}
    </div>
    <div class="graph-support-list" aria-label="Primary loaded memories">
      ${layout.primaryNodes
        .slice(0, 5)
        .map((node) => `<span>${escapeHtml(node.sourceType)} · ${escapeHtml(node.recordType)} · ${escapeHtml(truncate(node.summary, 44))}</span>`)
        .join('')}
    </div>
  </section>`;
}
