import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

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

export function renderEvidenceDrawer(layout: InitialAppShellEvidenceLayout): string {
  const items = layout.evidenceDrawer.items;
  const questionHighlightId = layout.ask.graphHighlightIds[0] ?? '';

  return `<aside class="evidence-drawer" aria-label="Graph evidence drawer">
    <div class="section-header compact">
      <div>
        <p class="eyebrow">Evidence drawer</p>
        <h2>Every answer stays traceable to remembered evidence</h2>
      </div>
      ${renderStatus(layout.evidenceDrawer.status)}
    </div>
    <p class="drawer-principle">This is the trust surface. Ask, pattern, import preview, and Decision Replay stay grounded in source, date, citation id, and memory trace.</p>
    <article class="drawer-current-question" data-current-question-id="${escapeHtml(questionHighlightId)}">
      <strong>Current question</strong>
      <p>${escapeHtml(layout.askQuestion)}</p>
      <code>${escapeHtml(questionHighlightId)}</code>
    </article>
    <article class="drawer-current-question" data-current-decision-id="${escapeHtml(`decision:${layout.replay.currentDecision.id}`)}">
      <strong>Current decision</strong>
      <p>${escapeHtml(layout.replay.currentDecision.prompt)}</p>
      <code>${escapeHtml(`decision:${layout.replay.currentDecision.id}`)}</code>
    </article>
    <div class="drawer-list">
      ${items
        .map((item) => {
          const traceLabel = item.trace.map((trace) => `${trace.type}:${trace.id}`).join(', ');
          const citationId = item.trace.find((trace) => trace.type === 'memory')?.id ?? item.highlightId;
          return `<article class="drawer-item product-panel" id="evidence-${escapeHtml(citationId)}" data-highlight-id="${escapeHtml(
            item.highlightId,
          )}" data-evidence-source="${escapeHtml(item.source)}" data-evidence-date="${escapeHtml(
            item.date,
          )}" data-evidence-raw-excerpt="${escapeHtml(item.citation)}">
            <div class="drawer-meta">
              <span>${escapeHtml(item.source)}</span>
              <span>${escapeHtml(item.date)}</span>
              ${renderStatus(item.status)}
            </div>
            <p>${escapeHtml(item.citation)}</p>
            <p><strong>why connected</strong> ${escapeHtml(traceLabel || item.highlightId)}</p>
            <code>${escapeHtml(item.highlightId)}</code>
            <code>trace ${escapeHtml(traceLabel)}</code>
          </article>`;
        })
        .join('')}
    </div>
  </aside>`;
}
