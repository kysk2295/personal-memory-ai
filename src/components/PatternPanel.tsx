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
  const capturedRecord = layout.records.find((record) => record.id === 'mem_captured_ship_note') ?? layout.records[0];
  const previewRecords = layout.importPreview.records.slice(0, 2);

  return `<section class="analysis-panels" aria-label="Graph-supporting panels">
    <div class="analysis-lead">
      <article class="panel product-panel weekly-pattern-report">
        <div class="panel-topline">
          <span>주간 패턴</span>
          <span class="status-badge">${escapeHtml(layout.patterns.status)}</span>
        </div>
        <h3>${escapeHtml(pattern.title)}</h3>
        <p>${escapeHtml(pattern.explanation)}</p>
        <div class="metric-row">
          <span>신뢰도 <strong>${Math.round(pattern.confidence * 100)}%</strong></span>
          <span>인용 <strong>${pattern.supportingMemoryIds.length}</strong></span>
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
        <p class="supporting-label">패턴 감지는 인용된 기억에만 근거한다.</p>
      </article>
      <article class="panel product-panel import-capture-panel">
        <div class="panel-topline">
          <span>가져오기 / 기록</span>
          <span class="status-badge">${escapeHtml(layout.importPreview.contract.status)}</span>
        </div>
        <h3>기존 기록이 첫 기억 그래프가 된다.</h3>
        <p>보이는 미리보기 묶음에서 중복 ${importSummary.duplicates.duplicate}개, 신규 ${importSummary.duplicates.new}개, 확인 필요 ${importSummary.duplicates.possible}개.</p>
        <section class="capture-prototype" aria-label="App capture prototype" data-capture-memory-id="${escapeHtml(capturedRecord.id)}">
          <label for="fast-diary-capture">빠른 일기 기록</label>
          <textarea id="fast-diary-capture" readonly>${escapeHtml(capturedRecord.rawText)}</textarea>
          <div class="capture-meta">
            <span>출처 ${escapeHtml(capturedRecord.sourceType)}</span>
            <span>${escapeHtml(capturedRecord.observedAt ?? capturedRecord.createdAt.slice(0, 10))}</span>
            <span>${escapeHtml(capturedRecord.privacyScope)}</span>
            <span>앱 기록 프로토타입</span>
          </div>
          <p>이 영역은 네이티브 앱이 아니라, 앱에서 들어온 일기가 MemoryRecord로 바뀌는 로컬 프로토타입 계약을 보여준다.</p>
        </section>
        <section class="import-preview-actions" aria-label="Import preview apply undo">
          <section class="local-import-upload" aria-label="Local file import upload" data-import-upload-panel="local-file" data-import-preview-endpoint="/api/import/preview" data-import-apply-endpoint="/api/import/apply" data-import-undo-endpoint="/api/import/undo" data-import-upload-state="idle" data-import-upload-file-count="0" data-import-upload-candidate-count="0">
            <div class="panel-topline">
              <span>Markdown, JSON, Obsidian 내보내기</span>
              <span class="status-badge">로컬 가져오기</span>
            </div>
            <label for="local-memory-import-files">로컬 기억 파일</label>
            <input id="local-memory-import-files" data-control="local-import-file-input" type="file" multiple accept=".md,.markdown,.txt,.json" />
            <label for="local-memory-import-paste">일기/기억 붙여넣기</label>
            <textarea id="local-memory-import-paste" data-control="local-import-paste-text" placeholder="오늘의 일기나 Obsidian export를 붙여넣기"></textarea>
            <div class="entrypoint-grid" aria-label="Local import upload actions">
              <button type="button" data-control="preview-local-import">미리보기</button>
              <button type="button" data-control="apply-local-import" disabled>가져오기 적용</button>
              <button type="button" data-control="undo-local-import" disabled>되돌리기</button>
            </div>
            <output data-import-upload-summary>0 files · 0 candidates</output>
            <div data-import-upload-preview-list aria-label="Local import preview results"></div>
            <section class="notion-import-direct" aria-label="Direct Notion database import" data-notion-import-panel="database" data-notion-import-endpoint="/api/import/notion/preview" data-notion-sources-endpoint="/api/import/notion/sources" data-notion-import-state="idle" data-notion-sources-state="idle" data-notion-import-candidate-count="0">
              <div class="panel-topline">
                <span>Notion 일기 DB</span>
                <span class="status-badge">직접 가져오기</span>
              </div>
              <label for="notion-database-id">데이터베이스 ID</label>
              <input id="notion-database-id" data-control="notion-database-id" placeholder="Notion database/data source id" />
              <div class="entrypoint-grid" aria-label="Notion import actions">
                <button type="button" data-control="list-notion-sources">소스 찾기</button>
                <button type="button" data-control="preview-notion-import">Notion 미리보기</button>
              </div>
              <output data-notion-import-summary>0 Notion candidates</output>
              <div data-notion-source-list aria-label="Accessible Notion import sources"></div>
            </section>
            <section class="import-applied-feedback" aria-label="Applied import graph feedback" data-import-applied-feedback="local-upload" data-import-applied-count="0">
              <strong>적용한 가져오기는 비공개 그래프에 합류한다</strong>
              <div data-import-applied-memory-list></div>
            </section>
          </section>
          <div class="import-preview-list">
            ${previewRecords
              .map(
                (record) => `<article data-import-preview-id="${escapeHtml(record.id)}" data-import-duplicate-state="${escapeHtml(
                  record.duplicate.state,
                )}">
                  <strong>${escapeHtml(record.sourceType)} ${escapeHtml(record.observedDate)}</strong>
                  <p>${escapeHtml(record.memoryRecord?.summary ?? 'Blocked import candidate')}</p>
                  <span>${escapeHtml(record.duplicate.state)}</span>
                </article>`,
              )
              .join('')}
          </div>
          <div class="entrypoint-grid" aria-label="Import actions">
            <button type="button">가져오기 적용</button>
            <button type="button">되돌리기</button>
          </div>
        </section>
        <div class="entrypoint-grid" aria-label="Diary and import entry points">
          <a href="#ask-my-past-self-question">빠른 일기 기록</a>
          <a href="#evidence-mem_launch_may_anxiety_scope_delay">기존 기억 가져오기</a>
        </div>
      </article>
    </div>
    <article class="panel product-panel privacy-commitment">
      <div class="panel-topline">
        <span>비공개 약속</span>
        <span class="status-badge">로컬 프로토타입</span>
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
