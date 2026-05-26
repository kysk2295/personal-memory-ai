import { renderAskMyPastSelfPanel } from './components/AskMyPastSelfPanel';
import { renderDecisionReplayPanel } from './components/DecisionReplayPanel';
import { renderEvidenceDrawer } from './components/EvidenceDrawer';
import { renderMemoryGraph } from './components/MemoryGraph';
import { renderPatternPanel } from './components/PatternPanel';
import { buildInitialAppShellEvidenceLayout } from './lib/appShellEvidenceLayout';

const APP_SHELL_STYLES = `
  :root {
    color: #f4ecdf;
    background:
      radial-gradient(circle at top, rgba(120, 97, 68, 0.18), transparent 0 32%),
      linear-gradient(180deg, #0e0c0b 0%, #12100f 45%, #171412 100%);
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-width: 320px;
    background:
      radial-gradient(circle at top, rgba(120, 97, 68, 0.18), transparent 0 32%),
      linear-gradient(180deg, #0e0c0b 0%, #12100f 45%, #171412 100%);
  }
  button, input { font: inherit; }
  .app-shell {
    max-width: 1480px;
    margin: 0 auto;
    padding: 26px 24px 80px;
    display: flex;
    flex-direction: column;
    gap: 30px;
  }
  .eyebrow {
    margin: 0;
    color: rgba(244, 236, 223, 0.5);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  .topbar {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: center;
    color: rgba(244, 236, 223, 0.64);
    font-size: 12px;
  }
  .topbar-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }
  .topbar-dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: #d9b37b;
    box-shadow: 0 0 24px rgba(217, 179, 123, 0.55);
  }
  .topbar-note {
    margin: 0;
    max-width: 420px;
    text-align: right;
    line-height: 1.45;
  }
  .hero-stage,
  .story-card,
  .editorial-band,
  .evidence-drawer {
    border: 1px solid rgba(244, 236, 223, 0.12);
    border-radius: 30px;
    background:
      linear-gradient(180deg, rgba(29, 25, 22, 0.92) 0%, rgba(20, 17, 15, 0.96) 100%),
      radial-gradient(circle at top right, rgba(191, 146, 91, 0.12), transparent 0 35%);
    box-shadow: 0 28px 80px rgba(0, 0, 0, 0.22);
    backdrop-filter: blur(18px);
  }
  .hero-stage {
    display: grid;
    grid-template-columns: minmax(0, 1.05fr) minmax(420px, 0.95fr);
    gap: 28px;
    padding: 34px;
    align-items: stretch;
  }
  .hero-copy {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 22px;
    min-width: 0;
  }
  .hero-copy h1,
  .hero-narrative h2,
  .graph-workspace h2,
  .section-header h2,
  .panel h3 {
    margin: 0;
    letter-spacing: -0.04em;
  }
  .hero-copy h1 {
    max-width: 8ch;
    font-size: clamp(58px, 8vw, 92px);
    line-height: 0.9;
  }
  .hero-lead {
    margin: 18px 0 0;
    max-width: 540px;
    color: rgba(244, 236, 223, 0.76);
    font-size: 16px;
    line-height: 1.72;
  }
  .hero-note {
    margin: 0;
    max-width: 520px;
    color: rgba(244, 236, 223, 0.56);
    font-size: 13px;
    line-height: 1.65;
  }
  .hero-pill-row,
  .hero-truths {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .hero-pill,
  .hero-truth {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(244, 236, 223, 0.12);
    background: rgba(244, 236, 223, 0.04);
    color: #f4ecdf;
    font-size: 12px;
    line-height: 1.35;
  }
  .hero-pill strong,
  .hero-truth strong { font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; }
  .hero-graph-card {
    border: 1px solid rgba(244, 236, 223, 0.12);
    border-radius: 26px;
    padding: 22px;
    background: linear-gradient(180deg, rgba(244, 236, 223, 0.04) 0%, rgba(244, 236, 223, 0.02) 100%);
    display: flex;
    flex-direction: column;
    gap: 14px;
    min-width: 0;
  }
  .hero-graph-intro {
    display: flex;
    justify-content: space-between;
    gap: 18px;
    align-items: flex-start;
  }
  .hero-graph-intro p { margin: 8px 0 0; color: rgba(244, 236, 223, 0.62); font-size: 13px; line-height: 1.55; }
  .hero-graph-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 999px;
    border: 1px solid rgba(217, 179, 123, 0.26);
    color: #eed3a8;
    background: rgba(217, 179, 123, 0.08);
    white-space: nowrap;
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .story-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 360px;
    gap: 22px;
    align-items: start;
  }
  .story-stack {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 22px;
  }
  .story-card {
    padding: 24px;
    min-width: 0;
  }
  .section-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 18px;
  }
  .section-header.compact h2 { font-size: 19px; }
  .section-header h2 { font-size: 28px; line-height: 1.05; }
  .section-intro,
  .panel p,
  .drawer-principle,
  .ask-answer-cited p,
  .decision-recommendation p,
  .similar-decision p,
  .capture-card p,
  .surface-list p {
    color: rgba(244, 236, 223, 0.68);
  }
  .status {
    display: inline-flex;
    align-items: center;
    border: 1px solid rgba(244, 236, 223, 0.14);
    border-radius: 999px;
    background: rgba(244, 236, 223, 0.05);
    color: #f4ecdf;
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
  .graph-support-copy,
  .graph-support-list,
  .graph-highlight-manifest {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .graph-support-copy { margin-top: 4px; }
  .graph-support-list span,
  .graph-highlight-manifest span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 10px;
    border: 1px solid rgba(244, 236, 223, 0.1);
    border-radius: 999px;
    background: rgba(244, 236, 223, 0.04);
    font-size: 12px;
    color: rgba(244, 236, 223, 0.82);
  }
  .graph-highlight-manifest span {
    border-color: rgba(217, 179, 123, 0.32);
    background: rgba(217, 179, 123, 0.08);
    color: #f4ecdf;
    font-size: 11px;
    overflow-wrap: anywhere;
  }
  .ask-flow,
  .decision-replay-flow,
  .panel,
  .capture-card,
  .drawer-item,
  .drawer-current-question,
  .decision-current-card,
  .decision-recommendation,
  .similar-decision {
    border: 1px solid rgba(244, 236, 223, 0.1);
    border-radius: 22px;
    background: rgba(244, 236, 223, 0.03);
  }
  .ask-flow,
  .decision-replay-flow { padding: 22px; }
  .ask-question-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .ask-question-row label,
  .decision-current-card label {
    color: rgba(244, 236, 223, 0.72);
    font-size: 12px;
    font-weight: 800;
    text-transform: uppercase;
  }
  .ask-question-row input,
  .decision-current-card input {
    width: 100%;
    min-height: 44px;
    border: 1px solid rgba(244, 236, 223, 0.12);
    border-radius: 14px;
    background: rgba(8, 7, 6, 0.25);
    color: #f4ecdf;
    padding: 11px 12px;
  }
  .ask-question-row button,
  .capture-card button {
    min-height: 42px;
    border: 1px solid rgba(244, 236, 223, 0.14);
    border-radius: 999px;
    background: rgba(244, 236, 223, 0.06);
    color: #f4ecdf;
    padding: 10px 14px;
  }
  .ask-answer-cited,
  .decision-current-card,
  .decision-recommendation,
  .similar-decision,
  .capture-card,
  .drawer-item,
  .drawer-current-question {
    padding: 16px;
  }
  .panel-topline {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: flex-start;
    margin-bottom: 10px;
    color: rgba(244, 236, 223, 0.56);
    font-size: 12px;
    font-weight: 800;
  }
  .ask-answer-cited h3,
  .decision-recommendation h3 { margin: 0; font-size: 18px; line-height: 1.35; }
  .citation-ref { color: #e7c594; font-weight: 800; text-decoration: none; }
  .ask-citations,
  .decision-citations,
  .decision-tag-list,
  .surface-list,
  .status-key {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .ask-citations {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }
  .ask-citations li,
  .decision-citations li {
    border: 1px solid rgba(244, 236, 223, 0.08);
    border-radius: 18px;
    background: rgba(244, 236, 223, 0.025);
    padding: 12px;
  }
  .ask-citations strong,
  .similar-decision strong { display: block; font-size: 12px; line-height: 1.4; }
  .ask-citations p,
  .decision-citations p,
  .drawer-item p,
  .drawer-current-question p,
  .capture-card p,
  .similar-decision p,
  .decision-recommendation p,
  .surface-list p {
    margin: 8px 0 0;
    font-size: 13px;
    line-height: 1.55;
  }
  .ask-citations code,
  .decision-citations code,
  .drawer-item code,
  .drawer-current-question code {
    display: block;
    margin-top: 8px;
    color: #c6b293;
    font-size: 11px;
    white-space: normal;
    overflow-wrap: anywhere;
  }
  .decision-columns {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-top: 14px;
  }
  .decision-columns span {
    display: block;
    color: rgba(244, 236, 223, 0.54);
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    margin-bottom: 6px;
  }
  .decision-tag-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .decision-tag-list li {
    border: 1px solid rgba(244, 236, 223, 0.12);
    border-radius: 999px;
    background: rgba(244, 236, 223, 0.04);
    color: #f4ecdf;
    font-size: 12px;
    font-weight: 700;
    padding: 6px 9px;
  }
  .similar-decision-list {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 12px;
  }
  .editorial-band {
    padding: 24px;
    display: grid;
    grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
    gap: 22px;
  }
  .analysis-panels {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .analysis-lead {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
    gap: 16px;
  }
  .panel { padding: 18px; }
  .panel h3 { font-size: 21px; line-height: 1.2; }
  .metric-row {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 12px;
    color: rgba(244, 236, 223, 0.74);
    font-size: 12px;
  }
  .surface-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-top: 12px;
  }
  .surface-list li {
    min-height: 108px;
    border: 1px solid rgba(244, 236, 223, 0.08);
    border-radius: 18px;
    padding: 14px;
    background: rgba(244, 236, 223, 0.025);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: 10px;
  }
  .status-key {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 10px;
  }
  .app-capture-strip {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .capture-card strong { display: block; margin-bottom: 6px; }
  .capture-rail-title {
    margin: 0 0 2px;
    font-size: 28px;
    line-height: 1.1;
    letter-spacing: -0.03em;
  }
  .capture-rail-intro {
    margin: 0;
    color: rgba(244, 236, 223, 0.64);
    font-size: 13px;
    line-height: 1.6;
  }
  .evidence-drawer {
    position: sticky;
    top: 18px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-height: calc(100vh - 36px);
    overflow: auto;
  }
  .drawer-principle { margin: 0 0 2px; font-size: 13px; line-height: 1.55; }
  .drawer-list { display: flex; flex-direction: column; gap: 10px; }
  .drawer-meta {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
    align-items: center;
    color: rgba(244, 236, 223, 0.56);
    font-size: 11px;
    font-weight: 700;
  }
  @media (max-width: 1180px) {
    .hero-stage,
    .story-grid,
    .story-stack,
    .editorial-band,
    .analysis-lead { grid-template-columns: 1fr; }
    .evidence-drawer { position: static; max-height: none; }
    .topbar { flex-direction: column; align-items: flex-start; }
    .topbar-note { text-align: left; }
  }
  @media (max-width: 720px) {
    .app-shell { padding: 14px 12px 56px; gap: 20px; }
    .hero-stage,
    .story-card,
    .editorial-band,
    .evidence-drawer { padding: 18px; border-radius: 24px; }
    .hero-copy h1 { font-size: 42px; }
    .hero-stage { grid-template-columns: 1fr; }
    .hero-graph-card { padding: 16px; }
    .ask-question-row,
    .decision-columns,
    .surface-list { grid-template-columns: 1fr; }
    .memory-graph { min-height: 280px; }
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
      <div class="topbar-brand">
        <span class="topbar-dot" aria-hidden="true"></span>
        <p class="eyebrow">personal-memory-ai · benchmark rebuild</p>
      </div>
      <p class="topbar-note">App capture feeds the web workspace, but the first impression should feel like a remembered life becoming evidence — not a dashboard.</p>
    </header>`
        : ''
    }
    <section class="hero-stage">
      <div class="hero-copy">
        <div>
          <p class="eyebrow">나보다 나를 더 잘 아는 개인 기억 AI</p>
          <h1>Memory becomes usable when it can answer back.</h1>
          <p class="hero-lead">${escapeHtml(layout.northStar)} 빠르게 남긴 일기와 가져온 기록이 하나의 second-brain graph로 모이고, Ask My Past Self와 Decision Replay는 그 기억을 근거로만 답한다.</p>
        </div>
        <div class="hero-narrative">
          <h2 class="capture-rail-title">The graph is the evidence surface, not the whole product.</h2>
          <p class="hero-note">First-screen composition borrows benchmark restraint and pacing, but preserves the product pillars: graph, cited Ask, replayed decisions, pattern detection, and a trust-surface drawer.</p>
          <div class="hero-pill-row">
            <span class="hero-pill"><strong>Ask</strong> cited answer first</span>
            <span class="hero-pill"><strong>Replay</strong> past outcome grounding</span>
            <span class="hero-pill"><strong>Drawer</strong> source · date · memory trace</span>
          </div>
          <div class="hero-truths">
            <span class="hero-truth">daily diary capture → web graph workspace</span>
            <span class="hero-truth">imported memory → cited evidence</span>
          </div>
        </div>
      </div>
      ${
        shouldRender(variant, 'graph')
          ? `<div class="hero-graph-card">
        <div class="hero-graph-intro">
          <div>
            <p class="eyebrow">web second-brain graph workspace</p>
            <h2>Daily diary and imported memories stay visible as primary evidence nodes</h2>
            <p>Emotion, project, decision, outcome, and source stay attached so the rest of the product can answer from memory instead of generic advice.</p>
          </div>
          <span class="hero-graph-kicker">evidence UI</span>
        </div>
        ${renderMemoryGraph(layout)}
      </div>`
          : ''
      }
    </section>
    <section class="story-grid">
      <div class="story-stack">
        ${shouldRender(variant, 'ask') ? `<div class="story-card">${renderAskMyPastSelfPanel(layout)}</div>` : ''}
        ${shouldRender(variant, 'decision') ? `<div class="story-card">${renderDecisionReplayPanel(layout)}</div>` : ''}
      </div>
      ${shouldRender(variant, 'drawer') ? renderEvidenceDrawer(layout) : ''}
    </section>
    <section class="editorial-band">
      ${shouldRender(variant, 'pattern') ? renderPatternPanel(layout) : ''}
      ${
        shouldRender(variant, 'capture')
          ? `<div class="app-capture-strip" aria-label="App capture feeds MemoryRecord graph">
        <div>
          <p class="eyebrow">capture and import lane</p>
          <h2 class="capture-rail-title">The product still has to ingest a life before it can reflect one.</h2>
          <p class="capture-rail-intro">Product planning stays visible here: app capture, import preview, and native client boundaries are shown honestly without crowding the hero.</p>
        </div>
        <article class="capture-card">
          <strong>Quick diary capture <span class="status status-partial">partial</span></strong>
          <p>Fast app capture writes daily diary notes into MemoryRecord before graph analysis.</p>
          <button type="button">Capture diary</button>
        </article>
        <article class="capture-card">
          <strong>Notion / Obsidian / Markdown import <span class="status status-partial">partial</span></strong>
          <p>Imported memories enter the same evidence graph as diary entries, with duplicate and source visibility.</p>
          <button type="button">Preview imports</button>
        </article>
        <article class="capture-card">
          <strong>Native app client <span class="status status-skeleton">skeleton</span></strong>
          <p>The app surface remains a separate product boundary and is shown honestly instead of being faked as complete.</p>
          <button type="button">View capture contract</button>
        </article>
      </div>`
          : ''
      }
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
