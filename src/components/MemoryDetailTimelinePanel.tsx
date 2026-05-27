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
  </section>`;
}
