import { renderAskMyPastSelfPanel } from './components/AskMyPastSelfPanel';
import { renderDecisionReplayPanel } from './components/DecisionReplayPanel';
import { renderEvidenceDrawer } from './components/EvidenceDrawer';
import { renderMemoryGraph } from './components/MemoryGraph';
import { renderPatternPanel } from './components/PatternPanel';
import { renderPrivacyControlPanel } from './components/PrivacyControlPanel';
import { renderWeeklyReportPanel } from './components/WeeklyReportPanel';
import { buildInitialAppShellEvidenceLayout, type ShellPrimaryNode } from './lib/appShellEvidenceLayout';
import { buildMemoryGraphModel, type MemoryGraphModel } from './lib/memoryGraphModel';

const APP_SHELL_STYLES = `
  :root {
    color: #e7e7ea;
    background: #080808;
    font-family:
      Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  }
  * { box-sizing: border-box; }
  body { margin: 0; min-width: 320px; background: #080808; }
  button, input { font: inherit; }
  .second-brain-shell {
    min-height: 100vh;
    display: grid;
    grid-template-columns: 312px minmax(0, 1fr);
    background: linear-gradient(180deg, #f5f5fa 0%, #f2f2f8 100%);
    overflow: hidden;
  }
  .brain-sidebar {
    min-height: 100vh;
    padding: 22px 20px;
    border-right: 1px solid rgba(97, 102, 125, 0.12);
    background: #ececf3;
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
    border: 1px solid rgba(97, 102, 125, 0.14);
    background: rgba(255, 255, 255, 0.72);
    color: #5f6273;
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
  .locale-toggle button[aria-pressed="true"] { color: #ffffff; background: #8f80ff; }
  .eyebrow {
    margin: 0;
    color: #8a8f9e;
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
    color: #6d7282;
    font-size: 13px;
    line-height: 1.55;
  }
  .graph-meta-line {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 10px;
    color: #8b91a1;
    font-size: 12px;
    line-height: 1.4;
  }
  .graph-meta-line strong { color: #5a5f6f; font-size: 13px; }
  .graph-meta-dot { color: #bec3d1; }
  .memory-search-control {
    display: grid;
    gap: 8px;
  }
  .memory-search-control input {
    width: 100%;
    min-height: 34px;
    border: 1px solid rgba(97, 102, 125, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    color: #555b6e;
    padding: 7px 9px;
    font-size: 12px;
  }
  .memory-search-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #8b91a1;
    font-size: 11px;
  }
  .memory-search-results {
    display: grid;
    gap: 5px;
    max-height: 118px;
    overflow: auto;
  }
  .memory-search-result {
    border: 1px solid rgba(97, 102, 125, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.66);
    color: #626879;
    padding: 7px 8px;
    text-align: left;
    font-size: 11px;
    line-height: 1.3;
  }
  .memory-search-result strong {
    display: block;
    color: #555b6e;
    font-size: 11px;
    line-height: 1.25;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .memory-search-result[data-search-result-active="false"] {
    display: none;
  }
  .legend-section { display: flex; flex-direction: column; gap: 10px; }
  .legend-title {
    margin: 0;
    color: #8b91a1;
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
  .filter-chip[aria-pressed="false"] { opacity: 0.34; border-color: rgba(97,102,125,0.08); background: transparent; }
  .filter-dot { width: 8px; height: 8px; border-radius: 999px; background: #b8bdd1; }
  .filter-dot.semantic { background: #c3b9ff; }
  .filter-dot.reflective { background: #a4a9ba; }
  .filter-dot.procedural { background: #7f8498; }
  .filter-dot.episodic { background: #bfc4d4; }
  .filter-dot.thesis { background: #8f80ff; box-shadow: 0 0 10px rgba(143, 128, 255, 0.28); }
  .filter-dot.source { background: #9ea4c3; }
  .filter-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .filter-count { color: #949aac; font-weight: 750; }
  .layout-modes { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .layout-button { min-height: 32px; border-radius: 999px; font-size: 12px; }
  .layout-button.active,
  .control-pill.active { color: #ffffff; background: #8f80ff; }
  .graph-control-panel { display: flex; flex-direction: column; gap: 9px; }
  .control-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .control-label { color: #8c91a1; font-size: 11px; font-weight: 760; }
  .control-pill-group { display: inline-flex; gap: 5px; }
  .control-pill { min-height: 28px; min-width: 42px; border-radius: 999px; padding: 5px 9px; font-size: 11px; }
  .control-actions { display: grid; grid-template-columns: 1fr 1fr; gap: 7px; }
  .control-action { min-height: 31px; border-radius: 999px; font-size: 12px; }
  .control-action.subtle { color: #7f8698; }
  .control-hint { margin: 0; color: #8c91a1; font-size: 11px; line-height: 1.45; }
  .sidebar-footer {
    margin-top: auto;
    color: #81879a;
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
    gap: 14px;
  }
  .ask-memory-bar {
    position: relative;
    z-index: 3;
    min-height: 58px;
    max-width: 860px;
    margin: 0 auto;
    width: min(860px, 100%);
    border-radius: 999px;
    border: 1px solid rgba(117, 122, 143, 0.16);
    background: rgba(255, 255, 255, 0.88);
    box-shadow: 0 18px 44px rgba(167, 172, 198, 0.18);
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    gap: 12px;
    align-items: center;
    padding: 10px 11px 10px 18px;
  }
  .ask-lock { color: #a3a8ba; font-size: 15px; }
  .ask-memory-bar input {
    width: 100%;
    border: 0;
    outline: 0;
    background: transparent;
    color: #5a5f71;
    font-size: 15px;
  }
  .ask-memory-bar input::placeholder { color: #a3a8ba; }
  .ask-submit {
    width: 40px;
    height: 40px;
    border-radius: 999px;
    color: #ffffff;
    background: #8f80ff;
    font-size: 18px;
  }
  .product-value-strip {
    position: relative;
    z-index: 4;
    width: min(1180px, 100%);
    margin: 0 auto;
    border: 1px solid rgba(117, 122, 143, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 16px 36px rgba(165, 170, 197, 0.14);
    padding: 12px 14px;
    display: grid;
    grid-template-columns: minmax(0, 1.2fr) auto;
    gap: 14px;
    align-items: center;
  }
  .product-value-strip h2 {
    margin: 0;
    color: #4f5363;
    font-size: 19px;
    line-height: 1.15;
    letter-spacing: 0;
  }
  .product-value-strip p {
    margin: 5px 0 0;
    color: #757b8d;
    font-size: 12px;
    line-height: 1.45;
  }
  .privacy-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 6px;
  }
  .privacy-actions span {
    border: 1px solid rgba(88, 96, 122, 0.13);
    border-radius: 999px;
    padding: 6px 9px;
    color: #687084;
    background: rgba(246, 247, 252, 0.86);
    font-size: 11px;
    font-weight: 760;
  }
  .product-main-grid {
    position: relative;
    z-index: 2;
    width: min(1320px, 100%);
    margin: 0 auto;
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(320px, 420px);
    gap: 16px;
    align-items: stretch;
  }
  .graph-stage {
    position: relative;
    min-height: 650px;
    margin-top: 0;
    display: grid;
    place-items: center;
  }
  .cytoscape-memory-graph {
    position: absolute;
    inset: 0;
    z-index: 1;
    width: 100%;
    height: 100%;
    opacity: 0;
    transition: opacity 180ms ease;
  }
  .second-brain-shell[data-graph-renderer="cytoscape"] .cytoscape-memory-graph {
    opacity: 1;
  }
  .second-brain-shell[data-graph-renderer="cytoscape"] .graph-workspace {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
  }
  .graph-stage::before {
    content: "";
    position: absolute;
    inset: 4% 2% 2%;
    border-radius: 28px;
    background:
      radial-gradient(circle at 58% 51%, rgba(143, 128, 255, 0.08), transparent 0 24%),
      linear-gradient(180deg, rgba(255, 255, 255, 0.9), rgba(250, 250, 255, 0.82));
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.86), 0 20px 48px rgba(168, 173, 198, 0.16);
    pointer-events: none;
  }
  .graph-workspace {
    position: relative;
    width: min(112%, 1240px);
    transform: scale(1.04) translateY(8px);
    transition: transform 180ms ease, width 180ms ease;
  }
  .second-brain-shell[data-spacing="tight"] .graph-workspace { width: min(104%, 1160px); transform: scale(0.98) translateY(8px); }
  .second-brain-shell[data-spacing="wide"] .graph-workspace { width: min(122%, 1320px); transform: scale(1.09) translateY(8px); }
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
    filter: none;
  }
  .memory-graph rect:first-child { fill: rgba(255,255,255,0.95); stroke: rgba(152, 159, 188, 0.1); }
  .memory-node { cursor: pointer; outline: none; }
  .memory-node[data-selected="true"] .obsidian-node-core { fill: #8f80ff; stroke: #796df0; stroke-opacity: 0.82; stroke-width: 1.2px; }
  .memory-node[data-selected="true"] .obsidian-node-ring { stroke: rgba(143, 128, 255, 0.34); }
  .memory-node:focus-visible .obsidian-node-core { stroke: #8f80ff; stroke-opacity: 0.9; }
  .citation-ref[data-active="true"] { background: rgba(143, 128, 255, 0.12); border-color: rgba(143, 128, 255, 0.34); color: #6659dd; }
  .memory-inspector-source { color: #8c91a1; font-size: 12px; font-weight: 760; letter-spacing: 0.01em; }
  .wiki-compiler-strip {
    position: absolute;
    left: 34px;
    bottom: 30px;
    z-index: 2;
    max-width: 380px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
    color: #8e94a6;
    font-size: 11px;
    line-height: 1.35;
  }
  .wiki-compiler-strip strong { color: #5d6272; }
  .wiki-node-chip {
    border: 1px solid rgba(114, 120, 144, 0.12);
    border-radius: 999px;
    padding: 5px 8px;
    background: rgba(255, 255, 255, 0.75);
  }
  .memory-node .node-kicker,
  .hub-count { fill: #9aa0b1; font-size: 9px; font-weight: 800; }
  .memory-node .node-title { fill: #6e7383; font-size: 12px; font-weight: 520; }
  .memory-node .node-summary { fill: #949aac; font-size: 9px; }
  .node-source,
  .hub-title,
  .satellite-label { fill: #8990a1; font-size: 10px; font-weight: 540; }
  .satellite-label { fill: #a5abbb; font-size: 9px; }
  .ghost-memory-label { fill: #c2c6d4; font-size: 8px; font-weight: 520; }
  .selected-node-halo { fill: none; stroke: rgba(143, 128, 255, 0.34); stroke-opacity: 1; stroke-width: 1.2; }
  .selected-node-handle { fill: #8f80ff; fill-opacity: 0.88; }
  .obsidian-spoke-edge { stroke: rgba(181, 186, 204, 0.42); stroke-width: 1.05; transition: stroke 120ms ease, stroke-width 120ms ease, stroke-opacity 120ms ease; }
  .obsidian-spoke-edge[data-edge-active="true"] { stroke: rgba(143, 128, 255, 0.86); stroke-width: 1.55; stroke-opacity: 1; }
  .obsidian-spoke-edge[data-edge-active="false"] { stroke: rgba(181, 186, 204, 0.22); stroke-width: 0.95; stroke-opacity: 0.75; }
  .obsidian-faded-edge { stroke: rgba(181, 186, 204, 0.36); stroke-width: 1; }
  .obsidian-background-node { fill: rgba(255,255,255,0.96); stroke: rgba(173, 178, 199, 0.72); stroke-width: 1.1; }
  .obsidian-node-core { fill: rgba(255,255,255,0.98); stroke: rgba(151, 157, 181, 0.88); stroke-width: 1.1; }
  .obsidian-node-ring { fill: none; stroke: transparent; stroke-width: 1.2; }
  .obsidian-selected-memory .obsidian-node-core { fill: #9a8cff; stroke: #8072ec; }
  .obsidian-selected-memory .obsidian-node-label { fill: #6a5be2; font-size: 18px; font-weight: 480; }
  .obsidian-secondary-memory .obsidian-node-label { font-size: 11px; }
  .obsidian-question-pill rect { fill: rgba(255,255,255,0.86); stroke: rgba(154, 160, 185, 0.16); }
  .obsidian-question-pill text { fill: #8e94a6; font-size: 11px; font-weight: 560; }
  .obsidian-decision-chip circle,
  .obsidian-echo-node circle { fill: rgba(255,255,255,0.98); stroke: rgba(136, 143, 170, 0.78); stroke-width: 1.1; }
  .obsidian-decision-chip text { fill: #6f7688; font-size: 10px; font-weight: 520; }
  .obsidian-echo-node text { fill: #9aa1b4; font-size: 9px; font-weight: 520; }
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
    border: 1px solid rgba(120, 126, 149, 0.16);
    border-radius: 24px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(14px);
    box-shadow: 0 16px 42px rgba(175, 180, 206, 0.2);
    padding: 16px;
  }
  .memory-inspector h2 {
    margin: 6px 0 8px;
    font-size: 21px;
    line-height: 1.08;
    letter-spacing: -0.04em;
    color: #5e6374;
  }
  .memory-inspector p { margin: 0; color: #7c8295; font-size: 12px; line-height: 1.55; }
  .citation-row { display: flex; flex-wrap: wrap; gap: 7px; margin-top: 14px; }
  .citation-row a {
    color: #5f56d8;
    text-decoration: none;
    border: 1px solid rgba(143, 128, 255, 0.16);
    background: rgba(143, 128, 255, 0.08);
    border-radius: 999px;
    padding: 7px 9px;
    font-size: 11px;
  }
  .pill-red { color: #7a6ae7; }
  .product-rail {
    position: relative;
    z-index: 4;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 126px);
    overflow: auto;
    padding: 2px 2px 18px;
  }
  .product-rail > * { flex: 0 0 auto; }
  .product-panel,
  .evidence-drawer,
  .ask-flow,
  .decision-replay-flow,
  .analysis-panels .panel {
    border: 1px solid rgba(117, 122, 143, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    box-shadow: 0 14px 32px rgba(166, 171, 198, 0.13);
  }
  .ask-flow,
  .decision-replay-flow,
  .weekly-report-flow,
  .evidence-drawer,
  .analysis-panels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ask-flow { max-height: 500px; overflow: auto; }
  .weekly-report-flow { max-height: 470px; overflow: auto; }
  .evidence-drawer { max-height: 390px; overflow: auto; }
  .ask-flow,
  .decision-replay-flow,
  .weekly-report-flow,
  .evidence-drawer,
  .analysis-panels .panel {
    padding: 14px;
  }
  .section-header,
  .panel-topline,
  .drawer-meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
  }
  .section-header h2,
  .panel h3,
  .ask-answer-cited h3,
  .decision-recommendation h3,
  .evidence-drawer h2 {
    margin: 4px 0 0;
    color: #53586a;
    font-size: 16px;
    line-height: 1.2;
    letter-spacing: 0;
  }
  .section-intro,
  .drawer-principle,
  .ask-answer-cited p,
  .decision-recommendation p,
  .similar-decision p,
  .panel p,
  .drawer-item p,
  .insufficient-evidence-state p {
    margin: 0;
    color: #73798c;
    font-size: 12px;
    line-height: 1.5;
  }
  .status,
  .status-badge {
    flex: 0 0 auto;
    border: 1px solid rgba(111, 119, 146, 0.14);
    border-radius: 999px;
    padding: 4px 7px;
    color: #687084;
    background: rgba(246,247,252,0.9);
    font-size: 10px;
    font-weight: 760;
  }
  .ask-question-row,
  .decision-current-card,
  .drawer-current-question,
  .ask-answer-cited,
  .decision-recommendation,
  .insufficient-evidence-state,
  .similar-decision,
  .drawer-item {
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 8px;
    background: rgba(250, 251, 255, 0.78);
    padding: 10px;
  }
  .ask-question-row,
  .decision-current-card {
    display: grid;
    gap: 8px;
  }
  .ask-question-row input,
  .decision-current-card input {
    width: 100%;
    min-width: 0;
    border: 1px solid rgba(117, 122, 143, 0.14);
    border-radius: 8px;
    background: #ffffff;
    color: #555b6e;
    padding: 8px 9px;
    font-size: 12px;
  }
  .ask-question-row button {
    justify-self: start;
    border: 1px solid rgba(143, 128, 255, 0.24);
    border-radius: 8px;
    background: #8f80ff;
    color: #ffffff;
    padding: 7px 11px;
    font-size: 12px;
    font-weight: 760;
  }
  .ask-citations,
  .decision-citations,
  .pattern-memory-list,
  .weekly-report-aggregate-list,
  .privacy-action-list,
  .decision-tag-list,
  .surface-list,
  .status-key {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .ask-citations,
  .similar-decision-list,
  .drawer-list,
  .weekly-report-aggregate-list,
  .analysis-lead {
    display: grid;
    gap: 9px;
  }
  .ask-citations li,
  .decision-citations li,
  .weekly-report-aggregate-list li,
  .weekly-report-pattern {
    display: grid;
    gap: 5px;
    border-top: 1px solid rgba(117, 122, 143, 0.1);
    padding-top: 8px;
  }
  .citation-ref,
  .pattern-memory-list a {
    color: #6255d7;
    text-decoration: none;
    overflow-wrap: anywhere;
  }
  .decision-columns {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
  }
  .decision-columns span,
  .weekly-report-aggregate-list strong,
  .panel-topline span:first-child,
  .drawer-current-question strong,
  .insufficient-evidence-state strong,
  .supporting-label {
    color: #8a90a2;
    font-size: 11px;
    font-weight: 780;
  }
  .decision-tag-list,
  .pattern-memory-list,
  .privacy-action-list,
  .entrypoint-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .decision-tag-list li,
  .pattern-memory-list li,
  .privacy-action-list li,
  .entrypoint-grid a,
  .entrypoint-grid button {
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 999px;
    background: rgba(255,255,255,0.76);
    color: #687084;
    padding: 5px 7px;
    font-size: 11px;
    text-decoration: none;
  }
  .capture-prototype,
  .import-preview-actions {
    display: grid;
    gap: 8px;
    border-top: 1px solid rgba(117, 122, 143, 0.1);
    padding-top: 10px;
  }
  .capture-prototype label {
    color: #8a90a2;
    font-size: 11px;
    font-weight: 780;
  }
  .capture-prototype textarea {
    width: 100%;
    min-height: 84px;
    resize: none;
    border: 1px solid rgba(117, 122, 143, 0.14);
    border-radius: 8px;
    background: #ffffff;
    color: #555b6e;
    padding: 8px 9px;
    font-size: 12px;
    line-height: 1.45;
  }
  .capture-meta,
  .import-preview-list {
    display: grid;
    gap: 6px;
  }
  .capture-meta {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .capture-meta span,
  .import-preview-list article {
    border: 1px solid rgba(117, 122, 143, 0.11);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    padding: 7px;
    color: #687084;
    font-size: 11px;
  }
  .import-preview-list article {
    display: grid;
    gap: 4px;
  }
  .import-preview-list strong {
    color: #53586a;
    font-size: 12px;
  }
  .import-preview-list span {
    color: #7164dc;
    font-size: 11px;
    font-weight: 760;
  }
  .drawer-list {
    max-height: 380px;
    overflow: auto;
  }
  .drawer-item code,
  .ask-citations code,
  .decision-citations code {
    color: #8f96aa;
    font-size: 10px;
    overflow-wrap: anywhere;
  }
  html,
  body {
    background: #080808;
  }
  .second-brain-shell {
    grid-template-columns: 260px minmax(0, 1fr);
    background: #080808;
  }
  .brain-sidebar {
    padding: 18px 16px;
    border-right: 1px solid rgba(255, 255, 255, 0.08);
    background: #101010;
    gap: 12px;
    overflow: auto;
  }
  .home-button,
  .locale-toggle button,
  .filter-chip,
  .layout-button,
  .control-pill,
  .control-action,
  .ask-submit {
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(255, 255, 255, 0.055);
    color: #b9b9bd;
  }
  .locale-toggle button[aria-pressed="true"],
  .layout-button.active,
  .control-pill.active {
    color: #ffffff;
    background: #d61f3c;
    border-color: rgba(214, 31, 60, 0.82);
  }
  .eyebrow,
  .legend-title,
  .control-label,
  .control-hint,
  .sidebar-footer,
  .graph-meta-line {
    color: #808086;
  }
  .brain-title h1 {
    color: #f3f3f1;
    font-size: 34px;
    line-height: 0.96;
    letter-spacing: 0;
  }
  .brain-title p {
    margin-top: 10px;
    font-size: 12px;
    line-height: 1.45;
  }
  .graph-meta-line {
    gap: 5px 8px;
    font-size: 11px;
  }
  .legend-section {
    gap: 7px;
  }
  .filter-list {
    gap: 5px;
  }
  .brain-title p,
  .graph-meta-line strong {
    color: #c4c4c8;
  }
  .filter-chip {
    min-height: 25px;
    padding: 5px 8px;
  }
  .memory-search-control input {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.055);
    color: #f0f0f2;
  }
  .memory-search-control input::placeholder {
    color: #77777d;
  }
  .memory-search-meta {
    color: #808086;
  }
  .memory-search-result {
    border-color: rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.055);
    color: #b9b9bd;
  }
  .memory-search-result strong {
    color: #efeff1;
  }
  .layout-button,
  .control-action {
    min-height: 28px;
  }
  .control-hint,
  .sidebar-footer {
    display: none;
  }
  .filter-chip[aria-pressed="false"] {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.05);
  }
  .filter-dot.thesis,
  .filter-dot.semantic {
    background: #d61f3c;
    box-shadow: 0 0 12px rgba(214, 31, 60, 0.32);
  }
  .filter-count {
    color: #77777d;
  }
  .brain-canvas {
    padding: 18px 22px 20px;
    gap: 0;
    background: #080808;
  }
  .ask-memory-bar {
    position: absolute;
    top: 18px;
    left: 50%;
    transform: translateX(-50%);
    width: min(780px, calc(100% - 48px));
    min-height: 50px;
    border-color: rgba(255, 255, 255, 0.12);
    background: rgba(18, 18, 18, 0.9);
    box-shadow: 0 16px 40px rgba(0, 0, 0, 0.36);
  }
  .ask-lock {
    color: #828288;
  }
  .ask-memory-bar input {
    color: #f2f2f2;
  }
  .ask-memory-bar input::placeholder {
    color: #77777d;
  }
  .ask-submit {
    background: #d61f3c;
    border-color: rgba(214, 31, 60, 0.9);
  }
  .product-value-strip {
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
  .product-main-grid {
    width: 100%;
    margin: 0;
    display: block;
    min-height: calc(100vh - 38px);
  }
  .graph-stage {
    min-height: calc(100vh - 38px);
    height: calc(100vh - 38px);
    display: block;
    overflow: hidden;
  }
  .graph-stage::before {
    display: none;
  }
  .graph-workspace,
  .second-brain-shell[data-spacing="tight"] .graph-workspace,
  .second-brain-shell[data-spacing="wide"] .graph-workspace {
    width: 100%;
    height: 100%;
    transform: none;
  }
  .graph-workspace,
  .memory-graph,
  [data-filter-kind] {
    transition: opacity 160ms ease, transform 180ms ease, stroke-opacity 160ms ease;
  }
  .second-brain-shell[data-layout-mode="rearranged"] .graph-workspace {
    transform: translateX(-1.2%) translateY(1.2%) scale(1.025);
  }
  .second-brain-shell[data-spacing="tight"] .memory-graph {
    transform: scale(0.96);
    transform-origin: center;
  }
  .second-brain-shell[data-spacing="wide"] .memory-graph {
    transform: scale(1.055);
    transform-origin: center;
  }
  [data-filter-active="false"] {
    opacity: 0.12;
  }
  .memory-node[data-search-match="false"] {
    opacity: 0.12;
  }
  .obsidian-faded-edge[data-filter-active="false"],
  .obsidian-spoke-edge[data-filter-active="false"] {
    stroke-opacity: 0.08;
  }
  .memory-graph {
    width: 100%;
    height: 100%;
    min-height: 0;
    filter: none;
  }
  .memory-graph rect:first-child {
    fill: #080808;
    stroke: rgba(255, 255, 255, 0.035);
  }
  .obsidian-faded-edge {
    stroke: rgba(255, 255, 255, 0.13);
    stroke-width: 0.75;
  }
  .obsidian-background-node {
    fill: rgba(168, 168, 172, 0.92);
    stroke: rgba(240, 240, 240, 0.34);
    stroke-width: 0.75;
  }
  .ghost-memory-label {
    fill: #8e8e94;
    font-size: 8px;
    font-weight: 520;
  }
  .obsidian-node-core {
    fill: #eeeeec;
    stroke: rgba(255, 255, 255, 0.72);
    stroke-width: 0.9;
  }
  .obsidian-node-ring {
    fill: none;
    stroke: transparent;
  }
  .memory-node[data-selected="true"] .obsidian-node-core,
  .obsidian-selected-memory .obsidian-node-core {
    fill: #d61f3c;
    stroke: #ff6076;
    stroke-opacity: 0.9;
    stroke-width: 1.4px;
  }
  .memory-node[data-selected="true"] .obsidian-node-ring {
    stroke: rgba(214, 31, 60, 0.42);
    stroke-width: 1.6;
  }
  .obsidian-spoke-edge {
    stroke: rgba(255, 255, 255, 0.19);
    stroke-width: 1;
  }
  .obsidian-spoke-edge[data-edge-active="true"] {
    stroke: rgba(214, 31, 60, 0.92);
    stroke-width: 1.45;
  }
  .obsidian-spoke-edge[data-edge-active="false"] {
    stroke: rgba(255, 255, 255, 0.1);
  }
  .memory-node .node-title,
  .node-source,
  .hub-title,
  .satellite-label,
  .obsidian-decision-chip text,
  .obsidian-echo-node text {
    fill: #b9b9bd;
  }
  .obsidian-selected-memory .obsidian-node-label {
    fill: #ffffff;
    font-size: 17px;
    font-weight: 520;
  }
  .obsidian-secondary-memory .obsidian-node-label {
    fill: #d4d4d6;
    font-size: 10px;
  }
  .selected-node-halo {
    stroke: rgba(214, 31, 60, 0.42);
    stroke-width: 1.2;
  }
  .selected-node-handle,
  .obsidian-decision-chip circle,
  .obsidian-echo-node circle {
    fill: #d61f3c;
    stroke: rgba(255, 255, 255, 0.54);
  }
  .obsidian-question-pill rect {
    fill: rgba(16, 16, 16, 0.82);
    stroke: rgba(255, 255, 255, 0.1);
  }
  .obsidian-question-pill text {
    fill: #d9d9dc;
  }
  .wiki-compiler-strip {
    left: 20px;
    bottom: 24px;
    max-width: 420px;
    color: #8c8c92;
  }
  .wiki-compiler-strip strong,
  .wiki-node-chip {
    color: #d8d8db;
  }
  .wiki-node-chip {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
  }
  .memory-inspector {
    right: 22px;
    bottom: 82px;
    width: min(330px, calc(100% - 44px));
    max-height: 330px;
    overflow: auto;
    border-color: rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(14, 14, 14, 0.82);
    box-shadow: 0 20px 48px rgba(0, 0, 0, 0.32);
  }
  .memory-inspector h2 {
    color: #f1f1f1;
    font-size: 16px;
    letter-spacing: 0;
  }
  .memory-inspector p,
  .memory-inspector-source {
    color: #adadb3;
  }
  .citation-row a,
  .citation-ref[data-active="true"] {
    border-color: rgba(214, 31, 60, 0.36);
    background: rgba(214, 31, 60, 0.12);
    color: #ff8797;
  }
  .pill-red,
  .citation-ref,
  .pattern-memory-list a {
    color: #ff8797;
  }
  .product-rail {
    position: absolute;
    right: 22px;
    bottom: 18px;
    z-index: 5;
    width: min(420px, calc(100vw - 330px));
    max-height: min(560px, calc(100vh - 144px));
    overflow: auto;
    padding: 0 8px 10px;
    border: 1px solid rgba(214, 31, 60, 0.3);
    border-radius: 8px;
    background: rgba(12, 12, 12, 0.9);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.46);
    transform: translateY(calc(100% - 52px));
    transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
  }
  .product-rail:hover,
  .product-rail:focus-within {
    transform: translateY(0);
    background: rgba(13, 13, 13, 0.96);
  }
  .product-rail::before {
    content: "Evidence drawer / reports";
    position: sticky;
    top: 0;
    z-index: 2;
    display: block;
    min-height: 50px;
    margin: 0 -8px 10px;
    padding: 17px 14px 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    background: rgba(18, 18, 18, 0.98);
    color: #f0f0f1;
    font-size: 12px;
    font-weight: 780;
    letter-spacing: 0;
  }
  .product-panel,
  .evidence-drawer,
  .ask-flow,
  .decision-replay-flow,
  .analysis-panels .panel {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(22, 22, 24, 0.92);
    box-shadow: none;
  }
  .section-header h2,
  .panel h3,
  .ask-answer-cited h3,
  .decision-recommendation h3,
  .evidence-drawer h2,
  .import-preview-list strong {
    color: #ececef;
  }
  .section-intro,
  .drawer-principle,
  .ask-answer-cited p,
  .decision-recommendation p,
  .similar-decision p,
  .panel p,
  .drawer-item p,
  .insufficient-evidence-state p {
    color: #b0b0b6;
  }
  .ask-question-row,
  .decision-current-card,
  .drawer-current-question,
  .ask-answer-cited,
  .decision-recommendation,
  .insufficient-evidence-state,
  .similar-decision,
  .drawer-item,
  .capture-meta span,
  .import-preview-list article,
  .decision-tag-list li,
  .pattern-memory-list li,
  .privacy-action-list li,
  .entrypoint-grid a,
  .entrypoint-grid button {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: #c3c3c8;
  }
  .ask-question-row input,
  .decision-current-card input,
  .capture-prototype textarea {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.055);
    color: #f0f0f2;
  }
  .status,
  .status-badge {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.055);
    color: #a8a8ae;
  }
  .privacy-control-flow {
    display: grid;
    gap: 12px;
    padding: 14px;
  }
  .privacy-control-card {
    display: grid;
    gap: 8px;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 10px;
  }
  .privacy-control-card h3 {
    margin: 0;
    color: #ececef;
    font-size: 14px;
    line-height: 1.2;
  }
  .privacy-control-card p {
    margin: 0;
    color: #b0b0b6;
    font-size: 12px;
    line-height: 1.5;
  }
  .privacy-control-card code {
    color: #ff8797;
    font-size: 10px;
    overflow-wrap: anywhere;
  }
  .privacy-control-card input {
    width: 100%;
    border: 1px solid rgba(214, 31, 60, 0.22);
    border-radius: 8px;
    background: rgba(214, 31, 60, 0.08);
    color: #f0f0f2;
    padding: 8px 9px;
    font-size: 12px;
  }
  .privacy-control-card.danger-zone {
    border-top-color: rgba(214, 31, 60, 0.28);
  }
  @media (max-width: 980px) {
    .second-brain-shell { grid-template-columns: 1fr; overflow: auto; }
    .brain-sidebar {
      min-height: auto;
      max-height: 280px;
      border-right: 0;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      overflow: auto;
    }
    .brain-canvas {
      min-height: 720px;
      padding: 0 10px 20px;
    }
    .ask-memory-bar {
      top: 12px;
      width: calc(100% - 22px);
    }
    .product-main-grid { grid-template-columns: 1fr; }
    .graph-stage {
      min-height: 520px;
      height: 520px;
      padding-top: 74px;
    }
    .memory-graph {
      height: 420px;
    }
    .product-rail {
      position: relative;
      right: auto;
      bottom: auto;
      width: calc(100% - 20px);
      max-height: 360px;
      margin: 12px auto 0;
      overflow: auto;
      transform: none;
    }
    .memory-inspector {
      position: absolute;
      right: 12px;
      bottom: 70px;
      width: calc(100% - 24px);
      max-height: 210px;
    }
    .wiki-compiler-strip { display: none; }
  }
  @media (max-width: 640px) {
    .brain-sidebar { padding: 18px 14px; }
    .brain-canvas { padding: 16px 12px 28px; }
    .brain-title h1 { font-size: 36px; }
    .memory-graph { min-height: 420px; }
    .ask-memory-bar { grid-template-columns: auto minmax(0, 1fr) auto; }
    .product-value-strip { grid-template-columns: 1fr; }
    .privacy-actions { justify-content: flex-start; }
    .decision-columns { grid-template-columns: 1fr; }
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

function escapeJsonScript(value: string): string {
  return value.replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export type RenderVariant = 'full' | 'plain' | 'topbar-only' | 'no-svg' | 'svg-only' | 'debug-text';

function renderFilter(labelKo: string, labelEn: string, count: number, kind: string): string {
  return `<button type="button" class="filter-chip" data-filter-chip="${escapeHtml(kind)}" aria-pressed="true"><span class="filter-dot ${kind}" aria-hidden="true"></span><span class="filter-name">${labelKo}<span aria-hidden="true"> ${labelEn}</span></span><span class="filter-count">${count}</span></button>`;
}

function renderMemorySearchResult(node: ShellPrimaryNode): string {
  const searchText = [node.summary, node.recordType, node.sourceType, node.observedAt, node.recordId].join(' ').toLocaleLowerCase();
  return `<button type="button" class="memory-search-result" data-search-result="memory" data-search-result-active="true" data-search-citation="${escapeHtml(
    node.recordId,
  )}" data-search-text="${escapeHtml(searchText)}">
    <strong>${escapeHtml(node.summary)}</strong>
    <span>${escapeHtml(`${node.sourceType} · ${node.recordType} · ${node.observedAt}`)}</span>
  </button>`;
}

function renderMemoryGraphPayload(graph: MemoryGraphModel): string {
  return `<script type="application/json" id="memory-graph-elements">${escapeJsonScript(JSON.stringify(graph))}</script>`;
}

export function renderAppShellHtml(variant: RenderVariant = 'full'): string {
  const layout = buildInitialAppShellEvidenceLayout();
  const memoryGraph = buildMemoryGraphModel(layout.records);
  const graphNodeCount = memoryGraph.stats.graphNodeCount;
  const graphEdgeCount = memoryGraph.stats.edgeCount;
  const memoryNodeCount = memoryGraph.stats.memoryNodeCount;
  const citationLinks = layout.ask.citationMemoryIds
    .slice(0, 3)
    .map((citationId) => `<a href="#evidence-${escapeHtml(citationId)}" class="citation-ref" data-citation-ref="${escapeHtml(citationId)}">[${escapeHtml(citationId)}]</a>`)
    .join('');

  if (variant === 'plain' || variant === 'topbar-only' || variant === 'debug-text') {
    return `<main class="second-brain-shell"><aside class="brain-sidebar"><section class="brain-title"><p class="eyebrow">지식 그래프</p><h1>Second Brain</h1><p>${escapeHtml(layout.northStar)}</p></section></aside></main>`;
  }

  return `<main class="second-brain-shell" data-labels="visible" data-spacing="normal" data-layout-mode="free" data-layout-version="0" data-filter-semantic="on" data-filter-reflective="on" data-filter-procedural="on" data-filter-episodic="on" data-filter-thesis="on" data-filter-source="on" data-graph-renderer="cytoscape-pending" data-benchmark-reference="https://www.careerhackeralex.com/memory" data-memory-node-count="${memoryNodeCount}" data-graph-node-count="${graphNodeCount}" data-graph-edge-count="${graphEdgeCount}" data-surface-mode="graph-first" data-rail-mode="collapsed-evidence-drawer" data-interaction-contract="filter-select-space-rearrange">
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
        <span><strong>${memoryNodeCount}</strong> memories</span>
        <span class="graph-meta-dot">·</span>
        <span><strong>${graphNodeCount}</strong> graph nodes</span>
        <span class="graph-meta-dot">·</span>
        <span><strong>${graphEdgeCount}</strong> edges</span>
        <span class="graph-meta-dot">·</span>
        <span>last woven from diary + imports</span>
      </div>

      <section class="memory-search-control" aria-label="Memory search">
        <input type="search" data-control="memory-search" placeholder="기억 검색" aria-label="기억 검색" autocomplete="off" />
        <div class="memory-search-meta">
          <span data-search-count>${layout.primaryNodes.length} / ${layout.primaryNodes.length}</span>
          <span>private vault</span>
        </div>
        <div class="memory-search-results" data-search-results="memory" aria-label="Memory search results">
          ${layout.primaryNodes.map(renderMemorySearchResult).join('')}
        </div>
      </section>

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
        <input id="ask-memory-bar-question" name="question" value="${escapeHtml(layout.askQuestion)}" aria-label="Ask My Past Self question" />
        <button class="ask-submit" type="button" aria-label="Ask">→</button>
      </form>

      <section class="product-value-strip" aria-label="Private memory product value">
        <div>
          <p class="eyebrow">Private Personal Memory AI</p>
          <h2>나보다 나를 더 잘 아는 개인 기억 AI</h2>
          <p>앱에서 쓴 일기와 가져온 기록이 개인 기억 그래프로 연결된다. 공유는 공개가 아니라, 현재 일기와 과거 기억이 같은 맥락 안에서 함께 떠오른다는 뜻이다.</p>
        </div>
        <div class="privacy-actions" aria-label="Privacy and control actions">
          <span>비공개 기본값</span>
          <span>로컬 프로토타입</span>
          <span>내보내기</span>
          <span>삭제</span>
        </div>
      </section>

      <div class="product-main-grid">
        <div class="graph-stage">
          <div id="memory-graph-cytoscape" class="cytoscape-memory-graph" data-graph-library="cytoscape" data-memory-node-count="${memoryNodeCount}" data-graph-node-count="${graphNodeCount}" data-graph-edge-count="${graphEdgeCount}" aria-label="Cytoscape data-driven personal memory graph"></div>
          ${renderMemoryGraphPayload(memoryGraph)}
          ${variant === 'no-svg' ? '' : renderMemoryGraph(layout)}
          <aside class="wiki-compiler-strip" aria-label="LLM Wiki compiler preview" data-wiki-compiler="pmi017">
            <span><strong>${layout.compiledWiki.atomCount}</strong> canonical memory atoms</span>
            <span><strong>${layout.compiledWiki.nodeCount}</strong> compiled wiki nodes</span>
            <span><strong>${layout.compiledWiki.citationCount}</strong> citations</span>
            <span data-memory-ops="retain-recall-reflect">retain ${layout.compiledWiki.operationCounts.retain} · recall ${layout.compiledWiki.operationCounts.recall} · reflect ${layout.compiledWiki.operationCounts.reflect}</span>
            <span data-memory-freshness="strengthening-stable-stale">freshness ${layout.compiledWiki.freshnessCounts.strengthening}/${layout.compiledWiki.freshnessCounts.stable}/${layout.compiledWiki.freshnessCounts.stale}</span>
            ${layout.compiledWiki.nodes
              .filter((node) => node.type === 'pattern' || node.type === 'concept')
              .sort((left, right) => (left.type === right.type ? left.id.localeCompare(right.id) : left.type === 'pattern' ? -1 : 1))
              .slice(0, 2)
              .map((node) => `<span class="wiki-node-chip" data-wiki-node-id="${escapeHtml(node.id)}">${escapeHtml(node.title)}</span>`)
              .join('')}
            ${layout.compiledWiki.atoms
              .filter((atom) => atom.freshness === 'strengthening')
              .slice(0, 1)
              .map((atom) => `<span class="wiki-node-chip subtle" data-memory-atom-id="${escapeHtml(atom.id)}">${escapeHtml(atom.canonicalClaim)}</span>`)
              .join('')}
          </aside>

          <article class="memory-inspector" aria-label="Ask My Past Self cited question flow" data-inspector-panel="pmi015">
            <p class="eyebrow">Ask My Past Self · cited path</p>
            <h2 data-inspector-headline>${escapeHtml(layout.ask.recommendation)}</h2>
            <p class="memory-inspector-source" data-inspector-source>selected path · 3 cited memories</p>
            <p data-inspector-body>반복된 <span class="pill-red">anxiety → feature addition → launch delay</span> 경로만 근거로 답한다. Decision Replay는 현재 결정을 과거 결과와 비교하고, Evidence drawer는 출처·날짜·기억 원문으로 되돌아간다.</p>
            <div class="citation-row" aria-label="Ask My Past Self citations" data-inspector-citations>${citationLinks}</div>
          </article>
        </div>

        <aside class="product-rail" aria-label="Cited memory product rail" data-rail-mode="collapsed-evidence-drawer">
          ${renderAskMyPastSelfPanel(layout)}
          ${renderPrivacyControlPanel(layout)}
          ${renderWeeklyReportPanel(layout)}
          ${renderEvidenceDrawer(layout)}
          ${renderDecisionReplayPanel(layout)}
          ${renderPatternPanel(layout)}
        </aside>
      </div>
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
  const memoryNodes = Array.from(document.querySelectorAll('[data-control="select-memory"]'));
  const inspector = document.querySelector('[data-inspector-panel="pmi015"]');
  const inspectorHeadline = inspector?.querySelector('[data-inspector-headline]');
  const inspectorSource = inspector?.querySelector('[data-inspector-source]');
  const inspectorBody = inspector?.querySelector('[data-inspector-body]');
  const inspectorCitations = inspector?.querySelector('[data-inspector-citations]');
  const citationRefs = Array.from(document.querySelectorAll('[data-citation-ref]'));
  const memoryEdges = Array.from(document.querySelectorAll('.obsidian-spoke-edge[data-edge-from][data-edge-to]'));
  const filterTargets = Array.from(document.querySelectorAll('[data-filter-kind]'));
  const memorySearchInput = document.querySelector('[data-control="memory-search"]');
  const memorySearchCount = document.querySelector('[data-search-count]');
  const memorySearchResults = Array.from(document.querySelectorAll('[data-search-result="memory"]'));
  const cytoscapeMount = document.querySelector('[data-graph-library="cytoscape"]');
  const graphPayloadScript = document.querySelector('#memory-graph-elements');
  let cytoscapeGraph = null;
  let layoutVersion = Number(shell.getAttribute('data-layout-version') || '0');

  const setInteractionState = (value) => {
    shell.setAttribute('data-interaction-state', value);
  };

  const escapeText = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const findMemoryNodeByCitation = (citation) =>
    memoryNodes.find((item) => item.getAttribute('data-inspector-citation') === citation);

  const markCytoscapeSelection = (citation) => {
    if (!cytoscapeGraph || !citation) return;
    cytoscapeGraph.elements().removeClass('selected-memory selected-edge');
    const selectedNode = cytoscapeGraph.getElementById('memory:' + citation);
    if (selectedNode && selectedNode.length) {
      selectedNode.addClass('selected-memory');
      selectedNode.connectedEdges().addClass('selected-edge');
      cytoscapeGraph.center(selectedNode);
    }
  };

  const selectMemory = (node) => {
    if (!node || !inspectorHeadline || !inspectorBody || !inspectorSource) return;
    memoryNodes.forEach((item) => item.setAttribute('data-selected', String(item === node)));
    const title = node.getAttribute('data-inspector-title') || 'Selected memory';
    const source = node.getAttribute('data-inspector-source') || 'memory source';
    const body = node.getAttribute('data-inspector-body') || '';
    const citation = node.getAttribute('data-inspector-citation') || '';
    inspectorHeadline.textContent = title;
    inspectorSource.textContent = source;
    inspectorBody.textContent = body;
    if (inspectorCitations && citation) {
      inspectorCitations.innerHTML =
        '<a href="#evidence-' +
        escapeText(citation) +
        '" class="citation-ref" data-citation-ref="' +
        escapeText(citation) +
        '" data-active="true">[' +
        escapeText(citation) +
        ']</a>';
      inspectorCitations.setAttribute('data-inspector-selected-citation', citation);
    }
    citationRefs.forEach((ref) => ref.setAttribute('data-active', String(ref.getAttribute('data-citation-ref') === citation)));
    memoryEdges.forEach((edge) => {
      const edgeFrom = edge.getAttribute('data-edge-from');
      const edgeTo = edge.getAttribute('data-edge-to');
      const active = edgeFrom === citation || edgeTo === citation;
      edge.setAttribute('data-edge-active', String(active));
    });
    inspector.setAttribute('data-selected-memory', citation);
    shell.setAttribute('data-active-memory', citation);
    markCytoscapeSelection(citation);
    setInteractionState('memory-selected');
  };

  const selectMemoryByCitation = (citation) => {
    const node = findMemoryNodeByCitation(citation);
    if (node) selectMemory(node);
  };

  const setCytoscapeLabelVisibility = (hidden) => {
    if (!cytoscapeGraph) return;
    cytoscapeGraph.nodes().toggleClass('labels-hidden', hidden);
  };

  const initializeCytoscapeGraph = () => {
    if (!cytoscapeMount || !graphPayloadScript || typeof window.cytoscape !== 'function') return;
    const payload = JSON.parse(graphPayloadScript.textContent || '{}');
    cytoscapeGraph = window.cytoscape({
      container: cytoscapeMount,
      elements: payload.elements || [],
      minZoom: 0.45,
      maxZoom: 2.2,
      wheelSensitivity: 0.16,
      style: [
        {
          selector: 'node',
          style: {
            label: 'data(graphLabel)',
            color: '#b9b9bd',
            'font-size': 8,
            'text-wrap': 'wrap',
            'text-max-width': 150,
            'text-outline-width': 2,
            'text-outline-color': '#080808',
            'text-valign': 'center',
            'text-halign': 'right',
            'text-margin-x': 8,
            'background-color': '#a9a9ad',
            width: 7,
            height: 7,
          },
        },
        {
          selector: 'node[kind = "memory"]',
          style: {
            label: '',
            'background-color': '#eeeeef',
            color: '#f1f1f3',
            width: 14,
            height: 14,
            'font-size': 10,
            'font-weight': 700,
            'text-max-width': 220,
          },
        },
        {
          selector: 'node[kind = "emotion"], node[kind = "decision"], node[kind = "outcome"]',
          style: {
            'background-color': '#e11d3f',
            color: '#ffffff',
            width: 12,
            height: 12,
          },
        },
        {
          selector: 'node[kind = "source"]',
          style: {
            'background-color': '#8b8d98',
            color: '#9b9ca3',
            width: 8,
            height: 8,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 0.8,
            'line-color': '#303036',
            opacity: 0.44,
            'curve-style': 'bezier',
          },
        },
        {
          selector: 'edge[kind = "outcome"], edge[kind = "decision"]',
          style: {
            'line-color': '#7a1d2e',
            width: 1.05,
            opacity: 0.72,
          },
        },
        {
          selector: '.selected-memory',
          style: {
            label: 'data(graphLabel)',
            'background-color': '#e11d3f',
            width: 42,
            height: 42,
            'border-color': '#ff6076',
            'border-width': 2,
            color: '#ffffff',
            'font-size': 14,
            'text-max-width': 260,
            'z-index': 20,
          },
        },
        {
          selector: '.labels-hidden',
          style: {
            label: '',
          },
        },
        {
          selector: '.selected-edge',
          style: {
            'line-color': '#e11d3f',
            width: 1.7,
            opacity: 0.95,
            'z-index': 18,
          },
        },
        {
          selector: '.filtered-out, .search-dimmed',
          style: {
            opacity: 0.11,
          },
        },
      ],
      layout: {
        name: 'cose',
        animate: false,
        randomize: false,
        padding: 54,
        nodeRepulsion: 9500,
        idealEdgeLength: 92,
        edgeElasticity: 80,
        numIter: 500,
      },
    });

    cytoscapeMount.setAttribute('data-cytoscape-ready', 'true');
    cytoscapeMount.setAttribute('data-cytoscape-node-count', String(cytoscapeGraph.nodes().length));
    cytoscapeMount.setAttribute('data-cytoscape-edge-count', String(cytoscapeGraph.edges().length));
    shell.setAttribute('data-graph-renderer', 'cytoscape');
    window.__personalMemoryGraph = {
      library: 'cytoscape',
      stats: payload.stats,
      cy: cytoscapeGraph,
    };

    cytoscapeGraph.on('tap', 'node[kind = "memory"]', (event) => {
      const citation = event.target.data('recordId');
      if (citation) selectMemoryByCitation(citation);
    });

    const selected = document.querySelector('[data-control="select-memory"][data-selected="true"]') || memoryNodes[2];
    if (selected) markCytoscapeSelection(selected.getAttribute('data-inspector-citation') || '');
  };

  const setSpacing = (value) => {
    shell.setAttribute('data-spacing', value);
    setInteractionState('spacing-' + value);
    spacingButtons.forEach((button) => {
      const active = button.getAttribute('data-spacing') === value;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  };

  const applyMemorySearch = (query) => {
    const normalized = String(query || '').trim().toLocaleLowerCase();
    let matches = 0;
    memoryNodes.forEach((node) => {
      const searchText = node.getAttribute('data-search-text') || '';
      const match = !normalized || searchText.includes(normalized);
      node.setAttribute('data-search-match', String(match));
      if (match) matches += 1;
    });
    memorySearchResults.forEach((result) => {
      const searchText = result.getAttribute('data-search-text') || '';
      const match = !normalized || searchText.includes(normalized);
      result.setAttribute('data-search-result-active', String(match));
    });
    if (cytoscapeGraph) {
      cytoscapeGraph.nodes('[kind = "memory"]').forEach((cyNode) => {
        const searchText = cyNode.data('searchText') || '';
        const match = !normalized || String(searchText).includes(normalized);
        cyNode.toggleClass('search-dimmed', !match);
      });
    }
    if (memorySearchCount) {
      memorySearchCount.textContent = matches + ' / ' + memoryNodes.length;
      memorySearchCount.setAttribute('data-search-count-value', String(matches));
    }
    shell.setAttribute('data-search-query', normalized);
    setInteractionState(normalized ? 'search-active' : 'search-idle');
  };

  spacingButtons.forEach((button) => {
    button.addEventListener('click', () => setSpacing(button.getAttribute('data-spacing') || 'normal'));
  });

  if (memorySearchInput) {
    memorySearchInput.addEventListener('input', () => {
      applyMemorySearch(memorySearchInput.value);
    });
  }

  memorySearchResults.forEach((result) => {
    result.addEventListener('click', () => {
      const citation = result.getAttribute('data-search-citation') || '';
      const node = memoryNodes.find((item) => item.getAttribute('data-inspector-citation') === citation);
      if (node) {
        selectMemory(node);
        shell.setAttribute('data-search-selected-memory', citation);
        setInteractionState('search-result-selected');
      }
    });
  });

  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const kind = button.getAttribute('data-filter-chip') || '';
      const nextActive = button.getAttribute('aria-pressed') === 'false';
      button.setAttribute('aria-pressed', String(nextActive));
      shell.setAttribute('data-filter-' + kind, nextActive ? 'on' : 'off');
      filterTargets
        .filter((target) => target.getAttribute('data-filter-kind') === kind)
        .forEach((target) => target.setAttribute('data-filter-active', String(nextActive)));
      if (cytoscapeGraph) {
        cytoscapeGraph.elements().forEach((element) => {
          if (element.data('filterKind') === kind) element.toggleClass('filtered-out', !nextActive);
        });
      }
      setInteractionState('filter-' + kind + '-' + (nextActive ? 'on' : 'off'));
    });
  });

  memoryNodes.forEach((node) => {
    node.addEventListener('click', () => selectMemory(node));
    node.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        selectMemory(node);
      }
    });
  });
  if (memoryNodes[2]) selectMemory(memoryNodes[2]);
  initializeCytoscapeGraph();

  if (toggleLabels) {
    toggleLabels.addEventListener('click', () => {
      const hidden = shell.getAttribute('data-labels') === 'hidden';
      shell.setAttribute('data-labels', hidden ? 'visible' : 'hidden');
      toggleLabels.setAttribute('aria-pressed', String(!hidden));
      toggleLabels.textContent = hidden ? '라벨 숨기기' : '라벨 보이기';
      setCytoscapeLabelVisibility(!hidden);
      setInteractionState(hidden ? 'labels-visible' : 'labels-hidden');
    });
  }

  if (rearrange) {
    rearrange.addEventListener('click', () => {
      layoutVersion += 1;
      const nextMode = shell.getAttribute('data-layout-mode') === 'rearranged' ? 'free' : 'rearranged';
      shell.setAttribute('data-layout-mode', nextMode);
      shell.setAttribute('data-layout-version', String(layoutVersion));
      setInteractionState('layout-' + nextMode);
    });
  }

  if (focusSelected) {
    focusSelected.addEventListener('click', () => {
      shell.setAttribute('data-labels', 'visible');
      shell.setAttribute('data-focus-mode', 'selected');
      setSpacing('normal');
      const selected = document.querySelector('[data-control="select-memory"][data-selected="true"]') || memoryNodes[2];
      if (selected) selectMemory(selected);
      document.querySelector('.selected-node-affordance')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
    });
  }

  if (reset) {
    reset.addEventListener('click', () => {
      shell.setAttribute('data-labels', 'visible');
      setCytoscapeLabelVisibility(false);
      if (toggleLabels) {
        toggleLabels.setAttribute('aria-pressed', 'false');
        toggleLabels.textContent = '라벨 숨기기';
      }
      filterButtons.forEach((button) => button.setAttribute('aria-pressed', 'true'));
      filterTargets.forEach((target) => target.setAttribute('data-filter-active', 'true'));
      if (cytoscapeGraph) cytoscapeGraph.elements().removeClass('filtered-out search-dimmed');
      ['semantic', 'reflective', 'procedural', 'episodic', 'thesis', 'source'].forEach((kind) => {
        shell.setAttribute('data-filter-' + kind, 'on');
      });
      shell.setAttribute('data-layout-mode', 'free');
      setSpacing('normal');
      setInteractionState('reset');
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
  <body>${renderAppShellHtml(variant)}<script src="vendor/cytoscape.min.js"></script><script data-graph-control-script="pmi019">${GRAPH_CONTROL_SCRIPT}</script></body>
</html>`;
}
