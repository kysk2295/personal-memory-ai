import { renderAskMyPastSelfPanel } from './components/AskMyPastSelfPanel';
import { renderDecisionReplayPanel } from './components/DecisionReplayPanel';
import { renderEvidenceDrawer } from './components/EvidenceDrawer';
import { renderMemoryGraph } from './components/MemoryGraph';
import { renderPatternPanel } from './components/PatternPanel';
import { buildInitialAppShellEvidenceLayout } from './lib/appShellEvidenceLayout';

const APP_SHELL_STYLES = `
  :root {
    color: #f5f1e8;
    background:
      radial-gradient(circle at top, rgba(110, 94, 79, 0.28), transparent 0 32%),
      linear-gradient(180deg, #12100e 0%, #161311 34%, #1b1714 100%);
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-width: 320px;
    background:
      radial-gradient(circle at top, rgba(110, 94, 79, 0.28), transparent 0 32%),
      linear-gradient(180deg, #12100e 0%, #161311 34%, #1b1714 100%);
  }
  button { font: inherit; }
  .app-shell {
    min-height: 100vh;
    max-width: 1480px;
    margin: 0 auto;
    padding: 28px 24px 56px;
    display: flex;
    flex-direction: column;
    gap: 22px;
  }
  .topbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 24px;
    padding: 44px 40px 36px;
    border: 1px solid rgba(235, 223, 208, 0.18);
    border-radius: 28px;
    background:
      linear-gradient(180deg, rgba(38, 33, 29, 0.92) 0%, rgba(22, 19, 17, 0.96) 100%),
      radial-gradient(circle at top right, rgba(191, 146, 91, 0.16), transparent 0 34%);
    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.28);
  }
  .topbar h1,
  .section-header h2,
  .panel h3 { margin: 0; letter-spacing: 0; }
  .topbar h1 {
    max-width: 10ch;
    font-size: clamp(52px, 8vw, 82px);
    line-height: 0.94;
    letter-spacing: -0.05em;
  }
  .topbar p {
    margin: 16px 0 0;
    max-width: 760px;
    color: rgba(245, 241, 232, 0.76);
    font-size: 15px;
    line-height: 1.65;
  }
  .eyebrow {
    margin: 0;
    color: rgba(245, 241, 232, 0.5);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .topbar-actions {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .topbar-actions button,
  .capture-card button {
    border: 1px solid rgba(245, 241, 232, 0.18);
    border-radius: 999px;
    background: rgba(245, 241, 232, 0.06);
    color: #f5f1e8;
    padding: 11px 16px;
    min-height: 42px;
    letter-spacing: 0.01em;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
  }
  .first-screen-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 380px;
    gap: 22px;
    align-items: start;
  }
  .workspace-main { display: flex; flex-direction: column; gap: 22px; min-width: 0; }
  .graph-workspace,
  .ask-flow,
  .evidence-drawer,
  .analysis-panels .panel,
  .app-capture-strip {
    border: 1px solid rgba(235, 223, 208, 0.14);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(36, 31, 28, 0.92) 0%, rgba(25, 22, 19, 0.94) 100%);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(18px);
  }
  .graph-workspace { padding: 24px; }
  .ask-flow { padding: 22px; }
  .decision-replay-flow {
    border: 1px solid rgba(235, 223, 208, 0.14);
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(36, 31, 28, 0.92) 0%, rgba(25, 22, 19, 0.94) 100%);
    box-shadow: 0 18px 48px rgba(0, 0, 0, 0.2);
    padding: 22px;
  }
  .section-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 18px;
  }
  .section-header h2 { font-size: 24px; line-height: 1.08; letter-spacing: -0.03em; }
  .section-header.compact h2 { font-size: 18px; }
  .graph-subtitle { margin: 10px 0 0; color: rgba(245, 241, 232, 0.62); font-size: 13px; line-height: 1.55; }
  .status {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(245, 241, 232, 0.18);
    border-radius: 999px;
    background: rgba(245, 241, 232, 0.05);
    color: #f5f1e8;
    padding: 4px 8px;
    font-size: 10px;
    font-weight: 800;
    line-height: 1.4;
    white-space: nowrap;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .status-implemented { border-color: #2f7d32; color: #b8f3c0; background: rgba(47, 125, 50, 0.15); }
  .status-partial { border-color: #98710f; color: #ffd97a; background: rgba(152, 113, 15, 0.16); }
  .status-skeleton { border-color: #6b6b6b; color: #dfdfdf; background: rgba(107, 107, 107, 0.16); }
  .status-fake-sample { border-color: #9f4d00; color: #ffc48b; background: rgba(159, 77, 0, 0.15); }
  .status-planned { border-color: #4c6fb8; color: #bfd2ff; background: rgba(76, 111, 184, 0.16); }
  .status-blocked { border-color: #b3261e; color: #ffb4ab; background: rgba(179, 38, 30, 0.17); }
  .memory-graph {
    display: block;
    width: 100%;
    aspect-ratio: 860 / 520;
    min-height: 360px;
  }
  .memory-node .node-kicker,
  .hub-count { fill: #a59a8b; font-size: 10px; font-weight: 700; }
  .memory-node .node-title { fill: #f4ede2; font-size: 13px; font-weight: 800; }
  .memory-node .node-summary { fill: #d5c8ba; font-size: 10px; }
  .node-source,
  .hub-title { fill: #cdc0b1; font-size: 11px; font-weight: 700; }
  .graph-legend,
  .graph-highlight-manifest,
  .graph-node-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 14px;
  }
  .graph-legend span,
  .graph-highlight-manifest span,
  .graph-node-list span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 9px;
    border: 1px solid rgba(245, 241, 232, 0.12);
    border-radius: 999px;
    background: rgba(245, 241, 232, 0.04);
    font-size: 12px;
    color: rgba(245, 241, 232, 0.84);
  }
  .graph-legend i { width: 10px; height: 10px; display: inline-block; }
  .graph-highlight-manifest span {
    border-color: rgba(227, 190, 128, 0.45);
    background: rgba(227, 190, 128, 0.08);
    color: #f5f1e8;
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  .app-capture-strip {
    padding: 18px;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 14px;
  }
  .capture-card {
    border: 1px solid rgba(245, 241, 232, 0.1);
    border-radius: 18px;
    padding: 16px;
    background: rgba(245, 241, 232, 0.03);
  }
  .capture-card strong { display: block; margin-bottom: 6px; }
  .capture-card p { margin: 0 0 10px; color: rgba(245, 241, 232, 0.62); font-size: 13px; line-height: 1.4; }
  .ask-question-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .ask-question-row label {
    color: rgba(245, 241, 232, 0.72);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }
  .ask-question-row input {
    width: 100%;
    min-height: 42px;
    border: 1px solid rgba(245, 241, 232, 0.14);
    background: rgba(245, 241, 232, 0.04);
    color: #f5f1e8;
    padding: 9px 10px;
    font: inherit;
  }
  .ask-question-row button {
    min-height: 42px;
    border: 1px solid rgba(245, 241, 232, 0.18);
    background: rgba(245, 241, 232, 0.08);
    color: #f5f1e8;
    padding: 9px 12px;
    border-radius: 999px;
  }
  .ask-answer-cited {
    border: 1px solid rgba(245, 241, 232, 0.12);
    border-radius: 18px;
    background: rgba(245, 241, 232, 0.03);
    padding: 14px;
  }
  .ask-answer-cited h3 { margin: 0; font-size: 16px; line-height: 1.3; }
  .ask-answer-cited p { margin: 8px 0 0; color: rgba(245, 241, 232, 0.72); font-size: 13px; line-height: 1.48; }
  .citation-ref { color: #5f3dc4; font-weight: 800; text-decoration: none; }
  .ask-citations {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 9px;
    padding: 0;
    margin: 10px 0 0;
    list-style: none;
  }
  .ask-citations li {
    border: 1px solid rgba(245, 241, 232, 0.1);
    border-radius: 18px;
    background: rgba(245, 241, 232, 0.03);
    padding: 12px;
    min-width: 0;
  }
  .ask-citations strong { display: block; font-size: 12px; line-height: 1.35; }
  .ask-citations p { margin: 7px 0; color: rgba(245, 241, 232, 0.68); font-size: 12px; line-height: 1.4; }
  .ask-citations code {
    display: block;
    color: #5b3316;
    font-size: 11px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .decision-current-card,
  .decision-recommendation,
  .similar-decision {
    border: 1px solid rgba(245, 241, 232, 0.1);
    border-radius: 18px;
    background: rgba(245, 241, 232, 0.03);
    padding: 14px;
  }
  .decision-current-card label {
    display: block;
    color: #51483f;
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 8px;
  }
  .decision-current-card input {
    width: 100%;
    min-height: 42px;
    border: 1px solid #cfc7b8;
    background: #fffdf8;
    color: #171717;
    padding: 9px 10px;
    font: inherit;
  }
  .decision-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 10px;
  }
  .decision-columns span {
    display: block;
    color: #655b50;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .decision-tag-list {
    list-style: none;
    padding: 0;
    margin: 9px 0 0;
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .decision-tag-list li {
    border: 1px solid #d8d2c3;
    background: #fffdf8;
    color: #332d27;
    font-size: 12px;
    font-weight: 700;
    padding: 5px 7px;
  }
  .decision-recommendation {
    margin-top: 10px;
  }
  .decision-recommendation h3 {
    margin: 0;
    font-size: 16px;
    line-height: 1.3;
  }
  .decision-recommendation p,
  .similar-decision p {
    margin: 8px 0 0;
    color: #3a332d;
    font-size: 13px;
    line-height: 1.48;
  }
  .similar-decision-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 9px;
    margin-top: 10px;
  }
  .similar-decision strong { display: block; font-size: 12px; line-height: 1.35; }
  .decision-citations {
    list-style: none;
    padding: 0;
    margin: 10px 0 0;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .decision-citations li {
    border: 1px solid #e0dbcf;
    background: #fffdf8;
    padding: 9px;
  }
  .decision-citations code {
    display: block;
    color: #5b3316;
    font-size: 11px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .analysis-panels {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
  }
  .analysis-panels .panel { padding: 13px; min-height: 164px; }
  .panel-topline {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 9px;
    color: rgba(245, 241, 232, 0.58);
    font-size: 12px;
    font-weight: 800;
  }
  .panel h3 { font-size: 15px; line-height: 1.25; }
  .panel p { color: rgba(245, 241, 232, 0.68); font-size: 13px; line-height: 1.45; margin: 8px 0 0; }
  .metric-row { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px; font-size: 12px; }
  .panel-wide { grid-column: 1 / -1; }
  .surface-list,
  .status-key { list-style: none; padding: 0; margin: 0; }
  .status-key {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 10px;
  }
  .surface-list {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 8px;
  }
  .surface-list li {
    min-height: 100px;
    border: 1px solid rgba(245, 241, 232, 0.1);
    border-radius: 18px;
    padding: 12px;
    background: rgba(245, 241, 232, 0.03);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  .surface-list strong { display: block; font-size: 13px; }
  .surface-list p { margin: 5px 0 0; font-size: 12px; }
  .evidence-drawer {
    position: sticky;
    top: 14px;
    padding: 18px;
    max-height: calc(100vh - 28px);
    overflow: auto;
  }
  .drawer-list { display: flex; flex-direction: column; gap: 9px; }
  .drawer-principle {
    margin: 0 0 12px;
    color: rgba(245, 241, 232, 0.68);
    font-size: 13px;
    line-height: 1.45;
  }
  .drawer-item {
    border: 1px solid rgba(245, 241, 232, 0.1);
    border-radius: 18px;
    background: rgba(245, 241, 232, 0.03);
    padding: 12px;
  }
  .drawer-current-question {
    border: 1px solid rgba(227, 190, 128, 0.4);
    border-radius: 18px;
    background: rgba(227, 190, 128, 0.08);
    padding: 12px;
    margin-bottom: 10px;
  }
  .drawer-current-question strong { display: block; font-size: 12px; text-transform: uppercase; }
  .drawer-current-question p { margin: 7px 0; color: #332d27; font-size: 13px; line-height: 1.4; }
  .drawer-current-question code { color: #5b3316; font-size: 11px; overflow-wrap: anywhere; }
  .drawer-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
    color: #645b51;
    font-size: 11px;
    font-weight: 700;
  }
  .drawer-item p { margin: 8px 0; font-size: 13px; line-height: 1.45; color: #332d27; }
  .drawer-item code { font-size: 11px; white-space: normal; color: #5b3316; }
  @media (max-width: 1120px) {
    .first-screen-grid { grid-template-columns: 1fr; }
    .evidence-drawer { position: static; max-height: none; }
    .analysis-panels { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .surface-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .ask-citations { grid-template-columns: 1fr; }
    .similar-decision-list { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .app-shell { padding: 10px; }
    .topbar { grid-template-columns: 1fr; }
    .topbar h1 { font-size: 28px; }
    .topbar-actions { justify-content: flex-start; }
    .app-capture-strip,
    .analysis-panels,
    .surface-list { grid-template-columns: 1fr; }
    .ask-question-row { grid-template-columns: 1fr; }
    .decision-columns { grid-template-columns: 1fr; }
    .memory-graph { min-height: 300px; }
  }
`;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export type RenderVariant = 'full' | 'plain' | 'topbar-only' | 'no-svg' | 'svg-only' | 'debug-text';

function shouldRender(variant: RenderVariant, section: 'topbar' | 'graph' | 'ask' | 'decision' | 'capture' | 'pattern' | 'drawer'): boolean {
  switch (variant) {
    case 'plain':
    case 'topbar-only':
    case 'debug-text':
      return section === 'topbar';
    case 'no-svg':
      return section !== 'graph';
    case 'svg-only':
      return section === 'graph';
    case 'full':
    default:
      return true;
  }
}

export function renderAppShellHtml(variant: RenderVariant = 'full'): string {
  const layout = buildInitialAppShellEvidenceLayout();

  return `<main class="app-shell">
    ${
      shouldRender(variant, 'topbar')
        ? `<header class="topbar">
      <div>
        <p class="eyebrow">personal-memory-ai · first screen</p>
        <h1>Memory brain graph</h1>
        <p>${escapeHtml(layout.northStar)} Web graph workspace is the first screen; app capture and imports feed MemoryRecord evidence into it.</p>
      </div>
      <div class="topbar-actions">
        <button type="button">Quick diary capture <span class="status status-partial">partial</span></button>
        <button type="button">Import preview <span class="status status-partial">partial</span></button>
      </div>
    </header>`
        : ''
    }
    <section class="first-screen-grid">
      <div class="workspace-main">
        ${shouldRender(variant, 'graph') ? renderMemoryGraph(layout) : ''}
        ${shouldRender(variant, 'ask') ? renderAskMyPastSelfPanel(layout) : ''}
        ${shouldRender(variant, 'decision') ? renderDecisionReplayPanel(layout) : ''}
        ${
          shouldRender(variant, 'capture')
            ? `<section class="app-capture-strip" aria-label="App capture feeds MemoryRecord graph">
          <article class="capture-card">
            <strong>Quick diary capture <span class="status status-partial">partial</span></strong>
            <p>Fast app capture writes daily diary notes into MemoryRecord before graph analysis.</p>
            <button type="button">Capture diary</button>
          </article>
          <article class="capture-card">
            <strong>Notion/Obsidian/Markdown import <span class="status status-partial">partial</span></strong>
            <p>P0 imported memories enter the same graph as diary entries with source evidence.</p>
            <button type="button">Preview imports</button>
          </article>
          <article class="capture-card">
            <strong>Native app client <span class="status status-skeleton">skeleton</span></strong>
            <p>The app surface remains separate from this browser workspace and is only specified here.</p>
            <button type="button">View capture contract</button>
          </article>
        </section>`
            : ''
        }
        ${shouldRender(variant, 'pattern') ? renderPatternPanel(layout) : ''}
      </div>
      ${shouldRender(variant, 'drawer') ? renderEvidenceDrawer(layout) : ''}
    </section>
  </main>`;
}

export function renderAppShellDocument(variant: RenderVariant = 'full'): string {
  if (variant === 'debug-text') {
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>personal-memory-ai debug text</title>
  </head>
  <body style="margin:0;padding:40px;background:#ffffff;color:#111111;font:700 32px/1.4 -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
    PMI-007 debug text visible pixels check
  </body>
</html>`;
  }

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>personal-memory-ai memory brain graph</title>
    <style>${APP_SHELL_STYLES}</style>
  </head>
  <body>${renderAppShellHtml(variant)}</body>
</html>`;
}

export function App(): string {
  return renderAppShellHtml();
}
