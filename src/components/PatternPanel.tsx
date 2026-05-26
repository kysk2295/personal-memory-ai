import type { InitialAppShellEvidenceLayout, ShellSurfaceStatus } from '../lib/appShellEvidenceLayout';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStatus(status: string): string {
  return `<span class="status status-${escapeHtml(status.replace('/', '-'))}">${escapeHtml(status)}</span>`;
}

function renderSurface(surface: ShellSurfaceStatus): string {
  return `<li>
    <div>
      <strong>${escapeHtml(surface.label)}</strong>
      <p>${escapeHtml(surface.description)}</p>
    </div>
    ${renderStatus(surface.status)}
  </li>`;
}

export function renderPatternPanel(layout: InitialAppShellEvidenceLayout): string {
  const pattern = layout.patterns.patterns[0];
  const importSummary = layout.importPreview.summary;
  const statuses = ['implemented', 'partial', 'skeleton', 'fake/sample', 'planned', 'blocked'];

  return `<section class="analysis-panels" aria-label="Graph-supporting panels">
    <article class="panel">
      <div class="panel-topline">
        <span>Pattern panel</span>
        ${renderStatus(layout.patterns.status)}
      </div>
      <h3>${escapeHtml(pattern.title)}</h3>
      <p>${escapeHtml(pattern.explanation)}</p>
      <div class="metric-row">
        <span>confidence <strong>${Math.round(pattern.confidence * 100)}%</strong></span>
        <span>citations <strong>${pattern.supportingMemoryIds.length}</strong></span>
      </div>
    </article>
    <article class="panel">
      <div class="panel-topline">
        <span>Ask My Past Self</span>
        ${renderStatus(layout.ask.status)}
      </div>
      <h3>${escapeHtml(layout.ask.recommendation)}</h3>
      <p>${escapeHtml(layout.ask.answer)}</p>
    </article>
    <article class="panel">
      <div class="panel-topline">
        <span>Decision Replay</span>
        ${renderStatus(layout.replay.status)}
      </div>
      <h3>${escapeHtml(layout.replay.recommendation)}</h3>
      <p>${escapeHtml(layout.replay.uncertainty)}</p>
    </article>
    <article class="panel">
      <div class="panel-topline">
        <span>Import preview</span>
        ${renderStatus(layout.importPreview.contract.status)}
      </div>
      <h3>Notion, Obsidian, and Markdown are P0 imports</h3>
      <p>${importSummary.duplicates.duplicate} duplicate, ${importSummary.duplicates.new} new, ${importSummary.duplicates.possible} possible from the visible preview batch. Preview supports the graph and does not replace the web workspace.</p>
    </article>
    <article class="panel panel-wide">
      <div class="panel-topline">
        <span>Surface status labels</span>
        ${renderStatus('implemented')}
      </div>
      <ul class="status-key" aria-label="Allowed surface statuses">
        ${statuses.map((status) => `<li>${renderStatus(status)}</li>`).join('')}
      </ul>
      <ul class="surface-list">
        ${layout.surfaces.map(renderSurface).join('')}
      </ul>
    </article>
  </section>`;
}
