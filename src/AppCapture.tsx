import { buildAppCaptureSurfaceState } from './lib/appCaptureSurface';

const CAPTURE_STYLES = `
  :root {
    color: #f4f4f4;
    background: #080808;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-width: 320px;
    background: #080808;
  }
  button,
  textarea,
  input,
  select {
    font: inherit;
  }
  .capture-app-shell {
    min-height: 100vh;
    display: grid;
    place-items: center;
    padding: 22px 14px;
    background:
      radial-gradient(circle at 50% 18%, rgba(214, 31, 60, 0.16), transparent 0 30%),
      #080808;
  }
  .capture-phone {
    width: min(420px, 100%);
    min-height: min(860px, calc(100vh - 44px));
    display: grid;
    grid-template-rows: auto auto minmax(0, 1fr) auto;
    gap: 14px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 28px;
    background: #101010;
    box-shadow: 0 26px 80px rgba(0, 0, 0, 0.5);
    padding: 18px;
  }
  .capture-topbar,
  .capture-status-row,
  .capture-actions {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .capture-icon-button,
  .capture-save-button,
  .capture-chip,
  .capture-secondary-link {
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.055);
    color: #f4f4f4;
  }
  .capture-icon-button {
    width: 38px;
    height: 38px;
  }
  .capture-title h1 {
    margin: 0;
    font-size: 32px;
    line-height: 1;
    letter-spacing: 0;
  }
  .capture-title p,
  .capture-status-row,
  .capture-card p,
  .capture-sync-card p {
    margin: 8px 0 0;
    color: #b8b8be;
    font-size: 13px;
    line-height: 1.45;
  }
  .capture-status-row {
    margin: 0;
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  .capture-chip {
    padding: 7px 9px;
    color: #d9d9dd;
    font-size: 11px;
    font-weight: 760;
  }
  .capture-chip.private {
    color: #ff8797;
    border-color: rgba(214, 31, 60, 0.3);
    background: rgba(214, 31, 60, 0.1);
  }
  .capture-card,
  .capture-sync-card {
    display: grid;
    gap: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.045);
    padding: 14px;
  }
  .capture-card label,
  .capture-sync-card span {
    color: #8f8f96;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .capture-card textarea {
    width: 100%;
    min-height: 190px;
    border: 0;
    outline: 0;
    resize: none;
    background: transparent;
    color: #f5f5f5;
    font-size: 20px;
    line-height: 1.35;
  }
  .capture-hint-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 9px;
  }
  .capture-hint-grid label {
    display: grid;
    gap: 5px;
  }
  .capture-hint-grid input,
  .capture-hint-grid select {
    min-width: 0;
    min-height: 38px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.055);
    color: #f4f4f4;
    padding: 8px 9px;
    font-size: 13px;
  }
  .capture-hints,
  .capture-memory-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
  }
  .capture-hints span,
  .capture-memory-meta span {
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 999px;
    padding: 6px 8px;
    color: #c6c6cb;
    background: rgba(255, 255, 255, 0.04);
    font-size: 11px;
  }
  .capture-save-button {
    min-height: 48px;
    flex: 1;
    background: #d61f3c;
    border-color: rgba(214, 31, 60, 0.9);
    font-weight: 800;
  }
  .capture-secondary-link {
    min-height: 48px;
    display: inline-grid;
    place-items: center;
    padding: 0 14px;
    color: #d9d9dd;
    text-decoration: none;
    font-size: 13px;
    font-weight: 760;
  }
  .capture-sync-card code {
    color: #ff8797;
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  .capture-app-shell[data-quick-save-state="saved"] .capture-save-button {
    background: #2f9b65;
    border-color: rgba(47, 155, 101, 0.9);
  }
  @media (min-width: 860px) {
    .capture-app-shell {
      align-items: center;
    }
  }
`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderAppCaptureHtml(): string {
  const state = buildAppCaptureSurfaceState({
    userId: 'local-user',
    capturedAt: '2026-05-27T15:00:00.000Z',
  });

  return `<main class="capture-app-shell" aria-label="Mobile app quick diary capture" data-surface-mode="${escapeHtml(
    state.surfaceMode,
  )}" data-pwa-status="${escapeHtml(state.pwaStatus)}" data-storage-mode="${escapeHtml(
    state.storageMode,
  )}" data-privacy-scope="${escapeHtml(state.privacyScope)}" data-quick-save-endpoint="${escapeHtml(
    state.quickSaveAction.endpoint,
  )}" data-quick-save-method="${escapeHtml(state.quickSaveAction.method)}" data-graph-sync-status="${escapeHtml(
    state.graphSync.status,
  )}" data-graph-target-route="${escapeHtml(state.graphSync.targetRoute)}" data-graph-target-node="${escapeHtml(
    state.graphSync.targetNodeId,
  )}">
    <section class="capture-phone">
      <div class="capture-topbar">
        <button class="capture-icon-button" type="button" aria-label="Back">←</button>
        <span class="capture-chip private">private vault</span>
      </div>
      <section class="capture-title">
        <h1>Quick Diary</h1>
        <p>앱에서는 길게 분석하지 않고 바로 기록한다. 저장된 일기는 로컬 우선으로 private MemoryRecord가 되고 웹 세컨브레인 그래프에 연결된다.</p>
      </section>
      <form class="capture-card" aria-label="Quick save diary form" data-capture-hints-panel="manual">
        <label for="quick-diary-text">Today</label>
        <textarea id="quick-diary-text" name="text">${escapeHtml(state.draft.text)}</textarea>
        <div class="capture-hint-grid" aria-label="Manual capture hint controls">
          <label>Emotion
            <input name="emotionHints" data-control="capture-emotion-hints" value="${escapeHtml(
              state.draft.emotionHints.join(', '),
            )}" />
          </label>
          <label>Project
            <input name="projectHints" data-control="capture-project-hints" value="${escapeHtml(
              state.draft.projectHints.join(', '),
            )}" />
          </label>
          <label>Topic
            <input name="topicHints" data-control="capture-topic-hints" value="${escapeHtml(
              state.draft.topicHints.join(', '),
            )}" />
          </label>
          <label>Decision
            <select name="decisionHint" data-control="capture-decision-hint">
              ${['none', 'pending', 'chosen', 'avoided', 'reversed']
                .map(
                  (value) =>
                    `<option value="${value}"${value === state.draft.decisionHint ? ' selected' : ''}>${value}</option>`,
                )
                .join('')}
            </select>
          </label>
          <label>Outcome
            <input name="outcomeHint" data-control="capture-outcome-hint" value="" />
          </label>
        </div>
        <div class="capture-hints" aria-label="Capture hints">
          ${state.draft.emotionHints.map((hint) => `<span>${escapeHtml(hint)}</span>`).join('')}
          ${state.draft.projectHints.map((hint) => `<span>${escapeHtml(hint)}</span>`).join('')}
          ${state.draft.topicHints.map((hint) => `<span>${escapeHtml(hint)}</span>`).join('')}
          <span>${escapeHtml(state.draft.decisionHint)}</span>
        </div>
      </form>
      <section class="capture-sync-card" aria-label="Saved capture graph handoff">
        <span>Saved preview</span>
        <p>Quick save will call <code>${escapeHtml(
          `${state.quickSaveAction.method} ${state.quickSaveAction.endpoint}`,
        )}</code> with local-first private payload.</p>
        <div class="capture-memory-meta">
          <span>${escapeHtml(state.savedPreview.id)}</span>
          <span>${escapeHtml(state.savedPreview.sourceType)}</span>
          <span>${escapeHtml(state.savedPreview.extractionStatus)}</span>
          <span>${escapeHtml(state.savedPreview.privacyScope)}</span>
        </div>
        <p>Graph handoff: <code>${escapeHtml(state.graphSync.targetNodeId)}</code> → <code>${escapeHtml(
          state.graphSync.targetRoute,
        )}</code></p>
      </section>
      <div class="capture-actions">
        <button class="capture-save-button" type="submit" data-control="quick-diary-save" form="quick-diary-form">Quick save</button>
        <a class="capture-secondary-link" href="/">Open graph</a>
      </div>
    </section>
  </main>`;
}

const CAPTURE_SCRIPT = `
(() => {
  const captureShell = document.querySelector('.capture-app-shell');
  const form = document.querySelector('[data-capture-hints-panel="manual"]');
  const saveButton = document.querySelector('[data-control="quick-diary-save"]');
  if (!captureShell || !form) return;
  form.setAttribute('id', 'quick-diary-form');
  const quickSaveEndpoint = captureShell.getAttribute('data-quick-save-endpoint') || '/api/capture';
  const quickSaveMethod = captureShell.getAttribute('data-quick-save-method') || 'POST';
  const splitList = (value) => String(value || '').split(',').map((item) => item.trim()).filter(Boolean);
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const formData = new FormData(form);
    const payload = {
      text: String(formData.get('text') || ''),
      capturedAt: new Date().toISOString(),
      deviceId: 'pwa-local-device',
      emotionHints: splitList(formData.get('emotionHints')),
      projectHints: splitList(formData.get('projectHints')),
      topicHints: splitList(formData.get('topicHints')),
      decisionHint: String(formData.get('decisionHint') || 'none'),
      outcomeHint: String(formData.get('outcomeHint') || ''),
    };
    captureShell.setAttribute('data-quick-save-state', 'saving');
    saveButton?.setAttribute('aria-busy', 'true');
    try {
      if (window.location.protocol !== 'file:') {
        const response = await fetch(quickSaveEndpoint, {
          method: quickSaveMethod,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error('capture failed with ' + response.status);
        const body = await response.json().catch(() => ({}));
        const memoryId = body.createdMemoryIds?.[0] || body.record?.id || '';
        captureShell.setAttribute('data-last-captured-memory', memoryId);
      }
      captureShell.setAttribute('data-quick-save-state', 'saved');
      if (saveButton) saveButton.textContent = 'Saved';
    } catch (error) {
      captureShell.setAttribute('data-quick-save-state', 'error');
      captureShell.setAttribute('data-quick-save-error', String(error?.message || error));
    } finally {
      saveButton?.setAttribute('aria-busy', 'false');
    }
  });
})();
`;

export function renderPwaManifest(): string {
  return JSON.stringify(
    {
      name: 'Personal Memory AI Capture',
      short_name: 'Memory Capture',
      start_url: '/capture/',
      scope: '/',
      display: 'standalone',
      background_color: '#080808',
      theme_color: '#d61f3c',
      description: 'Local-first private diary capture for Personal Memory AI.',
    },
    null,
    2,
  );
}

export function renderAppCaptureDocument(): string {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#d61f3c" />
    <link rel="manifest" href="/manifest.webmanifest" />
    <title>Personal Memory AI Capture</title>
    <style>${CAPTURE_STYLES}</style>
  </head>
  <body>${renderAppCaptureHtml()}<script>${CAPTURE_SCRIPT}</script></body>
</html>`;
}
