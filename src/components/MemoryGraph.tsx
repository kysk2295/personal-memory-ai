import type { InitialAppShellEvidenceLayout, ShellLinkKind } from '../lib/appShellEvidenceLayout';

const LINK_COLORS: Record<ShellLinkKind, string> = {
  emotion: '#d9480f',
  project: '#1971c2',
  decision: '#5f3dc4',
  outcome: '#2b8a3e',
  source: '#495057',
};

const HIGHLIGHT_COLORS: Record<string, string> = {
  question: '#111111',
  memory: '#0b7285',
  emotion: '#d9480f',
  decision: '#5f3dc4',
  outcome: '#2b8a3e',
  pattern: '#98710f',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nodePosition(index: number, total: number): { x: number; y: number } {
  const angle = (Math.PI * 2 * index) / total - Math.PI / 2;
  return {
    x: 420 + Math.cos(angle) * 255,
    y: 255 + Math.sin(angle) * 165,
  };
}

function renderStatus(status: string): string {
  return `<span class="status status-${escapeHtml(status.replace('/', '-'))}">${escapeHtml(status)}</span>`;
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

function renderFacetHighlightNodes(highlightIds: readonly string[]): string {
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
    .map((highlightId, index) => {
      const kind = highlightKind(highlightId);
      const x = 104 + (index % 3) * 226;
      const y = 76 + Math.floor(index / 3) * 54;
      const color = HIGHLIGHT_COLORS[kind] ?? '#151515';

      return `<g class="graph-highlight-node" ${renderHighlightAttributes(highlightId, new Set(highlightIds))}>
        <rect x="${x}" y="${y}" width="190" height="34" rx="6" fill="#fffdf8" stroke="${color}" stroke-width="2.4" />
        <text x="${x + 10}" y="${y + 21}" class="hub-title">${escapeHtml(truncate(highlightId, 30))}</text>
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
  const positions = new Map(layout.primaryNodes.map((node, index) => [node.id, nodePosition(index, layout.primaryNodes.length)]));
  const hubByKind: Record<ShellLinkKind, { id: string; x: number; y: number; label: string }> = {
    emotion: { id: 'hub:emotion', x: 142, y: 126, label: 'emotion' },
    project: { id: 'hub:project', x: 182, y: 412, label: 'project' },
    decision: { id: 'hub:decision', x: 708, y: 126, label: 'decision' },
    outcome: { id: 'hub:outcome', x: 710, y: 412, label: 'outcome' },
    source: { id: 'hub:source', x: 430, y: 472, label: 'source' },
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
      return `<line x1="${source.x}" y1="${source.y}" x2="${target.x}" y2="${target.y}" stroke="${LINK_COLORS[link.kind]}" stroke-width="1.8" stroke-opacity="0.36" />`;
    })
    .join('');
  const memoryNodes = layout.primaryNodes
    .map((node) => {
      const position = positions.get(node.id);
      if (!position) return '';
      const primaryLabel = node.recordType === 'diary' || node.sourceType === 'mobile' ? 'daily diary capture' : 'imported memory';
      const isHighlighted = highlightedIds.has(node.id);
      return `<g class="memory-node ${isHighlighted ? 'graph-highlight-active' : ''}" ${renderHighlightAttributes(
        node.id,
        highlightedIds,
      )}>
        <title>${escapeHtml(node.summary)}</title>
        <circle cx="${position.x}" cy="${position.y}" r="62" fill="none" stroke="#0b7285" stroke-width="${
          isHighlighted ? '4' : '0'
        }" stroke-opacity="0.9" />
        <circle cx="${position.x}" cy="${position.y}" r="58" fill="#fff" stroke="#151515" stroke-width="2" />
        <text x="${position.x}" y="${position.y - 12}" text-anchor="middle" class="node-kicker">${escapeHtml(primaryLabel)}</text>
        <text x="${position.x}" y="${position.y + 6}" text-anchor="middle" class="node-title">${escapeHtml(truncate(node.summary, 22))}</text>
        <text x="${position.x}" y="${position.y + 23}" text-anchor="middle" class="node-summary">${escapeHtml(node.recordType)} · ${escapeHtml(node.sourceType)}</text>
        <text x="${position.x}" y="${position.y + 39}" text-anchor="middle" class="node-source">${escapeHtml(node.observedAt)}</text>
      </g>`;
    })
    .join('');
  const hubNodes = Object.values(hubByKind)
    .map(
      (hub) => `<g>
        <circle cx="${hub.x}" cy="${hub.y}" r="40" fill="#f8f9fa" stroke="${LINK_COLORS[hub.label as ShellLinkKind]}" stroke-width="2" />
        <text x="${hub.x}" y="${hub.y - 3}" text-anchor="middle" class="hub-title">${escapeHtml(hub.label)}</text>
        <text x="${hub.x}" y="${hub.y + 16}" text-anchor="middle" class="hub-count">${edgeCounts[hub.label as ShellLinkKind]} links</text>
      </g>`,
    )
    .join('');

  return `<section class="graph-workspace" aria-label="Initial loaded memory-brain graph">
    <div class="section-header">
      <div>
        <p class="eyebrow">web second-brain graph workspace</p>
        <h2>Daily diary and imported memories are the primary graph nodes</h2>
        <p class="graph-subtitle">Edges are evidence facets: emotion, project, decision, outcome, and source. Ask, pattern, import preview, Decision Replay, and drawer panels stay attached to this graph.</p>
      </div>
      ${renderStatus('implemented')}
    </div>
    <svg class="memory-graph" viewBox="0 0 860 520" role="img" aria-label="Memory brain graph linking records to emotion, project, decision, outcome, and source" data-current-question-id="${escapeHtml(questionHighlightId)}">
      <rect x="8" y="8" width="844" height="504" fill="#f6f5f1" stroke="#ddd8cc" />
      <g class="graph-question-node" ${renderHighlightAttributes(questionHighlightId, highlightedIds)}>
        <rect x="258" y="24" width="344" height="38" rx="8" fill="#171717" stroke="#171717" />
        <text x="430" y="48" text-anchor="middle" fill="#fff" font-size="12" font-weight="800">${escapeHtml(
          truncate(layout.askQuestion, 46),
        )}</text>
      </g>
      <g class="graph-current-decision-node" ${renderHighlightAttributes(currentDecisionHighlightId, highlightedIds)}>
        <rect x="268" y="236" width="324" height="38" rx="8" fill="#fffdf8" stroke="#5f3dc4" stroke-width="2.6" />
        <text x="430" y="260" text-anchor="middle" class="hub-title">${escapeHtml(
          truncate(layout.replay.currentDecision.prompt, 48),
        )}</text>
      </g>
      ${renderFacetHighlightNodes(graphHighlightIds)}
      ${memoryEdges}
      ${hubNodes}
      ${memoryNodes}
    </svg>
    <div class="graph-legend">
      ${Object.entries(edgeCounts)
        .map(([kind, count]) => `<span><i style="background:${LINK_COLORS[kind as ShellLinkKind]}"></i>${escapeHtml(kind)} ${count}</span>`)
        .join('')}
    </div>
    <div class="graph-highlight-manifest" aria-label="Active Ask My Past Self graph highlights">
      ${graphHighlightIds
        .map((highlightId) => `<span data-highlight-id="${escapeHtml(highlightId)}">${escapeHtml(highlightId)}</span>`)
        .join('')}
    </div>
    <div class="graph-node-list" aria-label="Primary loaded memories">
      ${layout.primaryNodes
        .map(
          (node) =>
            `<span>${escapeHtml(node.sourceType)} · ${escapeHtml(node.recordType)} · ${escapeHtml(truncate(node.summary, 52))} ${renderStatus(node.status)}</span>`,
        )
        .join('')}
    </div>
  </section>`;
}
