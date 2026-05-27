import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';
import type { MemoryDetailTimelineEntry } from '../lib/memoryDetailTimeline';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTimelineEntry(entry: MemoryDetailTimelineEntry): string {
  const facets = entry.facetLabels
    .slice(0, 4)
    .map((facet) => `<span>${escapeHtml(facet)}</span>`)
    .join('');

  return `<button type="button" class="timeline-memory-item" data-control="timeline-select-memory" data-timeline-memory-id="${escapeHtml(
    entry.memoryId,
  )}" data-timeline-active="${String(entry.active)}" data-timeline-related-count="${entry.relatedMemoryIds.length}">
    <span class="timeline-date">${escapeHtml(entry.observedAt)}</span>
    <strong>${escapeHtml(entry.title)}</strong>
    <span class="timeline-source">${escapeHtml(entry.sourceLabel)}</span>
    <span class="timeline-excerpt">${escapeHtml(entry.rawExcerpt)}</span>
    <span class="timeline-facets">${facets}</span>
  </button>`;
}

export function renderMemoryDetailTimelinePanel(layout: InitialAppShellEvidenceLayout): string {
  const timeline = layout.memoryTimeline;
  const selectedEntry = timeline.entries.find((entry) => entry.active) ?? timeline.entries[0];

  return `<section class="memory-timeline-flow product-panel" aria-label="Memory detail timeline" data-memory-timeline-panel="pmi025" data-timeline-entry-count="${timeline.summary.totalMemoryCount}" data-timeline-active-memory="${escapeHtml(
    timeline.summary.selectedMemoryId ?? '',
  )}">
    <div class="section-header">
      <div>
        <p class="eyebrow">Memory Timeline</p>
        <h2>${escapeHtml(timeline.summary.startDate)} to ${escapeHtml(timeline.summary.endDate)}</h2>
      </div>
      <span class="status">${timeline.summary.totalMemoryCount} memories</span>
    </div>
    <div class="timeline-list" aria-label="Private memory timeline entries">
      ${timeline.entries.map(renderTimelineEntry).join('')}
    </div>
    ${
      selectedEntry
        ? `<article class="memory-review-panel" aria-label="Source-backed memory review" data-memory-review-panel="source-edit" data-memory-detail-endpoint="/api/memory/detail" data-memory-update-endpoint="/api/memory/update" data-memory-review-selected-id="${escapeHtml(
            selectedEntry.memoryId,
          )}" data-memory-review-state="ready" data-memory-review-ledger="pending" data-memory-review-revision="">
      <div class="panel-topline">
        <span>${escapeHtml(selectedEntry.sourceLabel)}</span>
        <span>${escapeHtml(selectedEntry.privacyScope)}</span>
      </div>
      <label for="memory-edit-summary">Summary</label>
      <textarea id="memory-edit-summary" data-control="memory-edit-summary">${escapeHtml(selectedEntry.title)}</textarea>
      <label for="memory-edit-raw-text">Source excerpt</label>
      <textarea id="memory-edit-raw-text" data-control="memory-edit-raw-text">${escapeHtml(selectedEntry.rawExcerpt)}</textarea>
      <div class="capture-meta">
        <span data-memory-review-date>${escapeHtml(selectedEntry.observedAt)}</span>
        <span data-memory-review-type>${escapeHtml(selectedEntry.memoryType)}</span>
        <span data-memory-review-related-count>${selectedEntry.relatedMemoryIds.length} related</span>
      </div>
      <button type="button" data-control="save-memory-edit">Save memory edit</button>
    </article>`
        : ''
    }
  </section>`;
}
