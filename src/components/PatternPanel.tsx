import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPatternPanel(layout: InitialAppShellEvidenceLayout): string {
  const pattern = layout.patterns.patterns[0];
  const importSummary = layout.importPreview.summary;
  const supportingMemoryIds = pattern.supportingMemoryIds.slice(0, 3);

  return `<section class="analysis-panels" aria-label="Graph-supporting panels">
    <div class="analysis-lead">
      <article class="panel product-panel weekly-pattern-report">
        <div class="panel-topline">
          <span>Weekly Pattern Report</span>
          <span class="status-badge">${escapeHtml(layout.patterns.status)}</span>
        </div>
        <h3>${escapeHtml(pattern.title)}</h3>
        <p>${escapeHtml(pattern.explanation)}</p>
        <div class="metric-row">
          <span>confidence <strong>${Math.round(pattern.confidence * 100)}%</strong></span>
          <span>citations <strong>${pattern.supportingMemoryIds.length}</strong></span>
        </div>
        <ul class="pattern-memory-list" aria-label="Weekly Pattern Report supporting memory ids">
          ${supportingMemoryIds
            .map(
              (memoryId) =>
                `<li data-pattern-memory-id="${escapeHtml(memoryId)}"><a href="#evidence-${escapeHtml(memoryId)}">[${escapeHtml(
                  memoryId,
                )}]</a></li>`,
            )
            .join('')}
        </ul>
        <p class="supporting-label">Pattern detection stays grounded in cited memories.</p>
      </article>
      <article class="panel product-panel import-capture-panel">
        <div class="panel-topline">
          <span>Import / Capture</span>
          <span class="status-badge">${escapeHtml(layout.importPreview.contract.status)}</span>
        </div>
        <h3>Existing records become the first memory graph.</h3>
        <p>${importSummary.duplicates.duplicate} duplicate, ${importSummary.duplicates.new} new, ${importSummary.duplicates.possible} possible from the visible preview batch.</p>
        <div class="entrypoint-grid" aria-label="Diary and import entry points">
          <a href="#ask-my-past-self-question">Fast diary capture</a>
          <a href="#evidence-mem_launch_may_anxiety_scope_delay">Import existing memories</a>
        </div>
      </article>
    </div>
    <article class="panel product-panel privacy-commitment">
      <div class="panel-topline">
        <span>Privacy contract</span>
        <span class="status-badge">local prototype</span>
      </div>
      <h3>비공개 기본값: 기억은 사용자 개인의 세컨브레인 안에서만 연결된다.</h3>
      <p>클라우드에 전부 맡기는 제품처럼 보이지 않게, 로컬 프로토타입 상태와 사용자 통제 액션을 함께 노출한다.</p>
      <ul class="privacy-action-list">
        <li>로컬 프로토타입</li>
        <li>내보내기</li>
        <li>삭제</li>
      </ul>
    </article>
  </section>`;
}
