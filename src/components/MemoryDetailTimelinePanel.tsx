import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';
import type { MemoryDetailTimelineEntry } from '../lib/memoryDetailTimeline';
import { buildMemoryProvenanceExportFilename } from '../lib/memoryProvenanceExport';

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

function renderReviewHistory(entry: MemoryDetailTimelineEntry): string {
  if (!entry.reviewComparisons.length) {
    return '<div class="memory-review-history-empty" data-memory-review-history-state="empty">아직 검토 기록 없음</div>';
  }

  return `<ol class="memory-review-history-list" data-memory-review-history-state="ready">
    ${entry.reviewComparisons
      .map(
        (comparison) => `<li data-memory-review-history-entry="${escapeHtml(
          comparison.revisionId,
        )}" data-memory-review-comparison="${escapeHtml(comparison.revisionId)}" data-review-comparison-active="false">
          <button type="button" data-control="select-review-comparison" data-review-comparison-id="${escapeHtml(
            comparison.revisionId,
          )}">
            <span>${escapeHtml(comparison.reviewedAt)}</span>
            <strong>${escapeHtml(comparison.deltaLabel)}</strong>
          </button>
          <div class="memory-review-field-list">
            ${comparison.changedFieldLabels
              .map((field) => `<span data-review-changed-field="${escapeHtml(field)}">${escapeHtml(field)}</span>`)
              .join('')}
          </div>
          <p data-review-before-summary="${escapeHtml(comparison.beforeSummary)}">${escapeHtml(
            comparison.beforeSummary,
          )}</p>
          <p data-review-after-summary="${escapeHtml(comparison.afterSummary)}">${escapeHtml(
            comparison.afterSummary,
          )}</p>
          <code>${escapeHtml(comparison.sourceRef)}</code>
        </li>`,
      )
      .join('')}
  </ol>`;
}

export function renderMemoryDetailTimelinePanel(layout: InitialAppShellEvidenceLayout): string {
  const timeline = layout.memoryTimeline;
  const selectedEntry = timeline.entries.find((entry) => entry.active) ?? timeline.entries[0];

  return `<section class="memory-timeline-flow product-panel" aria-label="기억 상세 타임라인" data-memory-timeline-panel="pmi025" data-timeline-entry-count="${timeline.summary.totalMemoryCount}" data-timeline-active-memory="${escapeHtml(
    timeline.summary.selectedMemoryId ?? '',
  )}">
    <div class="section-header">
      <div>
        <p class="eyebrow">기억 타임라인</p>
        <h2>${escapeHtml(timeline.summary.startDate)} ~ ${escapeHtml(timeline.summary.endDate)}</h2>
      </div>
      <span class="status">기억 ${timeline.summary.totalMemoryCount}개</span>
    </div>
    <div class="timeline-list" aria-label="비공개 기억 타임라인 항목">
      ${timeline.entries.map(renderTimelineEntry).join('')}
    </div>
    ${
      selectedEntry
        ? `<article class="memory-review-panel" aria-label="출처 기반 기억 검토" data-memory-review-panel="source-edit" data-memory-review-mode="review" data-memory-detail-endpoint="/api/memory/detail" data-memory-update-endpoint="/api/memory/update" data-memory-review-history-endpoint="/api/memory/review-history" data-memory-provenance-export-endpoint="/api/memory/provenance-export" data-memory-provenance-export-filename="${escapeHtml(
            buildMemoryProvenanceExportFilename(selectedEntry.memoryId, '2026-05-27T00:00:00.000Z'),
          )}" data-memory-provenance-download-endpoint="/api/memory/provenance-download" data-memory-provenance-export-state="idle" data-memory-provenance-download-state="idle" data-memory-provenance-download-filename="${escapeHtml(
            buildMemoryProvenanceExportFilename(selectedEntry.memoryId, '2026-05-27T00:00:00.000Z'),
          )}" data-memory-review-selected-id="${escapeHtml(
            selectedEntry.memoryId,
          )}" data-memory-review-state="ready" data-memory-review-ledger="pending" data-memory-review-revision="${escapeHtml(
            selectedEntry.latestReviewRevisionId ?? '',
          )}" data-memory-review-history-count="${selectedEntry.reviewHistoryCount}">
      <div class="panel-topline">
        <span>${escapeHtml(selectedEntry.sourceLabel)}</span>
        <span>${escapeHtml(selectedEntry.privacyScope)}</span>
      </div>
      <div class="entrypoint-grid" aria-label="Source review drawer modes">
        <button type="button" data-control="memory-review-mode" data-review-mode-target="review" aria-pressed="true">검토</button>
        <button type="button" data-control="memory-review-mode" data-review-mode-target="history" aria-pressed="false">기록</button>
        <button type="button" data-control="memory-review-mode" data-review-mode-target="provenance" aria-pressed="false">출처</button>
      </div>
      <section data-memory-review-section="review">
      <label for="memory-edit-summary">요약</label>
      <textarea id="memory-edit-summary" data-control="memory-edit-summary">${escapeHtml(selectedEntry.title)}</textarea>
      <label for="memory-edit-raw-text">원문 일부</label>
      <textarea id="memory-edit-raw-text" data-control="memory-edit-raw-text">${escapeHtml(selectedEntry.rawExcerpt)}</textarea>
      <div class="capture-meta">
        <span data-memory-review-date>${escapeHtml(selectedEntry.observedAt)}</span>
        <span data-memory-review-type>${escapeHtml(selectedEntry.memoryType)}</span>
        <span data-memory-review-related-count>연관 ${selectedEntry.relatedMemoryIds.length}개</span>
      </div>
      <button type="button" data-control="save-memory-edit">기억 수정 저장</button>
      </section>
      <section data-memory-review-section="provenance">
      <button type="button" data-control="export-memory-provenance">출처 내보내기</button>
      <button type="button" data-control="download-memory-provenance" data-download-endpoint="/api/memory/provenance-download" data-download-filename="${escapeHtml(
        buildMemoryProvenanceExportFilename(selectedEntry.memoryId, '2026-05-27T00:00:00.000Z'),
      )}">출처 JSON 다운로드</button>
      </section>
      <section data-memory-review-section="history">
      ${renderReviewHistory(selectedEntry)}
      </section>
    </article>`
        : ''
    }
  </section>`;
}
