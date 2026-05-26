import type { InitialAppShellEvidenceLayout, ShellSurfaceStatus } from '../lib/appShellEvidenceLayout';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
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
  const visibleSurfaces = layout.surfaces.filter((surface) =>
    ['app-quick-diary-capture', 'app-capture-native-client', 'import-preview', 'weekly-report', 'seed-memory-fixtures'].includes(
      surface.id,
    ),
  );
  const statuses = ['implemented', 'partial', 'skeleton', 'fake/sample', 'planned'];

  return `<section class="analysis-panels" aria-label="Graph-supporting panels">
    <div class="analysis-lead">
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
          <span>Import preview</span>
          ${renderStatus(layout.importPreview.contract.status)}
        </div>
        <h3>Imported memory should feel like onboarding, not a backlog chore.</h3>
        <p>${importSummary.duplicates.duplicate} duplicate, ${importSummary.duplicates.new} new, ${importSummary.duplicates.possible} possible from the visible preview batch. The import lane stays honest, but no longer crowds the hero.</p>
      </article>
    </div>
    <article class="panel">
      <div class="panel-topline">
        <span>Product truth surface</span>
        ${renderStatus('implemented')}
      </div>
      <h3>What is real, partial, seeded, or still planned stays visible in one quiet place.</h3>
      <p>This keeps product planning in the UI without making the first impression feel like a status dashboard.</p>
      <ul class="status-key" aria-label="Allowed surface statuses">
        ${statuses.map((status) => `<li>${renderStatus(status)}</li>`).join('')}
      </ul>
      <ul class="surface-list">
        ${visibleSurfaces.map(renderSurface).join('')}
      </ul>
    </article>
  </section>`;
}
