import type { InitialAppShellEvidenceLayout, ShellLinkKind } from '../lib/appShellEvidenceLayout';

const LINK_COLORS: Record<ShellLinkKind, string> = {
  emotion: '#d9480f',
  project: '#8b8b8b',
  decision: '#d24040',
  outcome: '#b7b7b7',
  source: '#686868',
};

const HIGHLIGHT_COLORS: Record<string, string> = {
  question: '#f3f1ea',
  memory: '#f0f0f0',
  emotion: '#a5a5a5',
  decision: '#d24040',
  outcome: '#c2c2c2',
  pattern: '#d7b57c',
  choice: '#858585',
  topic: '#737373',
};

const PRIMARY_POSITIONS = [
  { x: 344, y: 180 },
  { x: 522, y: 134 },
  { x: 604, y: 318 },
  { x: 392, y: 388 },
  { x: 236, y: 302 },
];

const SATELLITE_POSITIONS = [
  { x: 168, y: 126 },
  { x: 222, y: 210 },
  { x: 702, y: 158 },
  { x: 718, y: 270 },
  { x: 660, y: 428 },
  { x: 484, y: 472 },
  { x: 284, y: 454 },
  { x: 122, y: 352 },
  { x: 434, y: 76 },
  { x: 780, y: 374 },
  { x: 96, y: 214 },
  { x: 570, y: 230 },
  { x: 498, y: 326 },
  { x: 314, y: 86 },
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

function highlightKind(highlightId: string): string {
  return highlightId.split(':', 1)[0] ?? 'memory';
}

function renderHighlightAttributes(highlightId: string, highlightedIds: ReadonlySet<string>): string {
  return `data-highlight-id="${escapeHtml(highlightId)}" data-highlight-status="${
    highlightedIds.has(highlightId) ? 'active' : 'inactive'
  }"`;
}

function renderGhostNodes(): string {
  return SATELLITE_POSITIONS.map((position, index) => {
    const radius = [5, 3, 4, 6, 3, 5, 4, 3, 5, 4, 3, 5, 3, 4][index] ?? 4;
    const opacity = index % 4 === 0 ? 0.42 : 0.26;
    const label = ['semantic', 'reflective', 'procedural', 'episodic', 'source', 'topic', 'near-miss', 'requires', 'trigger', 'thesis', 'extends', 'refines', 'supports', 'import'][index] ?? 'memory';
    const labelOffset = index % 2 === 0 ? 9 : -42;
    return `<g class="ghost-memory-cluster">
      <circle class="ghost-memory-node" cx="${position.x}" cy="${position.y}" r="${radius}" fill="#d8d8d8" fill-opacity="${opacity}" />
      <text class="ghost-memory-label" x="${position.x + labelOffset}" y="${position.y + 3}">${escapeHtml(label)}</text>
    </g>`;
  }).join('');
}

function renderGhostEdges(): string {
  const pairs = [
    [0, 1], [1, 4], [2, 3], [3, 9], [4, 5], [5, 12], [6, 7], [7, 10], [8, 1], [8, 2], [9, 13], [10, 0], [11, 2], [11, 12], [12, 3], [13, 2],
  ];
  return pairs
    .map(([left, right], index) => {
      const source = SATELLITE_POSITIONS[left];
      const target = SATELLITE_POSITIONS[right];
      if (!source || !target) return '';
      const dash = index % 3 === 0 ? ' stroke-dasharray="3 7"' : '';
      return `<line class="ghost-memory-edge" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="#f3f1ea" stroke-opacity="0.09" stroke-width="1"${dash} />`;
    })
    .join('');
}

function renderFacetHighlightNodes(highlightIds: readonly string[], highlightedIds: ReadonlySet<string>): string {
  const facetHighlightIds = highlightIds.filter(
    (highlightId) =>
      highlightId.startsWith('emotion:') ||
      highlightId.startsWith('decision:') ||
      highlightId.startsWith('outcome:') ||
      highlightId.startsWith('choice:') ||
      highlightId.startsWith('topic:') ||
      highlightId.startsWith('pattern:'),
  );

  return facetHighlightIds
    .slice(0, 9)
    .map((highlightId, index) => {
      const kind = highlightKind(highlightId);
      const position = SATELLITE_POSITIONS[index + 2] ?? { x: 120 + index * 54, y: 96 + index * 18 };
      const color = HIGHLIGHT_COLORS[kind] ?? '#b8b8b8';
      const isThesis = kind === 'decision' || kind === 'pattern';

      return `<g class="graph-highlight-node ${isThesis ? 'graph-thesis-node' : ''}" ${renderHighlightAttributes(highlightId, highlightedIds)}>
        <circle cx="${position.x}" cy="${position.y}" r="${isThesis ? 13 : 8}" fill="${color}" fill-opacity="${isThesis ? '0.86' : '0.44'}" stroke="#f3f1ea" stroke-opacity="${isThesis ? '0.34' : '0.12'}" />
        <text x="${position.x + 14}" y="${position.y + 4}" class="satellite-label">${escapeHtml(truncate(highlightId.replace(/^[^:]+:/, ''), 24))}</text>
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
  const questionHighlightId = layout.ask.graphHighlightIds[0] ?? '';
  const currentDecisionHighlightId = `decision:${layout.replay.currentDecision.id}`;
  const positions = new Map(layout.primaryNodes.map((node, index) => [node.id, PRIMARY_POSITIONS[index] ?? PRIMARY_POSITIONS[0]]));
  const hubByKind: Record<ShellLinkKind, { id: string; x: number; y: number; label: string }> = {
    emotion: { id: 'hub:emotion', x: 186, y: 252, label: 'emotion' },
    project: { id: 'hub:project', x: 474, y: 242, label: 'project' },
    decision: { id: 'hub:decision', x: 638, y: 196, label: 'decision' },
    outcome: { id: 'hub:outcome', x: 586, y: 406, label: 'outcome' },
    source: { id: 'hub:source', x: 312, y: 426, label: 'source' },
  };
  const edgeCounts = layout.links.reduce<Record<ShellLinkKind, number>>(
    (counts, link) => ({ ...counts, [link.kind]: counts[link.kind] + 1 }),
    { emotion: 0, project: 0, decision: 0, outcome: 0, source: 0 },
  );
  const memoryEdges = layout.links
    .map((link) => {
      const source = positions.get(link.from);
      const target = hubByKind[link.kind];
      if (!source) return '';
      return `<line class="semantic-edge" x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="${LINK_COLORS[link.kind]}" stroke-width="${link.kind === 'decision' ? '1.45' : '1.05'}" stroke-opacity="${link.kind === 'decision' ? '0.38' : '0.22'}" />`;
    })
    .join('');
  const memoryNodes = layout.primaryNodes
    .map((node, index) => {
      const position = positions.get(node.id);
      if (!position) return '';
      const primaryLabel = node.recordType === 'diary' || node.sourceType === 'mobile' ? 'diary' : node.recordType;
      const isHighlighted = highlightedIds.has(node.id);
      const accent = index === 2 || node.recordType === 'decision';
      return `<g class="memory-node ${isHighlighted ? 'graph-highlight-active' : ''} ${accent ? 'graph-accent-memory' : ''}" ${renderHighlightAttributes(
        node.id,
        highlightedIds,
      )} data-control="select-memory" data-inspector-title="${escapeHtml(node.summary)}" data-inspector-source="${escapeHtml(`${node.sourceType} · ${node.recordType} · ${node.observedAt}`)}" data-inspector-body="${escapeHtml(`선택한 기억: ${node.summary} Outcome and source evidence stay linked through ${node.id.replace(/^memory:/, '')}.`)}" data-inspector-citation="${escapeHtml(node.id.replace(/^memory:/, ''))}" tabindex="0" role="button" aria-label="Select memory ${escapeHtml(truncate(node.summary, 48))}">
        <title>${escapeHtml(node.summary)}</title>
        <circle cx="${position.x}" cy="${position.y}" r="${isHighlighted ? '52' : '42'}" fill="${accent ? '#d24040' : '#d8d8d8'}" fill-opacity="${accent ? '0.82' : '0.72'}" stroke="#f3f1ea" stroke-opacity="${isHighlighted ? '0.46' : '0.16'}" stroke-width="${isHighlighted ? '2.4' : '1.1'}" />
        <circle cx="${position.x}" cy="${position.y}" r="${isHighlighted ? '62' : '50'}" fill="none" stroke="${accent ? '#d24040' : '#f3f1ea'}" stroke-opacity="${isHighlighted ? '0.22' : '0.06'}" />
        <text x="${position.x + 48}" y="${position.y - 8}" class="node-kicker">${escapeHtml(primaryLabel)} · ${escapeHtml(node.sourceType)}</text>
        <text x="${position.x + 48}" y="${position.y + 10}" class="node-title">${escapeHtml(truncate(node.summary, 34))}</text>
        <text x="${position.x + 48}" y="${position.y + 27}" class="node-source">${escapeHtml(node.observedAt)}</text>
      </g>`;
    })
    .join('');
  const hubNodes = Object.values(hubByKind)
    .map(
      (hub) => `<g class="semantic-hub">
        <circle cx="${hub.x}" cy="${hub.y}" r="18" fill="transparent" stroke="${LINK_COLORS[hub.label as ShellLinkKind]}" stroke-opacity="0.3" stroke-width="1.2" />
        <circle cx="${hub.x}" cy="${hub.y}" r="4" fill="${LINK_COLORS[hub.label as ShellLinkKind]}" fill-opacity="0.72" />
        <text x="${hub.x + 12}" y="${hub.y + 4}" class="hub-title">${escapeHtml(hub.label)} · ${edgeCounts[hub.label as ShellLinkKind]}</text>
      </g>`,
    )
    .join('');

  return `<section class="graph-workspace" aria-label="Initial loaded memory-brain graph">
    <svg class="memory-graph" viewBox="0 0 860 520" role="img" aria-label="Memory brain graph linking records to emotion, project, decision, outcome, and source" data-current-question-id="${escapeHtml(questionHighlightId)}">
      <rect x="0" y="0" width="860" height="520" rx="0" fill="transparent" />
      ${renderGhostEdges()}
      ${memoryEdges}
      <g class="graph-question-node" ${renderHighlightAttributes(questionHighlightId, highlightedIds)}>
        <rect x="278" y="36" width="316" height="34" rx="17" fill="#0f0f0f" fill-opacity="0.86" stroke="#f3f1ea" stroke-opacity="0.16" />
        <text x="436" y="58" text-anchor="middle" fill="#f3f1ea" fill-opacity="0.78" font-size="11" font-weight="760">${escapeHtml(
          truncate(layout.askQuestion, 42),
        )}</text>
      </g>
      <g class="graph-current-decision-node" ${renderHighlightAttributes(currentDecisionHighlightId, highlightedIds)}>
        <circle cx="720" cy="92" r="15" fill="#d24040" fill-opacity="0.82" />
        <text x="742" y="96" class="satellite-label">${escapeHtml(truncate(layout.replay.currentDecision.prompt, 38))}</text>
      </g>
      ${renderGhostNodes()}
      <g class="selected-node-affordance" aria-label="Selected node affordance">
        <circle class="selected-node-halo" cx="604" cy="318" r="76" />
        <circle class="selected-node-handle" cx="660" cy="267" r="4" />
      </g>
      ${hubNodes}
      ${renderFacetHighlightNodes(graphHighlightIds, highlightedIds)}
      ${memoryNodes}
    </svg>
    <div class="graph-support-copy" aria-label="Graph supporting cues">
      <span class="hero-pill">Question and decision remain visible as active evidence prompts</span>
      <span class="hero-pill">Graph highlight IDs stay tied to cited memories</span>
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
