import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

const SELECTED_NODE_ID = 'memory:mem_freeze_vs_feature_addition';

const MEMORY_POSITIONS: Record<string, { x: number; y: number }> = {
  'memory:mem_launch_may_anxiety_scope_delay': { x: 434, y: 244 },
  'memory:mem_launch_june_anxiety_scope_delay': { x: 538, y: 194 },
  'memory:mem_freeze_vs_feature_addition': { x: 498, y: 332 },
  'memory:mem_unrelated_calm_import': { x: 420, y: 448 },
  'memory:mem_captured_ship_note': { x: 650, y: 380 },
};

const BACKGROUND_NODE_POSITIONS = [
  { x: 134, y: 118 },
  { x: 202, y: 168 },
  { x: 278, y: 122 },
  { x: 332, y: 84 },
  { x: 338, y: 226 },
  { x: 286, y: 514 },
  { x: 366, y: 548 },
  { x: 458, y: 548 },
  { x: 622, y: 88 },
  { x: 732, y: 128 },
  { x: 788, y: 220 },
  { x: 804, y: 420 },
  { x: 676, y: 516 },
  { x: 746, y: 558 },
  { x: 198, y: 396 },
  { x: 234, y: 462 },
];

const BACKGROUND_LABELS = [
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

const BACKGROUND_EDGES: Array<[number, number]> = [
  [0, 1],
  [1, 4],
  [2, 3],
  [2, 7],
  [3, 8],
  [4, 5],
  [4, 9],
  [5, 6],
  [6, 7],
  [8, 9],
  [9, 10],
  [10, 11],
  [11, 12],
  [12, 13],
  [14, 15],
  [14, 5],
];

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

function renderBackgroundEdges(): string {
  return BACKGROUND_EDGES.map(([left, right], index) => {
    const source = BACKGROUND_NODE_POSITIONS[left];
    const target = BACKGROUND_NODE_POSITIONS[right];
    if (!source || !target) return '';
    return `<line class="ghost-memory-edge obsidian-faded-edge" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke-dasharray="${
      index % 4 === 0 ? '0' : '2 4'
    }" />`;
  }).join('');
}

function renderBackgroundNodes(): string {
  return BACKGROUND_NODE_POSITIONS.map((position, index) => {
    const label = BACKGROUND_LABELS[index] ?? `ambient-${index + 1}`;
    const offsetX = index % 2 === 0 ? 12 : -8;
    const anchor = index % 2 === 0 ? 'start' : 'end';
    return `<g class="ghost-memory-cluster obsidian-background-cluster">
      <circle class="ghost-memory-node obsidian-background-node" cx="${position.x}" cy="${position.y}" r="${index % 3 === 0 ? 6 : 4}" />
      <text class="ghost-memory-label obsidian-faded-label" x="${position.x + offsetX}" y="${position.y + 4}" text-anchor="${anchor}">${escapeHtml(label)}</text>
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
  return `<g class="graph-question-node obsidian-question-pill" ${renderHighlightAttributes(questionHighlightId, highlightedIds)}>
    <rect x="384" y="40" width="230" height="30" rx="15" />
    <text x="499" y="59" text-anchor="middle">${escapeHtml(truncate(question, 32))}</text>
  </g>`;
}

function renderCurrentDecision(layout: InitialAppShellEvidenceLayout, highlightedIds: ReadonlySet<string>): string {
  const highlightId = `decision:${layout.replay.currentDecision.id}`;
  return `<g class="graph-current-decision-node obsidian-decision-chip" ${renderHighlightAttributes(highlightId, highlightedIds)}>
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
      return `<line class="semantic-edge obsidian-spoke-edge" data-edge-from="${escapeHtml(fromCitationId)}" data-edge-to="${escapeHtml(
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
      return `<g class="graph-highlight-node obsidian-echo-node" ${renderHighlightAttributes(highlightId, highlightedIds)}>
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
      const label = isSelected ? truncate(node.summary, 22) : truncate(node.summary, 28);
      const labelX = isSelected ? position.x + 24 : position.x + 14;
      const labelY = isSelected ? position.y + 8 : position.y + 4;
      return `<g class="memory-node obsidian-memory-node ${isSelected ? 'obsidian-selected-memory' : 'obsidian-secondary-memory'} ${
        isHighlighted ? 'graph-highlight-active' : ''
      }" ${renderHighlightAttributes(node.id, highlightedIds)} data-control="select-memory" data-selected="${String(
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

  return `<section class="graph-workspace obsidian-graph-workspace" aria-label="Initial loaded memory-brain graph">
    <svg class="memory-graph obsidian-memory-graph" viewBox="0 0 860 620" role="img" aria-label="Memory brain graph linking records to emotion, project, decision, outcome, and source" data-current-question-id="${escapeHtml(
      layout.ask.graphHighlightIds[0] ?? '',
    )}">
      <rect x="0" y="0" width="860" height="620" rx="26" class="obsidian-graph-surface" />
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
      <span class="hero-pill">Obsidian-like graph density with citation-backed memory selection</span>
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
