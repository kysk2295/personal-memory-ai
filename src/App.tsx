import { renderMemoryGraph } from './components/MemoryGraph';
import { buildInitialAppShellEvidenceLayout } from './lib/appShellEvidenceLayout';

const APP_SHELL_STYLES = `
  :root {
    color: #f3f1ea;
    background: #070707;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-width: 320px; background: #070707; }
  button, input { font: inherit; }
  .second-brain-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 312px minmax(0, 1fr);
    background:
      radial-gradient(circle at 72% 38%, rgba(145, 25, 31, 0.14), transparent 0 24%),
      radial-gradient(circle at 58% 58%, rgba(255, 255, 255, 0.04), transparent 0 28%),
      #070707;
    overflow: hidden;
  }
  .brain-sidebar {
    min-height: 100vh;
    padding: 22px 20px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(11, 11, 11, 0.84);
    backdrop-filter: blur(20px);
    display: flex;
    flex-direction: column;
    gap: 22px;
    z-index: 2;
  }
  .sidebar-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .home-button,
  .locale-toggle button,
  .filter-chip,
  .layout-button,
  .control-pill,
  .control-action,
  .ask-submit {
    border: 1px solid rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.045);
    color: rgba(243, 241, 234, 0.78);
  }
  .home-button {
    width: 36px;
    height: 36px;
    border-radius: 999px;
    display: grid;
    place-items: center;
    text-decoration: none;
    font-size: 18px;
  }
  .locale-toggle { display: inline-flex; gap: 6px; }
  .locale-toggle button {
    min-width: 38px;
    height: 30px;
    border-radius: 999px;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
  }
  .locale-toggle button[aria-pressed="true"] { color: #0b0b0b; background: #f3f1ea; }
  .eyebrow {
    margin: 0;
    color: rgba(243, 241, 234, 0.48);
    font-size: 12px;
    font-weight: 750;
    letter-spacing: 0.08em;
  }
  .brain-title h1 {
    margin: 6px 0 0;
    font-size: 42px;
    line-height: 0.94;
    letter-spacing: -0.06em;
  }
  .brain-title p {
    margin: 12px 0 0;
    color: rgba(243, 241, 234, 0.62);
    font-size: 13px;
    line-height: 1.55;
  }
  .graph-meta-line {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    color: rgba(243, 241, 234, 0.5);
    font-size: 12px;
    line-height: 1.4;
  }
  .graph-meta-line strong { color: rgba(243, 241, 234, 0.82); font-size: 13px; }
  .graph-meta-dot { color: rgba(243, 241, 234, 0.24); }
  .legend-section { display: flex; flex-direction: column; gap: 10px; }
  .legend-title {
    margin: 0;
    color: rgba(243, 241, 234, 0.42);
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.13em;
    text-transform: uppercase;
  }
  .filter-list { display: flex; flex-direction: column; gap: 7px; }
  .filter-chip {
    min-height: 31px;
    border-radius: 999px;
    padding: 6px 9px;
    display: grid;
    grid-template-columns: 10px minmax(0, 1fr) auto;
    align-items: center;
    gap: 9px;
    font-size: 12px;
    transition: opacity 160ms ease, background 160ms ease, border-color 160ms ease;
  }
  .filter-chip[aria-pressed="false"] { opacity: 0.34; border-color: rgba(255,255,255,0.06); background: transparent; }
  .filter-dot { width: 8px; height: 8px; border-radius: 999px; background: #d9d9d9; }
  .filter-dot.semantic { background: #f0f0f0; }
  .filter-dot.reflective { background: #9d9d9d; }
  .filter-dot.procedural { background: #626262; }
  .filter-dot.episodic { background: #b4b4b4; }
  .filter-dot.thesis { background: #d24040; box-shadow: 0 0 18px rgba(210, 64, 64, 0.5); }
  .filter-dot.source { background: #d7b57c; }
  .filter-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .filter-count { color: rgba(243, 241, 234, 0.46); font-weight: 750; }
  .layout-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .layout-button { min-height: 32px; border-radius: 999px; font-size: 12px; }
  .layout-button.active,
  .control-pill.active { color: #0b0b0b; background: #f3f1ea; }
  .graph-control-panel { display: flex; flex-direction: column; gap: 9px; }
  .control-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .control-label { color: rgba(243, 241, 234, 0.48); font-size: 11px; font-weight: 760; }
  .control-pill-group { display: inline-flex; gap: 5px; }
  .control-pill { min-height: 28px; min-width: 42px; border-radius: 999px; padding: 5px 9px; font-size: 11px; }
  .control-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .control-action { min-height: 31px; border-radius: 999px; font-size: 12px; }
  .control-action.subtle { color: rgba(243, 241, 234, 0.52); }
  .control-hint { margin: 0; color: rgba(243, 241, 234, 0.38); font-size: 11px; line-height: 1.45; }
  .sidebar-footer {
    margin-top: auto;
    color: rgba(243, 241, 234, 0.46);
    font-size: 12px;
    line-height: 1.5;
  }
  .brain-canvas {
    position: relative;
    min-width: 0;
    min-height: 100vh;
    padding: 22px 28px 28px;
    display: flex;
    flex-direction: column;
  }
  .ask-memory-bar {
    position: relative;
    z-index: 3;
    min-height: 58px;
    max-width: 860px;
    margin: 0 auto;
    width: min(860px, 100%);
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.14);
    background: rgba(10, 10, 10, 0.88);
    box-shadow: 0 22px 90px rgba(0, 0, 0, 0.32);
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 10px 11px 10px 18px;
  }
  .ask-lock { color: rgba(243, 241, 234, 0.42); font-size: 15px; }
  .ask-memory-bar input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #f3f1ea;
    font-size: 15px;
  }
  .ask-memory-bar input::placeholder { color: rgba(243, 241, 234, 0.58); }
  .ask-submit {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    color: #0b0b0b;
    background: #f3f1ea;
    font-size: 18px;
  }
  .graph-stage {
    position: relative;
    flex: 1;
    min-height: 680px;
    margin-top: -18px;
    display: grid;
    place-items: center;
  }
  .graph-stage::before {
    content: "";
    position: absolute;
    inset: 6% 4% 4%;
    background:
      radial-gradient(circle at 52% 43%, rgba(210, 64, 64, 0.12), transparent 0 20%),
      radial-gradient(circle at 46% 54%, rgba(255, 255, 255, 0.08), transparent 0 28%);
    filter: blur(8px);
    pointer-events: none;
  }
  .graph-workspace {
    position: relative;
    width: min(112%, 1240px);
    transform: scale(1.09) translateY(8px);
    transition: transform 180ms ease, width 180ms ease;
  }
  .second-brain-shell[data-spacing="tight"] .graph-workspace { width: min(104%, 1160px); transform: scale(1.02) translateY(8px); }
  .second-brain-shell[data-spacing="wide"] .graph-workspace { width: min(122%, 1320px); transform: scale(1.15) translateY(8px); }
  .second-brain-shell[data-labels="hidden"] .ghost-memory-label,
  .second-brain-shell[data-labels="hidden"] .satellite-label,
  .second-brain-shell[data-labels="hidden"] .hub-title,
  .second-brain-shell[data-labels="hidden"] .node-kicker,
  .second-brain-shell[data-labels="hidden"] .node-source { opacity: 0; }
  .second-brain-shell[data-labels="hidden"] .node-title { opacity: 0.72; }
  .memory-graph {
    display: block;
    width: 100%;
    min-height: 660px;
    filter: drop-shadow(0 32px 90px rgba(0, 0, 0, 0.44));
  }
  .memory-graph rect:first-child { fill: transparent; stroke: rgba(255, 255, 255, 0.05); }
  .memory-node .node-kicker,
  .hub-count { fill: rgba(243, 241, 234, 0.42); font-size: 9px; font-weight: 800; }
  .memory-node .node-title { fill: #f4f1e9; font-size: 12px; font-weight: 850; }
  .memory-node .node-summary { fill: rgba(243, 241, 234, 0.56); font-size: 9px; }
  .node-source,
  .hub-title,
  .satellite-label { fill: rgba(243, 241, 234, 0.72); font-size: 10px; font-weight: 800; }
  .satellite-label { fill: rgba(243, 241, 234, 0.54); font-size: 9px; }
  .ghost-memory-label { fill: rgba(243, 241, 234, 0.3); font-size: 8px; font-weight: 650; }
  .selected-node-halo { fill: none; stroke: #d24040; stroke-opacity: 0.32; stroke-width: 1.4; stroke-dasharray: 3 5; }
  .selected-node-handle { fill: #d24040; fill-opacity: 0.86; }
  .graph-support-copy,
  .graph-highlight-manifest,
  .graph-support-list {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
  .memory-inspector {
    position: absolute;
    right: 28px;
    bottom: 28px;
    z-index: 3;
    width: min(390px, calc(100% - 56px));
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 24px;
    background: rgba(10, 10, 10, 0.78);
    backdrop-filter: blur(22px);
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.34);
    padding: 16px;
  }
  .memory-inspector h2 {
    margin: 6px 0 8px;
    font-size: 21px;
    line-height: 1.08;
    letter-spacing: -0.04em;
  }
  .memory-inspector p { margin: 0; color: rgba(243, 241, 234, 0.6); font-size: 12px; line-height: 1.55; }
  .citation-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
  .citation-row a {
    color: #f3f1ea;
    text-decoration: none;
    border: 1px solid rgba(255, 255, 255, 0.11);
    background: rgba(255, 255, 255, 0.05);
    border-radius: 999px;
    padding: 7px 9px;
    font-size: 11px;
  }
  .pill-red { color: #ffb7b7; }
  .evidence-ledger {
    position: absolute;
    left: -9999px;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
  @media (max-width: 980px) {
    .second-brain-shell { grid-template-columns: 1fr; overflow: auto; }
    .brain-sidebar { min-height: auto; border-right: 0; border-bottom: 1px solid rgba(255,255,255,0.08); }
    .brain-canvas { min-height: 760px; }
    .graph-stage { min-height: 560px; }
    .memory-inspector { position: relative; right: auto; bottom: auto; margin: 18px auto 0; width: 100%; }
  }
  @media (max-width: 640px) {
    .brain-sidebar { padding: 18px 14px; }
    .brain-canvas { padding: 16px 12px 28px; }
    .brain-title h1 { font-size: 36px; }
    .memory-graph { min-height: 420px; }
    .ask-memory-bar { grid-template-columns: auto minmax(0, 1fr) auto; }
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

export type RenderVariant = 'full' | 'plain' | 'topbar-only' | 'no-svg' | 'svg-only' | 'debug-text';

function renderFilter(labelKo: string, labelEn: string, count: number, kind: string): string {
  return `<button type="button" class="filter-chip" data-filter-chip="${escapeHtml(kind)}" aria-pressed="true"><span class="filter-dot ${kind}" aria-hidden="true"></span><span class="filter-name">${labelKo}<span aria-hidden="true"> ${labelEn}</span></span><span class="filter-count">${count}</span></button>`;
}

export function renderAppShellHtml(variant: RenderVariant = 'full'): string {
  const layout = buildInitialAppShellEvidenceLayout();
  const memoryCount = layout.primaryNodes.length;
  const relationshipCount = layout.links.length;
  const citationLinks = layout.ask.citationMemoryIds
    .slice(0, 3)
    .map((citationId) => `<a href="#evidence-${escapeHtml(citationId)}" class="citation-ref">[${escapeHtml(citationId)}]</a>`)
    .join('');
  const drawerLedger = layout.evidenceDrawer.items
    .map((item) => {
      const memoryTrace = item.trace.find((trace) => trace.type === 'memory');
      const memoryId = memoryTrace?.id ?? item.highlightId.replace(/^memory:/, '');
      return `<article id="evidence-${escapeHtml(memoryId)}" data-citation-id="${escapeHtml(memoryId)}" data-replay-memory-id="${escapeHtml(memoryId)}"><h3>${escapeHtml(item.source)}</h3><p>${escapeHtml(item.citation)}</p></article>`;
    })
    .join('');

  if (variant === 'plain' || variant === 'topbar-only' || variant === 'debug-text') {
    return `<main class="second-brain-shell"><aside class="brain-sidebar"><section class="brain-title"><p class="eyebrow">지식 그래프</p><h1>Second Brain</h1><p>${escapeHtml(layout.northStar)}</p></section></aside></main>`;
  }

  return `<main class="second-brain-shell" data-labels="visible" data-spacing="normal">
    <aside class="brain-sidebar" aria-label="Second Brain graph controls">
      <div class="sidebar-topline">
        <a class="home-button" href="/" aria-label="home">←</a>
        <div class="locale-toggle" role="group" aria-label="언어">
          <button type="button" aria-pressed="true">KO</button>
          <button type="button" aria-pressed="false">EN</button>
        </div>
      </div>

      <section class="brain-title">
        <p class="eyebrow">지식 그래프</p>
        <h1>Second Brain</h1>
        <p>${escapeHtml(layout.northStar)} 일기, 가져온 기록, 결정의 결과가 하나의 기억 그래프로 연결된다.</p>
      </section>

      <div class="graph-meta-line" aria-label="Memory graph scale">
        <span><strong>${memoryCount}</strong> 기억 노드</span>
        <span class="graph-meta-dot">·</span>
        <span><strong>${relationshipCount}</strong> 근거 엣지</span>
        <span class="graph-meta-dot">·</span>
        <span>last woven from diary + imports</span>
      </div>

      <section class="legend-section" aria-label="Node types">
        <p class="legend-title">노드 유형</p>
        <div class="filter-list">
          ${renderFilter('사건', 'episodic', 2, 'episodic')}
          ${renderFilter('통찰', 'reflective', 1, 'reflective')}
          ${renderFilter('절차', 'procedural', 1, 'procedural')}
          ${renderFilter('결정', 'decision', 1, 'thesis')}
          ${renderFilter('출처', 'source', 5, 'source')}
        </div>
      </section>

      <section class="legend-section" aria-label="Edge types">
        <p class="legend-title">엣지 유형</p>
        <div class="filter-list">
          ${renderFilter('근거', 'supports', layout.ask.citationMemoryIds.length, 'semantic')}
          ${renderFilter('결과', 'outcome', 4, 'thesis')}
          ${renderFilter('반복', 'pattern', 1, 'reflective')}
          ${renderFilter('출처', 'source-tag', 5, 'source')}
        </div>
      </section>

      <section class="legend-section" aria-label="Graph layout modes">
        <p class="legend-title">레이아웃</p>
        <div class="layout-modes">
          <button type="button" class="layout-button active">자유</button>
          <button type="button" class="layout-button">주장별</button>
          <button type="button" class="layout-button">계층</button>
          <button type="button" class="layout-button">시간순</button>
        </div>
      </section>

      <section class="legend-section graph-control-panel" aria-label="Graph control panel">
        <p class="legend-title">그래프 조절</p>
        <div class="control-row node-spacing-controls" aria-label="Node spacing controls">
          <span class="control-label">노드 간격</span>
          <span class="control-pill-group">
            <button type="button" class="control-pill" data-control="spacing" data-spacing="tight">좁게</button>
            <button type="button" class="control-pill active" data-control="spacing" data-spacing="normal" aria-pressed="true">보통</button>
            <button type="button" class="control-pill" data-control="spacing" data-spacing="wide">넓게</button>
          </span>
        </div>
        <div class="control-actions">
          <button type="button" class="control-action rearrange-graph" data-control="rearrange">다시 정렬</button>
          <button type="button" class="control-action hide-secondary-labels" data-control="toggle-labels" aria-pressed="false">라벨 숨기기</button>
          <button type="button" class="control-action subtle reset-graph-filters" data-control="reset">필터 초기화</button>
          <button type="button" class="control-action subtle selected-node-focus" data-control="focus-selected">선택 노드 보기</button>
        </div>
        <p class="control-hint">노드·엣지 필터와 라벨 밀도는 그래프 탐색 affordance로 노출하고, 실제 기억 답변은 인용 칩으로만 확정한다.</p>
      </section>

      <p class="sidebar-footer">대시보드가 아니라 기억을 탐색하는 작업공간. 상태 라벨과 내부 구현 목록은 첫 인상에서 제거하고, 그래프와 질문 입력을 전면에 둔다.</p>
    </aside>

    <section class="brain-canvas" aria-label="Personal Memory AI Second Brain canvas">
      <form class="ask-memory-bar" aria-label="Ask Second Brain">
        <span class="ask-lock" aria-hidden="true">⌘</span>
        <input id="ask-my-past-self-question" name="question" value="${escapeHtml(layout.askQuestion)}" aria-label="Ask My Past Self question" />
        <button class="ask-submit" type="button" aria-label="Ask">→</button>
      </form>

      <div class="graph-stage">
        ${variant === 'no-svg' ? '' : renderMemoryGraph(layout)}
      </div>

      <article class="memory-inspector" aria-label="Ask My Past Self cited question flow">
        <p class="eyebrow">Ask My Past Self · cited path</p>
        <h2>${escapeHtml(layout.ask.recommendation)}</h2>
        <p>반복된 <span class="pill-red">anxiety → feature addition → launch delay</span> 경로만 근거로 답한다. Decision Replay는 현재 결정을 과거 결과와 비교하고, Evidence drawer는 출처·날짜·기억 원문으로 되돌아간다.</p>
        <div class="citation-row" aria-label="Ask My Past Self citations">${citationLinks}</div>
      </article>

      <section class="evidence-ledger" aria-label="Evidence drawer">
        <h2>Evidence drawer</h2>
        <label for="decision-replay-current">Current decision</label>
        <input id="decision-replay-current" value="${escapeHtml(layout.replay.currentDecision.prompt)}" readonly />
        <p>Decision Replay</p>
        <p>Pattern detection</p>
        ${drawerLedger}
      </section>
    </section>
  </main>`;
}

const GRAPH_CONTROL_SCRIPT = `
(() => {
  const shell = document.querySelector('.second-brain-shell');
  if (!shell) return;

  const spacingButtons = Array.from(document.querySelectorAll('[data-control="spacing"]'));
  const filterButtons = Array.from(document.querySelectorAll('[data-filter-chip]'));
  const toggleLabels = document.querySelector('[data-control="toggle-labels"]');
  const reset = document.querySelector('[data-control="reset"]');
  const rearrange = document.querySelector('[data-control="rearrange"]');
  const focusSelected = document.querySelector('[data-control="focus-selected"]');

  const setSpacing = (value) => {
    shell.setAttribute('data-spacing', value);
    spacingButtons.forEach((button) => {
      const active = button.getAttribute('data-spacing') === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  spacingButtons.forEach((button) => {
    button.addEventListener('click', () => setSpacing(button.getAttribute('data-spacing') || 'normal'));
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const active = button.getAttribute('aria-pressed') !== 'false';
      button.setAttribute('aria-pressed', String(!active));
    });
  });

  if (toggleLabels) {
    toggleLabels.addEventListener('click', () => {
      const hidden = shell.getAttribute('data-labels') === 'hidden';
      shell.setAttribute('data-labels', hidden ? 'visible' : 'hidden');
      toggleLabels.setAttribute('aria-pressed', String(!hidden));
      toggleLabels.textContent = hidden ? '라벨 숨기기' : '라벨 보이기';
    });
  }

  if (rearrange) {
    rearrange.addEventListener('click', () => {
      const next = shell.getAttribute('data-spacing') === 'wide' ? 'tight' : 'wide';
      setSpacing(next);
    });
  }

  if (focusSelected) {
    focusSelected.addEventListener('click', () => {
      shell.setAttribute('data-labels', 'visible');
      setSpacing('normal');
      document.querySelector('.selected-node-affordance')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
    });
  }

  if (reset) {
    reset.addEventListener('click', () => {
      shell.setAttribute('data-labels', 'visible');
      if (toggleLabels) {
        toggleLabels.setAttribute('aria-pressed', 'false');
        toggleLabels.textContent = '라벨 숨기기';
      }
      filterButtons.forEach((button) => button.setAttribute('aria-pressed', 'true'));
      setSpacing('normal');
    });
  }
})();
`;

export function renderAppShellDocument(variant: RenderVariant = 'full'): string {
  return `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Personal Memory AI Second Brain</title>
    <style>${APP_SHELL_STYLES}</style>
  </head>
  <body>${renderAppShellHtml(variant)}<script data-graph-control-script="pmi014">${GRAPH_CONTROL_SCRIPT}</script></body>
</html>`;
}
