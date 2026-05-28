import { renderAskMyPastSelfPanel } from './components/AskMyPastSelfPanel';
import { renderDecisionReplayPanel } from './components/DecisionReplayPanel';
import { renderEvidenceDrawer } from './components/EvidenceDrawer';
import { renderMemoryGraph } from './components/MemoryGraph';
import { renderMemoryDetailTimelinePanel } from './components/MemoryDetailTimelinePanel';
import { renderPatternPanel } from './components/PatternPanel';
import { renderPrivacyControlPanel } from './components/PrivacyControlPanel';
import { renderUserFeedbackPanel } from './components/UserFeedbackPanel';
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
    width: 100%;
    min-width: 0;
    border: 1px solid rgba(97, 102, 125, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.66);
    color: #626879;
    padding: 7px 8px;
    text-align: left;
    font-size: 11px;
    line-height: 1.3;
  }
  .memory-search-result span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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
    grid-template-columns: auto auto minmax(0, 1fr) auto;
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
  .save-artifact-action {
    justify-self: start;
    min-height: 30px;
    border: 1px solid rgba(143, 128, 255, 0.24);
    border-radius: 8px;
    background: rgba(143, 128, 255, 0.1);
    color: #6255d7;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 760;
  }
  .save-artifact-action[data-artifact-save-state="saved"] {
    border-color: rgba(69, 140, 96, 0.28);
    background: rgba(69, 140, 96, 0.12);
    color: #3a7a52;
  }
  .user-feedback-panel {
    display: grid;
    gap: 10px;
  }
  .user-feedback-panel label {
    font-size: 11px;
    font-weight: 800;
    color: #8a8f9e;
    text-transform: uppercase;
  }
  .user-feedback-panel textarea {
    min-height: 84px;
    resize: vertical;
    border: 1px solid rgba(97, 102, 125, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    color: #5a5f71;
    padding: 10px;
    font: inherit;
    font-size: 13px;
    line-height: 1.45;
  }
  .feedback-target-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    color: #8a8f9e;
    font-size: 12px;
  }
  .feedback-target-row code {
    max-width: 210px;
    overflow: hidden;
    text-overflow: ellipsis;
    color: #6255d7;
  }
  .feedback-submit-action {
    justify-self: start;
    min-height: 32px;
    border: 1px solid rgba(143, 128, 255, 0.24);
    border-radius: 8px;
    background: rgba(143, 128, 255, 0.1);
    color: #6255d7;
    padding: 7px 10px;
    font-size: 12px;
    font-weight: 760;
  }
  .user-feedback-panel[data-feedback-state="submitted"] .feedback-submit-action {
    border-color: rgba(69, 140, 96, 0.28);
    background: rgba(69, 140, 96, 0.12);
    color: #3a7a52;
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
    grid-template-columns: minmax(260px, 0.78fr) minmax(0, 1.22fr) auto;
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
  .service-flow-steps {
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(5, minmax(86px, 1fr));
    gap: 6px;
  }
  .service-flow-steps li {
    min-width: 0;
    min-height: 62px;
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 8px;
    background: rgba(250, 251, 255, 0.78);
    padding: 8px;
    display: grid;
    align-content: start;
    gap: 4px;
  }
  .service-flow-steps strong {
    color: #52586a;
    font-size: 11px;
    line-height: 1.25;
  }
  .service-flow-steps span {
    color: #81889b;
    font-size: 10px;
    line-height: 1.35;
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
  .related-memory-strip {
    display: grid;
    gap: 7px;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(120, 126, 149, 0.13);
  }
  .related-memory-strip strong {
    color: #626779;
    font-size: 11px;
    letter-spacing: 0.02em;
  }
  .related-memory-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .related-memory-action {
    justify-self: start;
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 999px;
    background: rgba(20, 184, 166, 0.08);
    color: #0f766e;
    padding: 6px 9px;
    font-size: 10px;
    font-weight: 760;
  }
  .related-memory-action.primary {
    border-color: rgba(225, 29, 63, 0.28);
    background: #e11d3f;
    color: #ffffff;
  }
  .related-memory-chip {
    border: 1px solid rgba(97, 102, 125, 0.14);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.76);
    color: #686e81;
    padding: 5px 7px;
    font-size: 10px;
    max-width: 170px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
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
  .memory-timeline-flow,
  .evidence-drawer,
  .analysis-panels {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ask-flow { max-height: 500px; overflow: auto; }
  .weekly-report-flow { max-height: 470px; overflow: auto; }
  .memory-timeline-flow { max-height: 430px; overflow: auto; }
  .evidence-drawer { max-height: 390px; overflow: auto; }
  .ask-flow,
  .decision-replay-flow,
  .weekly-report-flow,
  .memory-timeline-flow,
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
  .result-context-evidence {
    display: grid;
    gap: 4px;
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 8px;
    background: rgba(20, 184, 166, 0.08);
    color: #0f766e;
    padding: 8px 9px;
    font-size: 11px;
    line-height: 1.35;
  }
  .result-context-evidence strong {
    color: #0f766e;
    font-size: 11px;
  }
  .result-context-evidence span {
    overflow-wrap: anywhere;
  }
  .memory-session-panel {
    display: grid;
    gap: 10px;
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 8px;
    background: rgba(240, 253, 250, 0.84);
    padding: 12px;
  }
  .memory-session-panel h3 {
    margin: 0;
    color: #0f766e;
    font-size: 15px;
    line-height: 1.2;
  }
  .memory-session-panel p {
    margin: 0;
    color: #4b635f;
    font-size: 12px;
    line-height: 1.5;
  }
  .memory-session-steps {
    display: grid;
    gap: 7px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .memory-session-steps li {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    border-top: 1px solid rgba(20, 184, 166, 0.16);
    padding-top: 7px;
    color: #0f766e;
    font-size: 11px;
    font-weight: 760;
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
  .local-import-upload,
  .notion-import-direct,
  .import-preview-actions {
    display: grid;
    gap: 8px;
    border-top: 1px solid rgba(117, 122, 143, 0.1);
    padding-top: 10px;
  }
  .capture-prototype label,
  .local-import-upload label,
  .notion-import-direct label {
    color: #8a90a2;
    font-size: 11px;
    font-weight: 780;
  }
  .capture-prototype textarea,
  .local-import-upload textarea,
  .local-import-upload input,
  .notion-import-direct input {
    width: 100%;
    border: 1px solid rgba(117, 122, 143, 0.14);
    border-radius: 8px;
    background: #ffffff;
    color: #555b6e;
    padding: 8px 9px;
    font-size: 12px;
    line-height: 1.45;
  }
  .capture-prototype textarea,
  .local-import-upload textarea {
    min-height: 84px;
    resize: none;
  }
  .local-import-upload input,
  .notion-import-direct input {
    min-height: 34px;
  }
  [data-notion-source-list] {
    display: grid;
    gap: 6px;
  }
  [data-notion-source-list] button {
    display: grid;
    gap: 3px;
    width: 100%;
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    color: #687084;
    padding: 7px;
    text-align: left;
    font-size: 11px;
  }
  [data-notion-source-list] button strong {
    color: #53586a;
    font-size: 12px;
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
  .timeline-list {
    display: grid;
    gap: 8px;
  }
  .timeline-memory-item {
    width: 100%;
    display: grid;
    gap: 5px;
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 8px;
    background: rgba(250, 251, 255, 0.78);
    padding: 10px;
    color: #687084;
    text-align: left;
  }
  .timeline-memory-item[data-timeline-active="true"] {
    border-color: rgba(143, 128, 255, 0.34);
    background: rgba(143, 128, 255, 0.08);
  }
  .memory-review-panel [data-control="memory-review-mode"][aria-pressed="true"] {
    border-color: rgba(143, 128, 255, 0.34);
    background: rgba(143, 128, 255, 0.12);
    color: #6255d7;
    font-weight: 800;
  }
  .memory-review-panel [data-memory-review-section] {
    display: none;
    gap: 8px;
  }
  .memory-review-panel[data-memory-review-mode="review"] [data-memory-review-section="review"],
  .memory-review-panel[data-memory-review-mode="history"] [data-memory-review-section="history"],
  .memory-review-panel[data-memory-review-mode="provenance"] [data-memory-review-section="provenance"] {
    display: grid;
  }
  .memory-review-panel [data-control="save-memory-edit"],
  .memory-review-panel [data-control="export-memory-provenance"],
  .memory-review-panel [data-control="download-memory-provenance"] {
    min-height: 34px;
    border: 1px solid rgba(143, 128, 255, 0.24);
    border-radius: 8px;
    background: rgba(143, 128, 255, 0.1);
    color: #6255d7;
    font-size: 12px;
    font-weight: 760;
  }
  .memory-review-history-list {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .memory-review-history-list li {
    display: grid;
    gap: 7px;
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 8px;
    background: rgba(250, 251, 255, 0.78);
    padding: 9px;
  }
  .memory-review-history-list li[data-review-comparison-active="true"] {
    border-color: rgba(143, 128, 255, 0.34);
    background: rgba(143, 128, 255, 0.08);
  }
  .memory-review-history-list button {
    display: grid;
    gap: 3px;
    width: 100%;
    border: 0;
    background: transparent;
    color: inherit;
    padding: 0;
    text-align: left;
  }
  .memory-review-history-list button span {
    color: #73798c;
    font-size: 11px;
  }
  .memory-review-history-list button strong {
    color: #53586a;
    font-size: 12px;
  }
  .memory-review-field-list {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .memory-review-field-list span {
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 999px;
    padding: 4px 6px;
    color: #7a728d;
    background: rgba(255,255,255,0.6);
    font-size: 10px;
  }
  .timeline-memory-item strong {
    color: #53586a;
    font-size: 12px;
    line-height: 1.35;
  }
  .timeline-date,
  .timeline-source,
  .timeline-excerpt {
    color: #73798c;
    font-size: 11px;
    line-height: 1.45;
  }
  .timeline-facets {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
  }
  .timeline-facets span {
    border: 1px solid rgba(117, 122, 143, 0.12);
    border-radius: 999px;
    padding: 4px 6px;
    color: #7a728d;
    background: rgba(255,255,255,0.6);
    font-size: 10px;
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
  .benchmark-signin-cta {
    color: #b9b9bd;
    font-size: 12px;
    font-weight: 760;
    white-space: nowrap;
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
    top: 82px;
    left: 28px;
    width: min(980px, calc(100% - 494px));
    padding: 10px;
    margin: 0;
    border: 1px solid rgba(255, 255, 255, 0.09);
    background: rgba(14, 14, 15, 0.82);
    box-shadow: 0 18px 44px rgba(0, 0, 0, 0.24);
    backdrop-filter: blur(12px);
    grid-template-columns: minmax(210px, 0.74fr) minmax(0, 1.26fr);
    z-index: 5;
  }
  .product-value-strip h2 {
    color: #f2f2f4;
    font-size: 15px;
  }
  .product-value-strip p {
    color: #aaaab1;
    font-size: 11px;
  }
  .product-value-strip .privacy-actions {
    grid-column: 1 / -1;
    justify-content: flex-start;
  }
  .product-value-strip .privacy-actions span,
  .service-flow-steps li {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
  }
  .service-flow-steps strong {
    color: #f0f0f2;
  }
  .service-flow-steps span {
    color: #a7a7ad;
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
  .second-brain-shell[data-layout-mode="constellation"] .graph-workspace {
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
    z-index: 6;
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
    content: attr(data-benchmark-drawer-tab);
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
  .timeline-memory-item,
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
  .timeline-memory-item[data-timeline-active="true"] {
    border-color: rgba(214, 31, 60, 0.44);
    background: rgba(214, 31, 60, 0.1);
  }
  .memory-review-history-list li {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.04);
    color: #c3c3c8;
  }
  .memory-review-history-list li[data-review-comparison-active="true"] {
    border-color: rgba(214, 31, 60, 0.44);
    background: rgba(214, 31, 60, 0.1);
  }
  .memory-review-panel [data-control="memory-review-mode"][aria-pressed="true"] {
    border-color: rgba(214, 31, 60, 0.44);
    background: rgba(214, 31, 60, 0.12);
    color: #ececef;
  }
  .memory-review-panel [data-control="save-memory-edit"],
  .memory-review-panel [data-control="export-memory-provenance"],
  .memory-review-panel [data-control="download-memory-provenance"] {
    border-color: rgba(214, 31, 60, 0.34);
    background: rgba(214, 31, 60, 0.1);
    color: #ececef;
  }
  .memory-review-history-list button span {
    color: #b0b0b6;
  }
  .memory-review-history-list button strong {
    color: #ececef;
  }
  .memory-review-field-list span {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
    color: #d0d0d4;
  }
  .timeline-memory-item strong {
    color: #ececef;
  }
  .timeline-date,
  .timeline-source,
  .timeline-excerpt {
    color: #b0b0b6;
  }
  .timeline-facets span {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
    color: #d0d0d4;
  }
  .ask-question-row input,
  .decision-current-card input,
  .capture-prototype textarea,
  .local-import-upload textarea,
  .local-import-upload input,
  .notion-import-direct input {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.055);
    color: #f0f0f2;
  }
  .save-artifact-action {
    border-color: rgba(214, 31, 60, 0.32);
    background: rgba(214, 31, 60, 0.11);
    color: #ff8797;
  }
  .save-artifact-action[data-artifact-save-state="saved"] {
    border-color: rgba(69, 140, 96, 0.38);
    background: rgba(69, 140, 96, 0.13);
    color: #85d09e;
  }
  .user-feedback-panel textarea {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.055);
    color: #f0f0f2;
  }
  .feedback-submit-action {
    border-color: rgba(214, 31, 60, 0.32);
    background: rgba(214, 31, 60, 0.11);
    color: #ff8797;
  }
  [data-notion-source-list] button {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
    color: #d0d0d4;
  }
  [data-notion-source-list] button strong {
    color: #ececef;
  }
  .user-feedback-panel[data-feedback-state="submitted"] .feedback-submit-action {
    border-color: rgba(69, 140, 96, 0.38);
    background: rgba(69, 140, 96, 0.13);
    color: #85d09e;
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
    .benchmark-signin-cta { display: none; }
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

function renderSavedArtifactPayload(layout: ReturnType<typeof buildInitialAppShellEvidenceLayout>): string {
  const payload = {
    actions: layout.savedArtifactActions.map((action) => ({
      id: action.id,
      kind: action.kind,
      endpoint: action.endpoint,
      method: action.method,
      futureMemoryId: action.futureMemoryId,
      artifact: action.artifact,
    })),
  };
  return `<script type="application/json" id="saved-artifact-actions">${escapeJsonScript(JSON.stringify(payload))}</script>`;
}

export function renderAppShellHtml(variant: RenderVariant = 'full'): string {
  const layout = buildInitialAppShellEvidenceLayout();
  const memoryGraph = buildMemoryGraphModel(layout.records);
  const graphNodeCount = memoryGraph.stats.graphNodeCount;
  const graphEdgeCount = memoryGraph.stats.edgeCount;
  const memoryNodeCount = memoryGraph.stats.memoryNodeCount;
  const renderedMemoryNodeCount = memoryGraph.stats.renderedMemoryNodeCount;
  const citationLinks = layout.ask.citationMemoryIds
    .slice(0, 3)
    .map((citationId) => `<a href="#evidence-${escapeHtml(citationId)}" class="citation-ref" data-citation-ref="${escapeHtml(citationId)}">[${escapeHtml(citationId)}]</a>`)
    .join('');

  if (variant === 'plain' || variant === 'topbar-only' || variant === 'debug-text') {
    return `<main class="second-brain-shell"><aside class="brain-sidebar"><section class="brain-title"><p class="eyebrow">지식 그래프</p><h1>Second Brain</h1><p>${escapeHtml(layout.northStar)}</p></section></aside></main>`;
  }

  return `<main class="second-brain-shell" data-labels="visible" data-spacing="normal" data-layout-mode="free" data-layout-explainer="Free mode keeps the graph organic for open-ended memory exploration." data-layout-version="0" data-filter-semantic="on" data-filter-reflective="on" data-filter-procedural="on" data-filter-episodic="on" data-filter-thesis="on" data-filter-source="on" data-graph-renderer="cytoscape-pending" data-benchmark-reference="https://www.careerhackeralex.com/memory" data-memory-node-count="${memoryNodeCount}" data-rendered-memory-node-count="${renderedMemoryNodeCount}" data-graph-node-count="${graphNodeCount}" data-graph-edge-count="${graphEdgeCount}" data-surface-mode="graph-first" data-rail-mode="collapsed-evidence-drawer" data-first-screen-contract="benchmark-graph-dominant" data-panel-visibility="secondary-drawer" data-interaction-contract="filter-select-space-rearrange">
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
        <span><strong data-live-count="memory-nodes">${memoryNodeCount}</strong> memories</span>
        <span class="graph-meta-dot">·</span>
        <span><strong data-live-count="rendered-memory-nodes">${renderedMemoryNodeCount}</strong> rendered</span>
        <span class="graph-meta-dot">·</span>
        <span><strong data-live-count="graph-nodes">${graphNodeCount}</strong> graph nodes</span>
        <span class="graph-meta-dot">·</span>
        <span><strong data-live-count="graph-edges">${graphEdgeCount}</strong> edges</span>
        <span class="graph-meta-dot">·</span>
        <span>last woven from diary + imports</span>
      </div>

      <section class="memory-search-control" aria-label="Memory search" data-memory-search-endpoint="/api/memory/search">
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
          <button type="button" class="layout-button active" data-layout-choice="free" aria-pressed="true">Free</button>
          <button type="button" class="layout-button" data-layout-choice="constellation" aria-pressed="false">Constellation</button>
          <button type="button" class="layout-button" data-layout-choice="hierarchy" aria-pressed="false">Hierarchy</button>
          <button type="button" class="layout-button" data-layout-choice="timeline" aria-pressed="false">Timeline</button>
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
      <form class="ask-memory-bar" aria-label="Ask Second Brain" data-ask-endpoint="/api/ask">
        <span class="ask-lock" aria-hidden="true">⌘</span>
        <span class="benchmark-signin-cta" data-auth-cta="private-second-brain">Sign in to ask the Second Brain</span>
        <input id="ask-memory-bar-question" name="question" value="${escapeHtml(layout.askQuestion)}" aria-label="Ask My Past Self question" />
        <button class="ask-submit" type="submit" aria-label="Ask" data-control="ask-second-brain">→</button>
      </form>

      <section class="product-value-strip" aria-label="Private memory product value">
        <div>
          <p class="eyebrow">Private Personal Memory AI</p>
          <h2>나보다 나를 더 잘 아는 개인 기억 AI</h2>
          <p>앱에서 쓴 일기와 가져온 기록이 개인 기억 그래프로 연결된다. 공유는 공개가 아니라, 현재 일기와 과거 기억이 같은 맥락 안에서 함께 떠오른다는 뜻이다.</p>
        </div>
        <ol class="service-flow-steps" aria-label="Diary to Second Brain service flow" data-service-flow="diary-to-second-brain" data-service-flow-primary-entry="app-or-web-diary" data-service-flow-graph-source="actual-memory-records">
          <li data-service-flow-step="quick-diary-capture"><strong>앱에서 빠르게 기록</strong><span>모바일/PWA 일기 캡처</span></li>
          <li data-service-flow-step="diary-database-load"><strong>웹에서 전체 일기 불러오기</strong><span>습관리스트/일기 DB만 선택</span></li>
          <li data-service-flow-step="second-brain-graph"><strong>세컨브레인 그래프 생성</strong><span>실제 MemoryRecord 기반</span></li>
          <li data-service-flow-step="related-memory-nodes"><strong>연관된 과거 기억 노드 표시</strong><span>감정·결정·결과 엣지</span></li>
          <li data-service-flow-step="ask-report"><strong>Ask와 Weekly Report로 해결</strong><span>인용 근거가 있을 때만 답변</span></li>
        </ol>
        <div class="privacy-actions" aria-label="Privacy and control actions">
          <span>비공개 기본값</span>
          <span>로컬 프로토타입</span>
          <span>내보내기</span>
          <span>삭제</span>
        </div>
      </section>

      <div class="product-main-grid">
        <div class="graph-stage">
          <div id="memory-graph-cytoscape" class="cytoscape-memory-graph" data-graph-library="cytoscape" data-memory-node-count="${memoryNodeCount}" data-rendered-memory-node-count="${renderedMemoryNodeCount}" data-graph-node-count="${graphNodeCount}" data-graph-edge-count="${graphEdgeCount}" aria-label="Cytoscape data-driven personal memory graph"></div>
          ${renderMemoryGraphPayload(memoryGraph)}
          ${renderSavedArtifactPayload(layout)}
          ${variant === 'no-svg' ? '' : renderMemoryGraph(layout)}
          <aside class="wiki-compiler-strip" aria-label="LLM Wiki compiler preview" data-wiki-compiler="pmi017">
            <span><strong data-live-count="wiki-atoms">${layout.compiledWiki.atomCount}</strong> canonical memory atoms</span>
            <span><strong data-live-count="wiki-nodes">${layout.compiledWiki.nodeCount}</strong> compiled wiki nodes</span>
            <span><strong data-live-count="wiki-citations">${layout.compiledWiki.citationCount}</strong> citations</span>
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
            <div class="related-memory-strip" data-related-memory-strip="selected-node" data-related-memory-count="0">
              <strong>연관된 과거 기억</strong>
              <div class="related-memory-list" data-related-memory-list></div>
              <button type="button" class="related-memory-action" data-control="ask-with-related-memory-context">이 맥락으로 Ask</button>
              <button type="button" class="related-memory-action" data-control="replay-with-related-memory-context">이 맥락으로 Decision</button>
              <button type="button" class="related-memory-action" data-control="report-with-related-memory-context">이 맥락으로 Weekly</button>
              <button type="button" class="related-memory-action primary" data-control="run-memory-session">Run Memory Session</button>
            </div>
            <div class="citation-row" aria-label="Ask My Past Self citations" data-inspector-citations>${citationLinks}</div>
          </article>
        </div>

        <aside class="product-rail" aria-label="Cited memory product rail" data-rail-mode="collapsed-evidence-drawer" data-benchmark-drawer-tab="evidence-reports">
          <section class="memory-session-panel" aria-label="Guided Memory Session" data-memory-session-panel data-session-state="idle" data-session-source-memory="" data-session-related-memory-count="0">
            <div>
              <p class="eyebrow">Guided Memory Session</p>
              <h3>선택한 기억 하나로 Ask · Decision · Weekly를 이어서 실행</h3>
            </div>
            <p data-memory-session-summary>그래프에서 기억을 선택하면 관련 과거 기억을 같은 맥락으로 묶어 세 가지 AI 작업을 한 번에 실행한다.</p>
            <ol class="memory-session-steps" aria-label="Guided memory session steps">
              <li data-memory-session-step="ask" data-session-step-state="idle"><span>Ask</span><strong>idle</strong></li>
              <li data-memory-session-step="replay" data-session-step-state="idle"><span>Decision Replay</span><strong>idle</strong></li>
              <li data-memory-session-step="weekly" data-session-step-state="idle"><span>Weekly Report</span><strong>idle</strong></li>
            </ol>
          </section>
          ${renderAskMyPastSelfPanel(layout)}
          ${renderPrivacyControlPanel(layout)}
          ${renderUserFeedbackPanel(layout)}
          ${renderWeeklyReportPanel(layout)}
          ${renderMemoryDetailTimelinePanel(layout)}
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
  const layoutButtons = Array.from(document.querySelectorAll('[data-layout-choice]'));
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
  const relatedMemoryStrip = inspector?.querySelector('[data-related-memory-strip]');
  const relatedMemoryList = inspector?.querySelector('[data-related-memory-list]');
  const askWithRelatedMemoryButton = inspector?.querySelector('[data-control="ask-with-related-memory-context"]');
  const replayWithRelatedMemoryButton = inspector?.querySelector('[data-control="replay-with-related-memory-context"]');
  const reportWithRelatedMemoryButton = inspector?.querySelector('[data-control="report-with-related-memory-context"]');
  const runMemorySessionButton = inspector?.querySelector('[data-control="run-memory-session"]');
  const askForm = document.querySelector('[data-ask-endpoint]');
  const askEndpoint = askForm?.getAttribute('data-ask-endpoint') || '';
  const askQuestionInput = askForm?.querySelector('input[name="question"]');
  const askSubmit = document.querySelector('[data-control="ask-second-brain"]');
  const askResult = document.querySelector('.ask-answer-cited');
  const askSaveButton = document.querySelector('[data-save-artifact-action="ask_answer"]');
  const handoffMemoryId = new URLSearchParams(window.location.search).get('memory');
  const citationRefs = Array.from(document.querySelectorAll('[data-citation-ref]'));
  const memoryEdges = Array.from(document.querySelectorAll('.obsidian-spoke-edge[data-edge-from][data-edge-to]'));
  const filterTargets = Array.from(document.querySelectorAll('[data-filter-kind]'));
  const memorySearchInput = document.querySelector('[data-control="memory-search"]');
  const memorySearchCount = document.querySelector('[data-search-count]');
  const memorySearchContainer = document.querySelector('[data-search-results="memory"]');
  const memorySearchEndpoint = document.querySelector('[data-memory-search-endpoint]')?.getAttribute('data-memory-search-endpoint') || '';
  let memorySearchResults = Array.from(document.querySelectorAll('[data-search-result="memory"]'));
  const timelinePanel = document.querySelector('[data-memory-timeline-panel="pmi025"]');
  const timelineItems = Array.from(document.querySelectorAll('[data-control="timeline-select-memory"]'));
  const saveArtifactButtons = Array.from(document.querySelectorAll('[data-control="save-artifact"]'));
  const feedbackPanel = document.querySelector('[data-feedback-panel="user-correction"]');
  const feedbackSubmit = document.querySelector('[data-control="submit-feedback-correction"]');
  const feedbackText = document.querySelector('[data-control="feedback-correction-text"]');
  const importUploadPanel = document.querySelector('[data-import-upload-panel="local-file"]');
  const importFileInput = document.querySelector('[data-control="local-import-file-input"]');
  const importPasteText = document.querySelector('[data-control="local-import-paste-text"]');
  const importPreviewButton = document.querySelector('[data-control="preview-local-import"]');
  const importApplyButton = document.querySelector('[data-control="apply-local-import"]');
  const importUndoButton = document.querySelector('[data-control="undo-local-import"]');
  const importUploadSummary = document.querySelector('[data-import-upload-summary]');
  const importUploadPreviewList = document.querySelector('[data-import-upload-preview-list]');
  const notionImportPanel = document.querySelector('[data-notion-import-panel="database"]');
  const notionDatabaseId = document.querySelector('[data-control="notion-database-id"]');
  const notionSourcesButton = document.querySelector('[data-control="list-notion-sources"]');
  const notionImportPreviewButton = document.querySelector('[data-control="preview-notion-import"]');
  const notionImportSummary = document.querySelector('[data-notion-import-summary]');
  const notionSourceList = document.querySelector('[data-notion-source-list]');
  const privacyControlPanel = document.querySelector('[data-privacy-scope="private"]');
  const importAppliedFeedback = document.querySelector('[data-import-applied-feedback="local-upload"]');
  const importAppliedMemoryList = document.querySelector('[data-import-applied-memory-list]');
  const searchCount = document.querySelector('[data-search-count]');
  const liveCountTargets = {
    memoryNodes: document.querySelector('[data-live-count="memory-nodes"]'),
    renderedMemoryNodes: document.querySelector('[data-live-count="rendered-memory-nodes"]'),
    graphNodes: document.querySelector('[data-live-count="graph-nodes"]'),
    graphEdges: document.querySelector('[data-live-count="graph-edges"]'),
    wikiAtoms: document.querySelector('[data-live-count="wiki-atoms"]'),
    wikiNodes: document.querySelector('[data-live-count="wiki-nodes"]'),
    wikiCitations: document.querySelector('[data-live-count="wiki-citations"]'),
  };
  const memoryReviewPanel = document.querySelector('[data-memory-review-panel="source-edit"]');
  const memoryEditSummary = document.querySelector('[data-control="memory-edit-summary"]');
  const memoryEditRawText = document.querySelector('[data-control="memory-edit-raw-text"]');
  const saveMemoryEdit = document.querySelector('[data-control="save-memory-edit"]');
  const memoryReviewModeButtons = Array.from(document.querySelectorAll('[data-control="memory-review-mode"]'));
  const exportMemoryProvenance = document.querySelector('[data-control="export-memory-provenance"]');
  const downloadMemoryProvenanceButton = document.querySelector('[data-control="download-memory-provenance"]');
  const cytoscapeMount = document.querySelector('[data-graph-library="cytoscape"]');
  const graphPayloadScript = document.querySelector('#memory-graph-elements');
  const savedArtifactPayloadScript = document.querySelector('#saved-artifact-actions');
  const decisionReplayPanel = document.querySelector('[data-replay-endpoint]');
  const decisionReplayInput = document.querySelector('[data-control="decision-replay-current"]');
  const decisionReplayButton = document.querySelector('[data-control="run-decision-replay"]');
  const decisionReplayResult = document.querySelector('[data-live-replay-result="recommendation"]');
  const weeklyReportPanel = document.querySelector('[data-weekly-report-endpoint]');
  const weeklyReportRefreshButton = document.querySelector('[data-control="refresh-weekly-report"]');
  const weeklyReportSummary = document.querySelector('[data-live-weekly-result="summary"]');
  const memorySessionPanel = document.querySelector('[data-memory-session-panel]');
  const memorySessionSummary = document.querySelector('[data-memory-session-summary]');
  let cytoscapeGraph = null;
  let layoutVersion = Number(shell.getAttribute('data-layout-version') || '0');
  let lastLocalImportPreview = null;
  let lastLocalImportUndoAction = null;
  let lastAskFollowUpContext = null;
  let lastReplayRelatedContext = null;
  let lastWeeklyRelatedContext = null;

  const setInteractionState = (value) => {
    shell.setAttribute('data-interaction-state', value);
  };

  const setMemoryReviewMode = (mode) => {
    if (!memoryReviewPanel || !mode) return;
    memoryReviewPanel.setAttribute('data-memory-review-mode', mode);
    memoryReviewModeButtons.forEach((button) => {
      const active = button.getAttribute('data-review-mode-target') === mode;
      button.setAttribute('aria-pressed', String(active));
    });
    setInteractionState('memory-review-mode-' + mode);
  };

  const escapeText = (value) =>
    String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const savedArtifactPayload = (() => {
    try {
      return JSON.parse(savedArtifactPayloadScript?.textContent || '{"actions":[]}');
    } catch {
      return { actions: [] };
    }
  })();

  const savedArtifactsById = new Map(
    (savedArtifactPayload.actions || []).map((action) => [action.artifact?.id, action]),
  );

  const findMemoryNodeByCitation = (citation) =>
    memoryNodes.find((item) => item.getAttribute('data-inspector-citation') === citation);

  const updateTimelineSelection = (citation) => {
    if (!citation) return;
    shell.setAttribute('data-timeline-active-memory', citation);
    if (timelinePanel) timelinePanel.setAttribute('data-timeline-active-memory', citation);
    timelineItems.forEach((item) => {
      item.setAttribute('data-timeline-active', String(item.getAttribute('data-timeline-memory-id') === citation));
    });
  };

  const updateMemoryReviewSelection = (citation, title, body, source) => {
    if (!memoryReviewPanel || !citation) return;
    memoryReviewPanel.setAttribute('data-memory-review-selected-id', citation);
    memoryReviewPanel.setAttribute('data-memory-review-state', 'ready');
    setMemoryReviewMode('review');
    if (memoryEditSummary) memoryEditSummary.value = title || '';
    if (memoryEditRawText) memoryEditRawText.value = body || '';
    const sourceLabel = memoryReviewPanel.querySelector('.panel-topline span');
    if (sourceLabel && source) sourceLabel.textContent = source;
  };

  const reviewChangedFieldLabel = (field) => {
    if (field === 'rawText') return 'raw text';
    if (field === 'observedAt') return 'observed date';
    if (field === 'emotionTags') return 'emotion tags';
    if (field === 'topicTags') return 'topic tags';
    if (field === 'projectTags') return 'project tags';
    if (field === 'peopleTags') return 'people tags';
    return field || 'review';
  };

  const selectReviewComparison = (comparisonId) => {
    if (!memoryReviewPanel || !comparisonId) return;
    const comparisonCards = Array.from(memoryReviewPanel.querySelectorAll('[data-memory-review-comparison]'));
    comparisonCards.forEach((card) => {
      card.setAttribute('data-review-comparison-active', String(card.getAttribute('data-memory-review-comparison') === comparisonId));
    });
    memoryReviewPanel.setAttribute('data-active-review-comparison', comparisonId);
    setInteractionState('memory-review-comparison-selected');
  };

  const wireReviewComparisonButtons = (root = memoryReviewPanel) => {
    if (!root) return;
    Array.from(root.querySelectorAll('[data-control="select-review-comparison"]')).forEach((button) => {
      if (button.getAttribute('data-review-comparison-wired') === 'true') return;
      button.setAttribute('data-review-comparison-wired', 'true');
      button.addEventListener('click', () => {
        selectReviewComparison(button.getAttribute('data-review-comparison-id') || '');
      });
    });
  };

  const renderMemoryReviewComparison = (entry) => {
    if (!entry?.id) return '';
    const changedFieldLabels = Array.isArray(entry.changedFields) ? entry.changedFields.map(reviewChangedFieldLabel) : [];
    const deltaLabel = changedFieldLabels.length ? changedFieldLabels.join(', ') + ' changed' : 'no field changes';
    return (
      '<li data-memory-review-history-entry="' +
      escapeText(entry.id) +
      '" data-memory-review-comparison="' +
      escapeText(entry.id) +
      '" data-review-comparison-active="false"><button type="button" data-control="select-review-comparison" data-review-comparison-id="' +
      escapeText(entry.id) +
      '"><span>' +
      escapeText(entry.reviewedAt || new Date().toISOString()) +
      '</span><strong>' +
      escapeText(deltaLabel) +
      '</strong></button><div class="memory-review-field-list">' +
      changedFieldLabels.map((field) => '<span data-review-changed-field="' + escapeText(field) + '">' + escapeText(field) + '</span>').join('') +
      '</div><p data-review-before-summary="' +
      escapeText(entry.beforeSummary || '') +
      '">' +
      escapeText(entry.beforeSummary || '') +
      '</p><p data-review-after-summary="' +
      escapeText(entry.afterSummary || '') +
      '">' +
      escapeText(entry.afterSummary || '') +
      '</p><code>' +
      escapeText(entry.sourceRef || '') +
      '</code></li>'
    );
  };

  const appendMemoryReviewComparison = (entry) => {
    if (!memoryReviewPanel || !entry?.id) return;
    let list = memoryReviewPanel.querySelector('.memory-review-history-list');
    const emptyState = memoryReviewPanel.querySelector('[data-memory-review-history-state="empty"]');
    if (!list) {
      list = document.createElement('ol');
      list.className = 'memory-review-history-list';
      list.setAttribute('data-memory-review-history-state', 'ready');
      emptyState?.replaceWith(list);
    }
    list.insertAdjacentHTML('afterbegin', renderMemoryReviewComparison(entry));
    const currentCount = Number(memoryReviewPanel.getAttribute('data-memory-review-history-count') || '0') + 1;
    memoryReviewPanel.setAttribute('data-memory-review-history-count', String(currentCount));
    memoryReviewPanel.setAttribute('data-memory-review-history-state', 'ready');
    wireReviewComparisonButtons(list);
    selectReviewComparison(entry.id);
    setMemoryReviewMode('history');
  };

  const currentProvenancePayload = () => ({
    memoryId: memoryReviewPanel?.getAttribute('data-memory-review-selected-id') || '',
    exportedAt: new Date().toISOString(),
  });

  const fetchMemoryProvenanceExport = async () => {
    if (!memoryReviewPanel) return null;
    const endpoint = memoryReviewPanel.getAttribute('data-memory-provenance-export-endpoint') || '';
    const payload = currentProvenancePayload();
    if (!endpoint || !payload.memoryId) return null;
    memoryReviewPanel.setAttribute('data-memory-provenance-export-state', 'loading');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('memory provenance export failed with ' + response.status);
      const body = await response.json().catch(() => ({}));
      const exportBundle = body?.export || body;
      memoryReviewPanel.setAttribute('data-memory-provenance-export-state', 'ready');
      memoryReviewPanel.setAttribute('data-memory-provenance-export-memory-id', exportBundle?.memory?.id || payload.memoryId);
      memoryReviewPanel.setAttribute('data-memory-provenance-export-review-count', String(exportBundle?.reviewHistory?.length || 0));
      memoryReviewPanel.setAttribute('data-memory-provenance-export-related-count', String(exportBundle?.relatedMemoryIds?.length || 0));
      shell.setAttribute('data-last-provenance-export-memory', exportBundle?.memory?.id || payload.memoryId);
      setInteractionState('memory-provenance-exported');
      return exportBundle;
    } catch (error) {
      memoryReviewPanel.setAttribute('data-memory-provenance-export-state', 'error');
      shell.setAttribute('data-memory-provenance-export-error', String(error?.message || error));
      setInteractionState('memory-provenance-export-error');
      return null;
    }
  };

  const downloadMemoryProvenance = async () => {
    if (!memoryReviewPanel) return;
    const endpoint = memoryReviewPanel.getAttribute('data-memory-provenance-download-endpoint') || '';
    const payload = currentProvenancePayload();
    if (!endpoint || !payload.memoryId) return;
    memoryReviewPanel.setAttribute('data-memory-provenance-download-state', 'loading');
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('memory provenance download failed with ' + response.status);
      const filename =
        response.headers.get('content-disposition')?.match(/filename="([^"]+)"/)?.[1] ||
        memoryReviewPanel.getAttribute('data-memory-provenance-download-filename') ||
        'memory-provenance.json';
      const bodyText = await response.text();
      const blobUrl = URL.createObjectURL(new Blob([bodyText], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      link.setAttribute('data-generated-provenance-download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
      memoryReviewPanel.setAttribute('data-memory-provenance-download-state', 'ready');
      memoryReviewPanel.setAttribute('data-memory-provenance-download-filename', filename);
      shell.setAttribute('data-last-provenance-download-filename', filename);
      setInteractionState('memory-provenance-downloaded');
    } catch (error) {
      memoryReviewPanel.setAttribute('data-memory-provenance-download-state', 'error');
      shell.setAttribute('data-memory-provenance-download-error', String(error?.message || error));
      setInteractionState('memory-provenance-download-error');
    }
  };

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

  const renderRelatedMemoryEvidence = (citation) => {
    if (!relatedMemoryStrip || !relatedMemoryList || !cytoscapeGraph || !citation) return;
    cytoscapeGraph.elements().removeClass('related-memory related-facet related-edge');
    const selectedNode = cytoscapeGraph.getElementById('memory:' + citation);
    if (!selectedNode || !selectedNode.length) return;
    const related = [];
    const seen = new Set();
    let highlightedEdgeCount = 0;
    selectedNode.connectedEdges().forEach((edge) => {
      const facetNode = edge.connectedNodes().not(selectedNode).first();
      if (!facetNode || !facetNode.length) return;
      facetNode.connectedEdges().forEach((facetEdge) => {
        const candidate = facetEdge.connectedNodes('[kind = "memory"]').first();
        const candidateId = candidate?.data('recordId');
        if (!candidateId || candidateId === citation || seen.has(candidateId)) return;
        seen.add(candidateId);
        related.push({
          id: candidateId,
          label: candidate.data('graphLabel') || candidate.data('label') || candidateId,
          reason: facetNode.data('label') || facetNode.data('graphLabel') || facetNode.data('kind') || 'shared edge',
        });
        candidate.addClass('related-memory');
        facetNode.addClass('related-facet');
        edge.addClass('related-edge');
        facetEdge.addClass('related-edge');
        highlightedEdgeCount += 2;
      });
    });
    relatedMemoryList.replaceChildren();
    related.slice(0, 6).forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'related-memory-chip';
      chip.setAttribute('data-related-memory-id', item.id);
      chip.setAttribute('data-related-memory-reason', item.reason);
      chip.textContent = item.label;
      chip.addEventListener('click', () => selectMemoryByCitation(item.id));
      relatedMemoryList.append(chip);
    });
    relatedMemoryStrip.setAttribute('data-related-memory-count', String(related.length));
    shell.setAttribute('data-related-memory-source', citation);
    shell.setAttribute('data-related-memory-count', String(related.length));
    shell.setAttribute('data-related-memory-highlighted-edge-count', String(highlightedEdgeCount));
  };

  const askWithRelatedMemoryContext = () => {
    const sourceMemoryId = shell.getAttribute('data-active-memory') || '';
    const relatedMemoryIds = Array.from(relatedMemoryList?.querySelectorAll('[data-related-memory-id]') || [])
      .map((item) => item.getAttribute('data-related-memory-id') || '')
      .filter(Boolean);
    if (!sourceMemoryId || !relatedMemoryIds.length) return;
    if (askQuestionInput) {
      askQuestionInput.value = '이 기억과 연관된 과거 기억들을 근거로 지금 내가 무엇을 반복하고 있는지 알려줘';
      askQuestionInput.focus();
    }
    lastAskFollowUpContext = {
      previousQuestion: 'selected-memory-related-context',
      previousCitationMemoryIds: [sourceMemoryId, ...relatedMemoryIds],
    };
    shell.setAttribute('data-ask-context-source-memory', sourceMemoryId);
    shell.setAttribute('data-ask-context-related-memory-count', String(relatedMemoryIds.length));
    shell.setAttribute('data-ask-context-related-memories', relatedMemoryIds.join(','));
    setInteractionState('ask-context-seeded-from-related-memories');
  };

  const replayWithRelatedMemoryContext = () => {
    const sourceMemoryId = shell.getAttribute('data-active-memory') || '';
    const relatedMemoryIds = Array.from(relatedMemoryList?.querySelectorAll('[data-related-memory-id]') || [])
      .map((item) => item.getAttribute('data-related-memory-id') || '')
      .filter(Boolean);
    if (!sourceMemoryId || !relatedMemoryIds.length) return;
    if (decisionReplayInput) {
      decisionReplayInput.value = '이 기억과 관련된 과거 선택들을 기준으로 지금 결정을 반복해도 되는지 비교해줘';
      decisionReplayInput.focus();
    }
    lastReplayRelatedContext = {
      sourceMemoryId,
      relatedMemoryIds,
    };
    shell.setAttribute('data-replay-context-source-memory', sourceMemoryId);
    shell.setAttribute('data-replay-context-related-memory-count', String(relatedMemoryIds.length));
    shell.setAttribute('data-replay-context-related-memories', relatedMemoryIds.join(','));
    setInteractionState('replay-context-seeded-from-related-memories');
  };

  const reportWithRelatedMemoryContext = () => {
    const sourceMemoryId = shell.getAttribute('data-active-memory') || '';
    const relatedMemoryIds = Array.from(relatedMemoryList?.querySelectorAll('[data-related-memory-id]') || [])
      .map((item) => item.getAttribute('data-related-memory-id') || '')
      .filter(Boolean);
    if (!sourceMemoryId || !relatedMemoryIds.length) return;
    lastWeeklyRelatedContext = {
      sourceMemoryId,
      relatedMemoryIds,
    };
    weeklyReportPanel?.setAttribute('data-weekly-report-context', 'related-memories');
    weeklyReportPanel?.setAttribute('data-weekly-context-source-memory', sourceMemoryId);
    weeklyReportPanel?.setAttribute('data-weekly-context-related-memory-count', String(relatedMemoryIds.length));
    shell.setAttribute('data-weekly-context-source-memory', sourceMemoryId);
    shell.setAttribute('data-weekly-context-related-memory-count', String(relatedMemoryIds.length));
    shell.setAttribute('data-weekly-context-related-memories', relatedMemoryIds.join(','));
    setInteractionState('weekly-context-seeded-from-related-memories');
  };

  const getSelectedRelatedMemoryContext = () => {
    const sourceMemoryId = shell.getAttribute('data-active-memory') || '';
    const relatedMemoryIds = Array.from(relatedMemoryList?.querySelectorAll('[data-related-memory-id]') || [])
      .map((item) => item.getAttribute('data-related-memory-id') || '')
      .filter(Boolean);
    if (!sourceMemoryId || !relatedMemoryIds.length) return null;
    return { sourceMemoryId, relatedMemoryIds };
  };

  const setMemorySessionStep = (step, state) => {
    const item = memorySessionPanel?.querySelector('[data-memory-session-step="' + step + '"]');
    if (!item) return;
    item.setAttribute('data-session-step-state', state);
    const status = item.querySelector('strong');
    if (status) status.textContent = state;
  };

  const setMemorySessionState = (state, context) => {
    memorySessionPanel?.setAttribute('data-session-state', state);
    shell.setAttribute('data-memory-session-state', state);
    if (context?.sourceMemoryId) {
      memorySessionPanel?.setAttribute('data-session-source-memory', context.sourceMemoryId);
      memorySessionPanel?.setAttribute('data-session-related-memory-count', String(context.relatedMemoryIds.length));
      memorySessionPanel?.setAttribute('data-session-related-memories', context.relatedMemoryIds.join(','));
      shell.setAttribute('data-memory-session-source-memory', context.sourceMemoryId);
      shell.setAttribute('data-memory-session-related-memory-count', String(context.relatedMemoryIds.length));
    }
    if (memorySessionSummary && context?.sourceMemoryId) {
      memorySessionSummary.textContent =
        context.sourceMemoryId + ' 기억과 관련 과거 기억 ' + String(context.relatedMemoryIds.length) + '개로 Ask, Decision Replay, Weekly Report를 실행한다.';
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
    updateMemoryReviewSelection(citation, title, body, source);
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
    updateTimelineSelection(citation);
    markCytoscapeSelection(citation);
    renderRelatedMemoryEvidence(citation);
    setInteractionState('memory-selected');
  };

  const selectMemoryByCitation = (citation) => {
    const node = findMemoryNodeByCitation(citation);
    if (node) selectMemory(node);
  };

  const selectHandoffMemoryFromGraph = (citation) => {
    if (!citation) return false;
    const normalizedCitation = String(citation).replace(/^memory:/, '');
    const node = findMemoryNodeByCitation(normalizedCitation);
    if (node) {
      selectMemory(node);
    } else if (cytoscapeGraph) {
      const graphNode = cytoscapeGraph.getElementById('memory:' + normalizedCitation);
      if (!graphNode || !graphNode.length) return false;
      markCytoscapeSelection(normalizedCitation);
      const data = graphNode.data();
      if (inspectorHeadline) inspectorHeadline.textContent = data.graphLabel || data.label || normalizedCitation;
      if (inspectorSource) {
        inspectorSource.textContent = [data.sourceType, data.recordType, data.observedAt].filter(Boolean).join(' · ');
      }
      if (inspectorBody) inspectorBody.textContent = data.searchText || data.label || normalizedCitation;
      if (inspectorCitations) {
        inspectorCitations.innerHTML =
          '<a href="#evidence-' +
          escapeText(normalizedCitation) +
          '" class="citation-ref" data-citation-ref="' +
          escapeText(normalizedCitation) +
          '" data-active="true">[' +
          escapeText(normalizedCitation) +
          ']</a>';
        inspectorCitations.setAttribute('data-inspector-selected-citation', normalizedCitation);
      }
      inspector?.setAttribute('data-selected-memory', normalizedCitation);
      shell.setAttribute('data-active-memory', normalizedCitation);
      updateTimelineSelection(normalizedCitation);
    } else {
      return false;
    }
    renderRelatedMemoryEvidence(normalizedCitation);
    shell.setAttribute('data-capture-handoff-selected-memory', normalizedCitation);
    shell.setAttribute('data-capture-handoff-state', 'selected');
    setInteractionState('capture-handoff-selected');
    return true;
  };

  const highlightLiveAskCitations = (citations) => {
    const citationList = Array.from(new Set((citations || []).filter(Boolean)));
    if (cytoscapeGraph) {
      cytoscapeGraph.elements().removeClass('ask-citation-memory ask-citation-edge');
      citationList.forEach((citation) => {
        const memoryNode = cytoscapeGraph.getElementById('memory:' + citation);
        if (memoryNode && memoryNode.length) {
          memoryNode.addClass('ask-citation-memory');
          memoryNode.connectedEdges().addClass('ask-citation-edge');
        }
      });
    }
    memoryNodes.forEach((node) => {
      node.setAttribute('data-ask-citation-highlight', String(citationList.includes(node.getAttribute('data-inspector-citation') || '')));
    });
    shell.setAttribute('data-live-ask-highlighted-memory-count', String(citationList.length));
    shell.setAttribute('data-live-ask-highlighted-memories', citationList.join(','));
    if (citationList.length) setInteractionState('ask-citation-path-highlighted');
  };

  const highlightLiveReplayCitations = (citations) => {
    const citationList = Array.from(new Set((citations || []).filter(Boolean)));
    if (cytoscapeGraph) {
      cytoscapeGraph.elements().removeClass('replay-citation-memory replay-citation-edge');
      citationList.forEach((citation) => {
        const memoryNode = cytoscapeGraph.getElementById('memory:' + citation);
        if (memoryNode && memoryNode.length) {
          memoryNode.addClass('replay-citation-memory');
          memoryNode.connectedEdges().addClass('replay-citation-edge');
        }
      });
    }
    memoryNodes.forEach((node) => {
      node.setAttribute('data-replay-citation-highlight', String(citationList.includes(node.getAttribute('data-inspector-citation') || '')));
    });
    shell.setAttribute('data-live-replay-highlighted-memory-count', String(citationList.length));
    shell.setAttribute('data-live-replay-highlighted-memories', citationList.join(','));
    if (citationList.length) setInteractionState('replay-citation-path-highlighted');
  };

  const highlightLiveWeeklyReportCitations = (citations) => {
    const citationList = Array.from(new Set((citations || []).filter(Boolean)));
    if (cytoscapeGraph) {
      cytoscapeGraph.elements().removeClass('weekly-citation-memory weekly-citation-edge');
      citationList.forEach((citation) => {
        const memoryNode = cytoscapeGraph.getElementById('memory:' + citation);
        if (memoryNode && memoryNode.length) {
          memoryNode.addClass('weekly-citation-memory');
          memoryNode.connectedEdges().addClass('weekly-citation-edge');
        }
      });
    }
    memoryNodes.forEach((node) => {
      node.setAttribute('data-weekly-citation-highlight', String(citationList.includes(node.getAttribute('data-inspector-citation') || '')));
    });
    shell.setAttribute('data-live-weekly-highlighted-memory-count', String(citationList.length));
    shell.setAttribute('data-live-weekly-highlighted-memories', citationList.join(','));
    if (citationList.length) setInteractionState('weekly-citation-path-highlighted');
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
          selector: '.related-memory',
          style: {
            label: 'data(graphLabel)',
            'background-color': '#14b8a6',
            width: 28,
            height: 28,
            'border-color': '#0f766e',
            'border-width': 2,
            color: '#0f766e',
            'font-size': 11,
            'text-max-width': 210,
            'z-index': 18,
          },
        },
        {
          selector: '.related-facet',
          style: {
            'background-color': '#2dd4bf',
            width: 20,
            height: 20,
            color: '#0f766e',
            'font-size': 10,
            'z-index': 17,
          },
        },
        {
          selector: '.related-edge',
          style: {
            'line-color': '#14b8a6',
            width: 1.5,
            opacity: 0.9,
            'z-index': 16,
          },
        },
        {
          selector: '.ask-citation-memory',
          style: {
            label: 'data(graphLabel)',
            'background-color': '#8f80ff',
            width: 36,
            height: 36,
            'border-color': '#4f46e5',
            'border-width': 2,
            color: '#4f46e5',
            'font-size': 12,
            'text-max-width': 220,
            'z-index': 19,
          },
        },
        {
          selector: '.ask-citation-edge',
          style: {
            'line-color': '#8f80ff',
            width: 1.55,
            opacity: 0.92,
            'z-index': 17,
          },
        },
        {
          selector: '.replay-citation-memory',
          style: {
            label: 'data(graphLabel)',
            'background-color': '#16a34a',
            width: 34,
            height: 34,
            'border-color': '#15803d',
            'border-width': 2,
            color: '#166534',
            'font-size': 12,
            'text-max-width': 220,
            'z-index': 19,
          },
        },
        {
          selector: '.replay-citation-edge',
          style: {
            'line-color': '#16a34a',
            width: 1.45,
            opacity: 0.9,
            'z-index': 17,
          },
        },
        {
          selector: '.weekly-citation-memory',
          style: {
            label: 'data(graphLabel)',
            'background-color': '#f59e0b',
            width: 32,
            height: 32,
            'border-color': '#b45309',
            'border-width': 2,
            color: '#92400e',
            'font-size': 12,
            'text-max-width': 220,
            'z-index': 19,
          },
        },
        {
          selector: '.weekly-citation-edge',
          style: {
            'line-color': '#f59e0b',
            width: 1.35,
            opacity: 0.88,
            'z-index': 17,
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

  const layoutExplainers = {
    free: 'Free mode keeps the graph organic for open-ended memory exploration.',
    constellation: 'Constellation pins decision and thesis nodes around the selected memory.',
    hierarchy: 'Hierarchy stacks memories under source, pattern, decision, and outcome nodes.',
    timeline: 'Timeline stretches the graph from old diary traces to recent imports.',
  };

  const runCytoscapeLayoutMode = (mode) => {
    if (!cytoscapeGraph) return;
    const optionsByMode = {
      free: {
        name: 'cose',
        animate: false,
        randomize: false,
        padding: 54,
        nodeRepulsion: 9500,
        idealEdgeLength: 92,
        edgeElasticity: 80,
        numIter: 500,
      },
      constellation: {
        name: 'circle',
        animate: false,
        padding: 70,
        radius: Math.min(cytoscapeMount?.clientWidth || 760, cytoscapeMount?.clientHeight || 620) * 0.32,
      },
      hierarchy: {
        name: 'breadthfirst',
        animate: false,
        directed: true,
        padding: 70,
        spacingFactor: 1.18,
      },
      timeline: {
        name: 'grid',
        animate: false,
        padding: 70,
        rows: 4,
      },
    };
    cytoscapeGraph.layout(optionsByMode[mode] || optionsByMode.free).run();
    const selectedCitation = shell.getAttribute('data-active-memory') || 'mem_freeze_vs_feature_addition';
    markCytoscapeSelection(selectedCitation);
  };

  const setLayoutMode = (mode) => {
    layoutVersion += 1;
    shell.setAttribute('data-layout-mode', mode);
    shell.setAttribute('data-layout-explainer', layoutExplainers[mode] || layoutExplainers.free);
    shell.setAttribute('data-layout-version', String(layoutVersion));
    layoutButtons.forEach((button) => {
      const active = button.getAttribute('data-layout-choice') === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
    runCytoscapeLayoutMode(mode);
    setInteractionState('layout-' + mode);
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

  const wireMemorySearchResult = (result) => {
    result.addEventListener('click', () => {
      const citation = result.getAttribute('data-search-citation') || '';
      const node = memoryNodes.find((item) => item.getAttribute('data-inspector-citation') === citation);
      if (node) selectMemory(node);
      shell.setAttribute('data-search-selected-memory', citation);
      setInteractionState('search-result-selected');
    });
  };

  const renderLiveMemorySearchResults = (records, totalMatchCount, query) => {
    if (!memorySearchContainer) return;
    memorySearchContainer.replaceChildren();
    records.forEach((record) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'memory-search-result';
      button.setAttribute('data-search-result', 'memory');
      button.setAttribute('data-search-result-active', 'true');
      button.setAttribute('data-search-citation', record.id || '');
      button.setAttribute(
        'data-search-text',
        [record.summary, record.memoryType, record.sourceType, record.observedAt, record.id].filter(Boolean).join(' ').toLocaleLowerCase(),
      );
      const title = document.createElement('strong');
      title.textContent = record.summary || record.id || 'Untitled memory';
      const meta = document.createElement('span');
      meta.textContent = [record.sourceType, record.memoryType, record.observedAt || record.createdAt?.slice?.(0, 10)].filter(Boolean).join(' · ');
      button.append(title, meta);
      wireMemorySearchResult(button);
      memorySearchContainer.append(button);
    });
    memorySearchResults = Array.from(memorySearchContainer.querySelectorAll('[data-search-result="memory"]'));
    if (memorySearchCount) {
      memorySearchCount.textContent = records.length + ' / ' + totalMatchCount;
      memorySearchCount.setAttribute('data-search-count-value', String(records.length));
      memorySearchCount.setAttribute('data-search-total-count', String(totalMatchCount));
    }
    shell.setAttribute('data-search-mode', 'remote');
    shell.setAttribute('data-search-query', String(query || '').trim().toLocaleLowerCase());
    shell.setAttribute('data-search-result-count', String(records.length));
    shell.setAttribute('data-search-total-count', String(totalMatchCount));
    setInteractionState('search-remote-ready');
  };

  const fetchRemoteMemorySearch = async (query) => {
    const normalized = String(query || '').trim();
    if (!memorySearchEndpoint || window.location.protocol === 'file:' || normalized.length < 5) return;
    shell.setAttribute('data-search-mode', 'remote-loading');
    try {
      const response = await fetch(memorySearchEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: normalized, limit: 20 }),
      });
      if (!response.ok) throw new Error('memory search failed with ' + response.status);
      const body = await response.json();
      renderLiveMemorySearchResults(body.records || [], body.totalMatchCount || 0, normalized);
    } catch (error) {
      shell.setAttribute('data-search-mode', 'remote-error');
      shell.setAttribute('data-search-error', String(error?.message || error));
    }
  };

  const renderLiveAskResult = (result) => {
    const brief = result?.coachingBrief || {};
    const ask = result?.ask || {};
    const relatedContext = relatedContextFromAskFollowUp(lastAskFollowUpContext);
    if (inspectorHeadline) inspectorHeadline.textContent = brief.recommendation || ask.recommendation || '';
    if (inspectorSource) {
      inspectorSource.textContent =
        (brief.evidenceLabel || ask.evidenceLabel || 'unknown') + ' · ' + String(brief.citationCount || ask.citationMemoryIds?.length || 0) + ' citations';
    }
    if (inspectorBody) {
      const nextActions = Array.isArray(brief.nextActions) ? brief.nextActions.join(' ') : '';
      inspectorBody.textContent = [ask.answer, nextActions, brief.boundary].filter(Boolean).join(' ');
    }
    if (inspectorCitations) {
      inspectorCitations.replaceChildren();
      (ask.citationMemoryIds || []).slice(0, 5).forEach((citation) => {
        const link = document.createElement('a');
        link.href = '#evidence-' + citation;
        link.className = 'citation-ref';
        link.setAttribute('data-citation-ref', citation);
        link.textContent = '[' + citation + ']';
        inspectorCitations.append(link);
      });
      inspectorCitations.setAttribute('data-ask-citation-count', String(ask.citationMemoryIds?.length || 0));
    }
    shell.setAttribute('data-ask-state', 'answered');
    shell.setAttribute('data-ask-evidence-label', brief.evidenceLabel || ask.evidenceLabel || 'unknown');
    shell.setAttribute('data-ask-citation-count', String(brief.citationCount || ask.citationMemoryIds?.length || 0));
    renderResultContextEvidence(askResult, 'ask', relatedContext);
    highlightLiveAskCitations(ask.citationMemoryIds || []);
    lastAskFollowUpContext = {
      previousQuestion: result.savedArtifact?.metadata?.question || '',
      previousRecommendation: ask.recommendation || brief.recommendation || '',
      previousCitationMemoryIds: ask.citationMemoryIds || [],
    };
    shell.setAttribute('data-ask-conversation-mode', result.conversationContext?.mode || 'single_turn');
    if (result.savedArtifact) {
      const futureMemoryId = 'mem_api_' + result.savedArtifact.id;
      savedArtifactsById.set(result.savedArtifact.id, {
        artifact: result.savedArtifact,
        futureMemoryId,
      });
      if (askSaveButton) {
        askSaveButton.setAttribute('data-artifact-id', result.savedArtifact.id);
        askSaveButton.setAttribute('data-future-memory-id', futureMemoryId);
        askSaveButton.setAttribute('data-artifact-source-ref', 'personal-memory-ai://saved-artifacts/' + result.savedArtifact.id);
        askSaveButton.setAttribute(
          'data-artifact-citation-count',
          String(result.savedArtifact.citationMemoryIds?.length || 0),
        );
        askSaveButton.setAttribute('data-artifact-save-state', 'ready');
        askSaveButton.textContent = 'Save answer';
      }
      shell.setAttribute('data-live-ask-artifact-id', result.savedArtifact.id);
    }
    setInteractionState('ask-answered');
  };

  const relatedContextFromAskFollowUp = (context) => {
    if (!context || context.previousQuestion !== 'selected-memory-related-context') return null;
    const memoryIds = Array.from(new Set(context.previousCitationMemoryIds || [])).filter(Boolean);
    if (!memoryIds.length) return null;
    return {
      sourceMemoryId: memoryIds[0],
      relatedMemoryIds: memoryIds.slice(1),
    };
  };

  const renderResultContextEvidence = (target, kind, context) => {
    if (!target || !context?.sourceMemoryId) return;
    const relatedMemoryIds = Array.from(new Set(context.relatedMemoryIds || [])).filter(Boolean);
    let badge = target.querySelector('[data-context-result="' + kind + '-related"]');
    if (!badge) {
      badge = document.createElement('div');
      badge.className = 'result-context-evidence';
      badge.setAttribute('data-context-result', kind + '-related');
      target.prepend(badge);
    }
    badge.setAttribute('data-context-source-memory', context.sourceMemoryId);
    badge.setAttribute('data-context-related-memory-count', String(relatedMemoryIds.length));
    badge.setAttribute('data-context-related-memories', relatedMemoryIds.join(','));
    badge.innerHTML =
      '<strong>Selected memory context</strong><span>' +
      escapeText(context.sourceMemoryId) +
      ' + ' +
      String(relatedMemoryIds.length) +
      ' related memories</span>';
    shell.setAttribute('data-' + kind + '-result-context-source-memory', context.sourceMemoryId);
    shell.setAttribute('data-' + kind + '-result-context-related-memory-count', String(relatedMemoryIds.length));
    shell.setAttribute('data-' + kind + '-result-context-related-memories', relatedMemoryIds.join(','));
  };

  const askSecondBrain = async () => {
    const question = askQuestionInput?.value?.trim() || '';
    if (!question || !askEndpoint || window.location.protocol === 'file:') return;
    shell.setAttribute('data-ask-state', 'loading');
    askSubmit?.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(askEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question,
          queryId: 'web-ask-' + Date.now(),
          createdAt: new Date().toISOString(),
          followUpContext: lastAskFollowUpContext,
        }),
      });
      if (!response.ok) throw new Error('ask failed with ' + response.status);
      renderLiveAskResult(await response.json());
    } catch (error) {
      shell.setAttribute('data-ask-state', 'error');
      shell.setAttribute('data-ask-error', String(error?.message || error));
      setInteractionState('ask-error');
    } finally {
      askSubmit?.setAttribute('aria-busy', 'false');
    }
  };

  const waitForShellState = (name, value) =>
    new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const tick = () => {
        if (shell.getAttribute(name) === value) {
          resolve(true);
          return;
        }
        if (Date.now() - startedAt > 12000) {
          reject(new Error('timed out waiting for ' + name + '=' + value));
          return;
        }
        window.setTimeout(tick, 80);
      };
      tick();
    });

  const runMemorySession = async () => {
    const context = getSelectedRelatedMemoryContext();
    if (!context || window.location.protocol === 'file:') return;
    setMemorySessionState('running', context);
    setMemorySessionStep('ask', 'running');
    setMemorySessionStep('replay', 'idle');
    setMemorySessionStep('weekly', 'idle');
    runMemorySessionButton?.setAttribute('aria-busy', 'true');
    try {
      askWithRelatedMemoryContext();
      await askSecondBrain();
      await waitForShellState('data-ask-state', 'answered');
      setMemorySessionStep('ask', 'completed');

      setMemorySessionStep('replay', 'running');
      replayWithRelatedMemoryContext();
      await replayCurrentDecision();
      await waitForShellState('data-replay-state', 'answered');
      setMemorySessionStep('replay', 'completed');

      setMemorySessionStep('weekly', 'running');
      reportWithRelatedMemoryContext();
      await refreshWeeklyReport();
      await waitForShellState('data-weekly-report-state', 'ready');
      setMemorySessionStep('weekly', 'completed');
      setMemorySessionState('completed', context);
      setInteractionState('memory-session-completed');
    } catch (error) {
      setMemorySessionState('error', context);
      shell.setAttribute('data-memory-session-error', String(error?.message || error));
      setInteractionState('memory-session-error');
    } finally {
      runMemorySessionButton?.setAttribute('aria-busy', 'false');
    }
  };

  const renderLiveReplayResult = (result) => {
    const replay = result?.replay || {};
    const citations = replay.citationMemoryIds || [];
    if (decisionReplayResult) {
      const headline = decisionReplayResult.querySelector('h3');
      const body = decisionReplayResult.querySelector('p');
      const topline = decisionReplayResult.querySelector('.panel-topline span');
      if (headline) headline.textContent = replay.recommendation || '';
      if (body) body.textContent = replay.uncertainty || '';
      if (topline) topline.textContent = replay.evidenceLabel || 'unknown';
    }
    shell.setAttribute('data-replay-state', 'answered');
    shell.setAttribute('data-replay-evidence-label', replay.evidenceLabel || 'unknown');
    shell.setAttribute('data-replay-citation-count', String(citations.length));
    renderResultContextEvidence(decisionReplayResult, 'replay', lastReplayRelatedContext);
    highlightLiveReplayCitations(citations);
  };

  const replayCurrentDecision = async () => {
    const prompt = decisionReplayInput?.value?.trim() || '';
    const replayEndpoint = decisionReplayPanel?.getAttribute('data-replay-endpoint') || '';
    if (!prompt || !replayEndpoint || window.location.protocol === 'file:') return;
    shell.setAttribute('data-replay-state', 'loading');
    decisionReplayPanel?.setAttribute('data-replay-state', 'loading');
    decisionReplayButton?.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(replayEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question: prompt,
          queryId: 'web-replay-' + Date.now(),
          createdAt: new Date().toISOString(),
          currentDecision: {
            id: 'web-replay-current',
            prompt,
            emotions: ['anxiety'],
            choices: ['ship now', 'add more'],
            topicTags: ['personal-memory-ai', 'decision-replay'],
            relatedMemoryContext: lastReplayRelatedContext,
          },
        }),
      });
      if (!response.ok) throw new Error('replay failed with ' + response.status);
      renderLiveReplayResult(await response.json());
      decisionReplayPanel?.setAttribute('data-replay-state', 'answered');
    } catch (error) {
      shell.setAttribute('data-replay-state', 'error');
      shell.setAttribute('data-replay-error', String(error?.message || error));
      decisionReplayPanel?.setAttribute('data-replay-state', 'error');
      setInteractionState('replay-error');
    } finally {
      decisionReplayButton?.setAttribute('aria-busy', 'false');
    }
  };

  const renderLiveWeeklyReport = (result) => {
    const report = result?.weeklyReport || {};
    const citations = report.includedMemoryIds || [];
    if (weeklyReportSummary) {
      const evidence = weeklyReportSummary.querySelector('span');
      const count = weeklyReportSummary.querySelector('strong');
      if (evidence) evidence.textContent = report.evidenceLabel || 'unknown';
      if (count) count.textContent = String(citations.length);
    }
    weeklyReportPanel?.setAttribute('data-weekly-report-state', 'ready');
    weeklyReportPanel?.setAttribute('data-weekly-report-generated-at', report.generatedAt || new Date().toISOString());
    weeklyReportPanel?.setAttribute('data-weekly-included-memory-count', String(citations.length));
    shell.setAttribute('data-weekly-report-state', 'ready');
    shell.setAttribute('data-weekly-report-citation-count', String(citations.length));
    renderResultContextEvidence(weeklyReportPanel, 'weekly', lastWeeklyRelatedContext);
    highlightLiveWeeklyReportCitations(citations);
  };

  const refreshWeeklyReport = async () => {
    const weeklyReportEndpoint = weeklyReportPanel?.getAttribute('data-weekly-report-endpoint') || '';
    if (!weeklyReportEndpoint || window.location.protocol === 'file:') return;
    weeklyReportPanel?.setAttribute('data-weekly-report-state', 'loading');
    shell.setAttribute('data-weekly-report-state', 'loading');
    weeklyReportRefreshButton?.setAttribute('aria-busy', 'true');
    try {
      const response = await fetch(weeklyReportEndpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          startDate: weeklyReportPanel?.getAttribute('data-weekly-report-window-start') || '2026-05-01',
          endDate: weeklyReportPanel?.getAttribute('data-weekly-report-window-end') || new Date().toISOString().slice(0, 10),
          generatedAt: new Date().toISOString(),
          relatedMemoryContext: lastWeeklyRelatedContext,
        }),
      });
      if (!response.ok) throw new Error('weekly report failed with ' + response.status);
      renderLiveWeeklyReport(await response.json());
    } catch (error) {
      weeklyReportPanel?.setAttribute('data-weekly-report-state', 'error');
      shell.setAttribute('data-weekly-report-state', 'error');
      shell.setAttribute('data-weekly-report-error', String(error?.message || error));
      setInteractionState('weekly-report-error');
    } finally {
      weeklyReportRefreshButton?.setAttribute('aria-busy', 'false');
    }
  };

  spacingButtons.forEach((button) => {
    button.addEventListener('click', () => setSpacing(button.getAttribute('data-spacing') || 'normal'));
  });

  layoutButtons.forEach((button) => {
    button.addEventListener('click', () => setLayoutMode(button.getAttribute('data-layout-choice') || 'free'));
  });

  if (memorySearchInput) {
    memorySearchInput.addEventListener('input', () => {
      applyMemorySearch(memorySearchInput.value);
      void fetchRemoteMemorySearch(memorySearchInput.value);
    });
  }

  askForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    void askSecondBrain();
  });

  decisionReplayButton?.addEventListener('click', () => {
    void replayCurrentDecision();
  });

  weeklyReportRefreshButton?.addEventListener('click', () => {
    void refreshWeeklyReport();
  });

  memorySearchResults.forEach(wireMemorySearchResult);

  timelineItems.forEach((item) => {
    item.addEventListener('click', () => {
      const citation = item.getAttribute('data-timeline-memory-id') || '';
      const node = findMemoryNodeByCitation(citation);
      if (node) {
        selectMemory(node);
        shell.setAttribute('data-timeline-selected-memory', citation);
        setInteractionState('timeline-item-selected');
      }
    });
  });

  saveArtifactButtons.forEach((button) => {
    button.addEventListener('click', async () => {
      const artifactId = button.getAttribute('data-artifact-id') || '';
      const futureMemoryId = button.getAttribute('data-future-memory-id') || '';
      const savedLabel = button.getAttribute('data-artifact-saved-label') || 'Saved';
      const endpoint = button.getAttribute('data-artifact-save-endpoint') || '';
      const method = button.getAttribute('data-artifact-save-method') || 'POST';
      const action = savedArtifactsById.get(artifactId);
      const shouldPersist = Boolean(action?.artifact && endpoint && window.location.protocol !== 'file:');
      button.setAttribute('data-artifact-save-state', shouldPersist ? 'saving' : 'saved');
      if (shouldPersist) {
        try {
          const response = await fetch(endpoint, {
            method,
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ artifact: action.artifact }),
          });
          if (!response.ok) throw new Error('artifact save failed with ' + response.status);
          const body = await response.json().catch(() => ({}));
          const savedMemoryId = body?.createdMemoryIds?.[0] || body?.record?.id || futureMemoryId;
          shell.setAttribute('data-last-saved-memory', savedMemoryId);
        } catch (error) {
          button.setAttribute('data-artifact-save-state', 'error');
          shell.setAttribute('data-artifact-save-error', String(error?.message || error));
          setInteractionState('artifact-save-error');
          return;
        }
      } else {
        shell.setAttribute('data-last-saved-memory', futureMemoryId);
      }
      button.setAttribute('data-artifact-save-state', 'saved');
      button.textContent = savedLabel;
      shell.setAttribute('data-last-saved-artifact', artifactId);
      setInteractionState('artifact-saved');
    });
  });

  feedbackSubmit?.addEventListener('click', async () => {
    if (!feedbackPanel) return;
    const endpoint = feedbackPanel.getAttribute('data-feedback-endpoint') || '';
    const method = feedbackPanel.getAttribute('data-feedback-method') || 'POST';
    const targetMemoryId = feedbackPanel.getAttribute('data-feedback-target-memory-id') || '';
    const targetArtifactId = feedbackPanel.getAttribute('data-feedback-target-artifact-id') || '';
    const correctionText = feedbackText?.value || '';
    const shouldPersist = Boolean(endpoint && correctionText.trim() && window.location.protocol !== 'file:');
    feedbackPanel.setAttribute('data-feedback-state', shouldPersist ? 'saving' : 'submitted');
    if (shouldPersist) {
      try {
        const response = await fetch(endpoint, {
          method,
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            correctionText,
            targetMemoryIds: targetMemoryId ? [targetMemoryId] : [],
            targetArtifactId,
          }),
        });
        if (!response.ok) throw new Error('feedback save failed with ' + response.status);
      } catch (error) {
        feedbackPanel.setAttribute('data-feedback-state', 'error');
        shell.setAttribute('data-feedback-error', String(error?.message || error));
        setInteractionState('feedback-error');
        return;
      }
    }
    feedbackPanel.setAttribute('data-feedback-state', 'submitted');
    feedbackSubmit.textContent = feedbackSubmit.getAttribute('data-feedback-submitted-label') || 'Feedback saved';
    shell.setAttribute('data-last-feedback-memory-target', targetMemoryId);
    setInteractionState('feedback-submitted');
  });

  const markdownRawText = (text) =>
    String(text || '')
      .split('\\n')
      .filter((line) => !line.trim().startsWith('# '))
      .join('\\n')
      .trim();

  const dateFromName = (name) => String(name || '').match(/\\d{4}-\\d{2}-\\d{2}/)?.[0] || new Date().toISOString().slice(0, 10);

  const candidateFromText = (name, text, index) => ({
    sourceType: 'markdown',
    sourceRef: 'markdown://' + name + (index ? '#' + (index + 1) : ''),
    observedAt: dateFromName(name),
    rawText: markdownRawText(text),
    provenance: {
      importer: 'local-file-upload',
      sourceName: name,
    },
  });

  const buildLocalImportCandidates = async () => {
    const files = Array.from(importFileInput?.files || []);
    const pastedText = importPasteText?.value || '';
    const fileEntries = await Promise.all(
      files.map(async (file) => ({
        name: file.name,
        text: await file.text(),
      })),
    );
    if (pastedText.trim()) {
      fileEntries.push({
        name: 'pasted-memory-' + new Date().toISOString().slice(0, 10) + '.md',
        text: pastedText,
      });
    }

    const candidates = [];
    fileEntries.forEach((file) => {
      if (file.name.toLowerCase().endsWith('.json')) {
        try {
          const parsed = JSON.parse(file.text);
          const rows = Array.isArray(parsed) ? parsed : [parsed];
          rows.forEach((row, index) => {
            const rawText = String(row?.rawText || row?.text || '').trim();
            if (!rawText) return;
            candidates.push({
              sourceType: ['notion', 'obsidian', 'markdown'].includes(row?.sourceType) ? row.sourceType : 'markdown',
              sourceRef: row?.sourceRef || 'markdown://' + file.name + '#' + (index + 1),
              observedAt: row?.observedAt || dateFromName(file.name),
              rawText,
              summary: row?.summary,
              provenance: {
                importer: 'local-file-upload',
                sourceName: file.name,
              },
            });
          });
          return;
        } catch {
          // Invalid JSON falls back to text import below.
        }
      }
      const candidate = candidateFromText(file.name, file.text, 0);
      if (candidate.rawText) candidates.push(candidate);
    });

    return {
      batchId: 'local-upload-' + Date.now(),
      createdAt: new Date().toISOString(),
      files: fileEntries,
      candidates,
    };
  };

  const renderImportPreviewRows = (records) => {
    if (!importUploadPreviewList) return;
    importUploadPreviewList.innerHTML = (records || [])
      .slice(0, 4)
      .map(
        (record) =>
          '<article data-local-import-preview-id="' +
          escapeText(record.id || '') +
          '" data-import-duplicate-state="' +
          escapeText(record.duplicate?.state || 'new') +
          '"><strong>' +
          escapeText(record.sourceType || 'markdown') +
          ' ' +
          escapeText(record.observedDate || '') +
          '</strong><p>' +
          escapeText(record.memoryRecord?.summary || record.memoryRecord?.rawText || 'Local import candidate') +
          '</p><span>' +
          escapeText(record.duplicate?.state || 'new') +
          '</span></article>',
      )
      .join('');
  };

  const renderNotionSourceRows = (sources) => {
    if (!notionSourceList) return;
    notionSourceList.innerHTML = (sources || [])
      .slice(0, 5)
      .map(
        (source) =>
          '<button type="button" data-control="select-notion-source" data-notion-source-id="' +
          escapeText(source.id || '') +
          '"><strong>' +
          escapeText(source.title || source.id || 'Untitled source') +
          '</strong><span>' +
          escapeText(source.object || 'data_source') +
          '</span></button>',
      )
      .join('');
    Array.from(notionSourceList.querySelectorAll('[data-control="select-notion-source"]')).forEach((button) => {
      button.addEventListener('click', () => {
        if (notionDatabaseId) notionDatabaseId.value = button.getAttribute('data-notion-source-id') || '';
        setInteractionState('notion-source-selected');
      });
    });
  };

  const renderAppliedImportFeedback = (createdMemoryIds, graphEvidenceRecords) => {
    const records = Array.isArray(graphEvidenceRecords) ? graphEvidenceRecords : [];
    const ids = Array.isArray(createdMemoryIds) ? createdMemoryIds : [];
    shell.setAttribute('data-import-applied-memory-ids', ids.join(','));
    shell.setAttribute('data-graph-import-pending', ids.length ? 'true' : 'false');
    if (importAppliedFeedback) importAppliedFeedback.setAttribute('data-import-applied-count', String(ids.length));
    if (importAppliedMemoryList) {
      importAppliedMemoryList.innerHTML = records
        .map(
          (record) =>
            '<article data-import-applied-memory-id="' +
            escapeText(record.id || '') +
            '"><strong>' +
            escapeText(record.summary || record.id || 'Imported memory') +
            '</strong><span>' +
            escapeText(record.sourceType || 'markdown') +
            ' · ' +
            escapeText(record.observedAt || record.createdAt || '') +
            '</span></article>',
        )
        .join('');
    }
    const timelineList = timelinePanel?.querySelector('.timeline-list');
    if (timelinePanel && timelineList && records.length) {
      const currentCount = Number(timelinePanel.getAttribute('data-timeline-entry-count') || '0');
      timelinePanel.setAttribute('data-timeline-entry-count', String(currentCount + records.length));
      records.forEach((record) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'timeline-memory-item imported-memory-item';
        item.setAttribute('data-control', 'timeline-select-memory');
        item.setAttribute('data-timeline-memory-id', record.id || '');
        item.setAttribute('data-timeline-active', 'false');
        item.setAttribute('data-imported-memory', 'true');
        item.innerHTML =
          '<span class="timeline-date">' +
          escapeText(record.observedAt || record.createdAt || '') +
          '</span><strong>' +
          escapeText(record.summary || record.id || 'Imported memory') +
          '</strong><span class="timeline-source">' +
          escapeText(record.sourceType || 'markdown') +
          '</span><span class="timeline-excerpt">' +
          escapeText(record.rawText || '') +
          '</span>';
        timelineList.prepend(item);
      });
    }
  };

  const renderUndoneImportFeedback = (deletedCount) => {
    shell.setAttribute('data-import-undone-count', String(deletedCount || 0));
    shell.setAttribute('data-import-applied-memory-ids', '');
    shell.setAttribute('data-graph-import-pending', 'false');
    if (importAppliedFeedback) importAppliedFeedback.setAttribute('data-import-applied-count', '0');
    if (importAppliedMemoryList) importAppliedMemoryList.innerHTML = '';
    if (importUndoButton) importUndoButton.setAttribute('disabled', '');
  };

  const rehydrateAppShellAfterImport = async () => {
    if (window.location.protocol === 'file:') return;
    shell.setAttribute('data-graph-rehydrate-state', 'loading');
    try {
      const response = await fetch('/api/app-shell', {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      if (!response.ok) throw new Error('app shell rehydrate failed with ' + response.status);
      const body = await response.json();
      const appShell = body?.appShell || {};
      const memoryGraph = body?.memoryGraph;
      shell.setAttribute('data-graph-rehydrate-state', 'ready');
      shell.setAttribute('data-rehydrated-memory-node-count', String(appShell.primaryNodes?.length || 0));
      shell.setAttribute('data-rehydrated-graph-node-count', String(appShell.compiledWiki?.nodeCount || 0));
      shell.setAttribute('data-rehydrated-timeline-entry-count', String(appShell.memoryTimeline?.entries?.length || 0));
      if (liveCountTargets.memoryNodes) liveCountTargets.memoryNodes.textContent = String(memoryGraph?.stats?.memoryNodeCount || 0);
      if (liveCountTargets.renderedMemoryNodes) liveCountTargets.renderedMemoryNodes.textContent = String(memoryGraph?.stats?.renderedMemoryNodeCount || 0);
      if (liveCountTargets.graphNodes) liveCountTargets.graphNodes.textContent = String(memoryGraph?.stats?.graphNodeCount || 0);
      if (liveCountTargets.graphEdges) liveCountTargets.graphEdges.textContent = String(memoryGraph?.stats?.edgeCount || 0);
      if (liveCountTargets.wikiAtoms) liveCountTargets.wikiAtoms.textContent = String(appShell.compiledWiki?.atomCount || 0);
      if (liveCountTargets.wikiNodes) liveCountTargets.wikiNodes.textContent = String(appShell.compiledWiki?.nodeCount || 0);
      if (liveCountTargets.wikiCitations) liveCountTargets.wikiCitations.textContent = String(appShell.compiledWiki?.citationCount || 0);
      if (searchCount) searchCount.textContent = String(appShell.primaryNodes?.length || 0) + ' / ' + String(appShell.primaryNodes?.length || 0);
      if (timelinePanel) timelinePanel.setAttribute('data-timeline-entry-count', String(appShell.memoryTimeline?.entries?.length || 0));
      rebuildCytoscapeGraphFromModel(memoryGraph);
      selectHandoffMemoryFromGraph(handoffMemoryId);
    } catch (error) {
      shell.setAttribute('data-graph-rehydrate-state', 'error');
      shell.setAttribute('data-graph-rehydrate-error', String(error?.message || error));
    }
  };

  const rehydrateHealthState = async () => {
    if (window.location.protocol === 'file:' || !privacyControlPanel) return;
    privacyControlPanel.setAttribute('data-local-durable-store', 'checking');
    try {
      const response = await fetch('/health/live', {
        method: 'GET',
        headers: { accept: 'application/json' },
      });
      if (!response.ok) throw new Error('health check failed with ' + response.status);
      const body = await response.json();
      privacyControlPanel.setAttribute('data-local-durable-store', body.localDurableStore || 'unknown');
      privacyControlPanel.setAttribute('data-memory-backend', body.memoryBackend || 'unknown');
    } catch (error) {
      privacyControlPanel.setAttribute('data-local-durable-store', 'unknown');
      shell.setAttribute('data-health-rehydrate-error', String(error?.message || error));
    }
  };

  const rebuildCytoscapeGraphFromModel = (memoryGraph) => {
    if (!cytoscapeGraph || !memoryGraph?.elements) return;
    cytoscapeGraph.elements().remove();
    cytoscapeGraph.add(memoryGraph.elements);
    cytoscapeGraph.layout({
      name: 'cose',
      animate: false,
      randomize: false,
      padding: 54,
      nodeRepulsion: 9500,
      idealEdgeLength: 92,
      edgeElasticity: 80,
      numIter: 500,
    }).run();
    window.__personalMemoryGraph = {
      library: 'cytoscape',
      stats: memoryGraph.stats,
      cy: cytoscapeGraph,
    };
    shell.setAttribute('data-graph-rebuild-state', 'rebuilt');
    shell.setAttribute('data-memory-node-count', String(memoryGraph.stats?.memoryNodeCount || 0));
    shell.setAttribute('data-rendered-memory-node-count', String(memoryGraph.stats?.renderedMemoryNodeCount || 0));
    shell.setAttribute('data-graph-node-count', String(memoryGraph.stats?.graphNodeCount || 0));
    shell.setAttribute('data-graph-edge-count', String(memoryGraph.stats?.edgeCount || 0));
    if (cytoscapeMount) {
      cytoscapeMount.setAttribute('data-rendered-memory-node-count', String(memoryGraph.stats?.renderedMemoryNodeCount || 0));
      cytoscapeMount.setAttribute('data-cytoscape-node-count', String(memoryGraph.stats?.graphNodeCount || 0));
      cytoscapeMount.setAttribute('data-cytoscape-edge-count', String(memoryGraph.stats?.edgeCount || 0));
    }
  };

  notionSourcesButton?.addEventListener('click', async () => {
    if (!notionImportPanel) return;
    const endpoint = notionImportPanel.getAttribute('data-notion-sources-endpoint') || '';
    notionImportPanel.setAttribute('data-notion-sources-state', 'loading');
    try {
      if (!endpoint || window.location.protocol === 'file:') {
        renderNotionSourceRows([]);
      } else {
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: { accept: 'application/json' },
        });
        if (response.status === 424) {
          notionImportPanel.setAttribute('data-notion-sources-state', 'token-required');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion token required';
          setInteractionState('notion-import-token-required');
          return;
        }
        if (response.status === 429) {
          notionImportPanel.setAttribute('data-notion-sources-state', 'rate-limited');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion rate limited. Retry shortly.';
          setInteractionState('notion-sources-rate-limited');
          return;
        }
        if (!response.ok) throw new Error('notion source search failed with ' + response.status);
        const body = await response.json();
        const sources = body?.sources || [];
        renderNotionSourceRows(sources);
        notionImportPanel.setAttribute('data-notion-sources-state', 'ready');
        notionImportPanel.setAttribute('data-notion-source-count', String(sources.length));
        if (notionImportSummary) notionImportSummary.textContent = sources.length + ' Notion sources';
      }
      setInteractionState('notion-sources-ready');
    } catch (error) {
      notionImportPanel.setAttribute('data-notion-sources-state', 'error');
      shell.setAttribute('data-notion-sources-error', String(error?.message || error));
      setInteractionState('notion-sources-error');
    }
  });

  notionImportPreviewButton?.addEventListener('click', async () => {
    if (!notionImportPanel) return;
    const databaseId = notionDatabaseId?.value?.trim() || '';
    const endpoint = notionImportPanel.getAttribute('data-notion-import-endpoint') || '';
    if (!databaseId) {
      notionImportPanel.setAttribute('data-notion-import-state', 'blocked');
      setInteractionState('notion-import-blocked');
      return;
    }
    notionImportPanel.setAttribute('data-notion-import-state', 'loading');
    try {
      if (!endpoint || window.location.protocol === 'file:') {
        lastLocalImportPreview = {
          batchId: databaseId,
          records: [],
        };
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            databaseId,
            createdAt: new Date().toISOString(),
          }),
        });
        if (response.status === 424) {
          notionImportPanel.setAttribute('data-notion-import-state', 'token-required');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion token required';
          setInteractionState('notion-import-token-required');
          return;
        }
        if (response.status === 429) {
          notionImportPanel.setAttribute('data-notion-import-state', 'rate-limited');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion rate limited. Retry shortly.';
          setInteractionState('notion-import-rate-limited');
          return;
        }
        if (!response.ok) throw new Error('notion import preview failed with ' + response.status);
        lastLocalImportPreview = (await response.json()).preview;
      }
      const records = lastLocalImportPreview?.records || [];
      renderImportPreviewRows(records);
      notionImportPanel.setAttribute('data-notion-import-state', 'preview-ready');
      notionImportPanel.setAttribute('data-notion-import-candidate-count', String(records.length));
      if (notionImportSummary) notionImportSummary.textContent = records.length + ' Notion candidates';
      importApplyButton?.removeAttribute('disabled');
      setInteractionState('notion-import-preview-ready');
    } catch (error) {
      notionImportPanel.setAttribute('data-notion-import-state', 'error');
      shell.setAttribute('data-notion-import-error', String(error?.message || error));
      setInteractionState('notion-import-error');
    }
  });

  importPreviewButton?.addEventListener('click', async () => {
    if (!importUploadPanel) return;
    importUploadPanel.setAttribute('data-import-upload-state', 'reading');
    const draft = await buildLocalImportCandidates();
    const importPreviewEndpoint = importUploadPanel.getAttribute('data-import-preview-endpoint') || '';
    importUploadPanel.setAttribute('data-import-upload-file-count', String(draft.files.length));
    importUploadPanel.setAttribute('data-import-upload-candidate-count', String(draft.candidates.length));
    if (importUploadSummary) importUploadSummary.textContent = draft.files.length + ' files · ' + draft.candidates.length + ' candidates';

    if (!draft.candidates.length) {
      importUploadPanel.setAttribute('data-import-upload-state', 'blocked');
      setInteractionState('import-upload-blocked');
      return;
    }

    try {
      if (importPreviewEndpoint && window.location.protocol !== 'file:') {
        const response = await fetch(importPreviewEndpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            batchId: draft.batchId,
            createdAt: draft.createdAt,
            candidates: draft.candidates,
          }),
        });
        if (!response.ok) throw new Error('import preview failed with ' + response.status);
        lastLocalImportPreview = (await response.json()).preview;
      } else {
        lastLocalImportPreview = {
          batchId: draft.batchId,
          records: draft.candidates.map((candidate, index) => ({
            id: 'local_preview_' + (index + 1),
            sourceType: candidate.sourceType,
            observedDate: candidate.observedAt || draft.createdAt.slice(0, 10),
            duplicate: { state: 'new', existingRecordIds: [] },
            memoryRecord: {
              summary: candidate.summary || candidate.rawText.slice(0, 80),
              rawText: candidate.rawText,
            },
          })),
        };
      }
      renderImportPreviewRows(lastLocalImportPreview.records);
      importUploadPanel.setAttribute('data-import-upload-state', 'preview-ready');
      importApplyButton?.removeAttribute('disabled');
      setInteractionState('import-preview-ready');
    } catch (error) {
      importUploadPanel.setAttribute('data-import-upload-state', 'error');
      shell.setAttribute('data-import-upload-error', String(error?.message || error));
      setInteractionState('import-preview-error');
    }
  });

  importApplyButton?.addEventListener('click', async () => {
    if (!importUploadPanel || !lastLocalImportPreview) return;
    const importApplyEndpoint = importUploadPanel.getAttribute('data-import-apply-endpoint') || '';
    importUploadPanel.setAttribute('data-import-upload-state', 'applying');
    try {
      if (importApplyEndpoint && window.location.protocol !== 'file:') {
        const response = await fetch(importApplyEndpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ preview: lastLocalImportPreview }),
        });
        if (!response.ok) throw new Error('import apply failed with ' + response.status);
        const body = await response.json().catch(() => ({}));
        shell.setAttribute('data-last-import-created-count', String(body.createdMemoryIds?.length || 0));
        lastLocalImportUndoAction = body.undoAction || null;
        renderAppliedImportFeedback(body.createdMemoryIds || [], body.graphEvidenceRecords || []);
        if (lastLocalImportUndoAction?.enabled) importUndoButton?.removeAttribute('disabled');
        await rehydrateAppShellAfterImport();
      }
      importUploadPanel.setAttribute('data-import-upload-state', 'applied');
      setInteractionState('import-applied');
    } catch (error) {
      importUploadPanel.setAttribute('data-import-upload-state', 'error');
      shell.setAttribute('data-import-upload-error', String(error?.message || error));
      setInteractionState('import-apply-error');
    }
  });

  importUndoButton?.addEventListener('click', async () => {
    if (!importUploadPanel || !lastLocalImportUndoAction?.appliedMemoryRecordIds?.length) return;
    const importUndoEndpoint = importUploadPanel.getAttribute('data-import-undo-endpoint') || '';
    importUploadPanel.setAttribute('data-import-upload-state', 'undoing');
    try {
      if (importUndoEndpoint && window.location.protocol !== 'file:') {
        const response = await fetch(importUndoEndpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            appliedMemoryRecordIds: lastLocalImportUndoAction.appliedMemoryRecordIds,
          }),
        });
        if (!response.ok) throw new Error('import undo failed with ' + response.status);
        const body = await response.json().catch(() => ({}));
        renderUndoneImportFeedback(body.deletedCount || 0);
        lastLocalImportUndoAction = null;
        await rehydrateAppShellAfterImport();
      } else {
        renderUndoneImportFeedback(lastLocalImportUndoAction.appliedMemoryRecordIds.length);
        lastLocalImportUndoAction = null;
      }
      importUploadPanel.setAttribute('data-import-upload-state', 'undone');
      setInteractionState('import-undone');
    } catch (error) {
      importUploadPanel.setAttribute('data-import-upload-state', 'error');
      shell.setAttribute('data-import-upload-error', String(error?.message || error));
      setInteractionState('import-undo-error');
    }
  });

  memoryReviewModeButtons.forEach((button) => {
    button.addEventListener('click', () => setMemoryReviewMode(button.getAttribute('data-review-mode-target') || 'review'));
  });

  saveMemoryEdit?.addEventListener('click', async () => {
    if (!memoryReviewPanel) return;
    const memoryId = memoryReviewPanel.getAttribute('data-memory-review-selected-id') || '';
    const endpoint = memoryReviewPanel.getAttribute('data-memory-update-endpoint') || '';
    const shouldPersist = Boolean(memoryId && endpoint && window.location.protocol !== 'file:');
    memoryReviewPanel.setAttribute('data-memory-review-state', shouldPersist ? 'saving' : 'saved');
    if (shouldPersist) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({
            memoryId,
            summary: memoryEditSummary?.value || '',
            rawText: memoryEditRawText?.value || '',
          }),
        });
        if (!response.ok) throw new Error('memory update failed with ' + response.status);
        const body = await response.json().catch(() => ({}));
        const revisionId = body?.reviewLedgerEntry?.id || '';
        memoryReviewPanel.setAttribute('data-memory-review-ledger', revisionId ? 'recorded' : 'pending');
        memoryReviewPanel.setAttribute('data-memory-review-revision', revisionId);
        appendMemoryReviewComparison(body?.reviewLedgerEntry);
        await rehydrateAppShellAfterImport();
      } catch (error) {
        memoryReviewPanel.setAttribute('data-memory-review-state', 'error');
        shell.setAttribute('data-memory-review-error', String(error?.message || error));
        setInteractionState('memory-review-error');
        return;
      }
    }
    memoryReviewPanel.setAttribute('data-memory-review-state', 'saved');
    shell.setAttribute('data-last-edited-memory', memoryId);
    setInteractionState('memory-review-saved');
  });

  exportMemoryProvenance?.addEventListener('click', () => {
    void fetchMemoryProvenanceExport();
  });

  downloadMemoryProvenanceButton?.addEventListener('click', () => {
    void downloadMemoryProvenance();
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
  askWithRelatedMemoryButton?.addEventListener('click', askWithRelatedMemoryContext);
  replayWithRelatedMemoryButton?.addEventListener('click', replayWithRelatedMemoryContext);
  reportWithRelatedMemoryButton?.addEventListener('click', reportWithRelatedMemoryContext);
  runMemorySessionButton?.addEventListener('click', () => void runMemorySession());
  if (memoryNodes[2]) selectMemory(memoryNodes[2]);
  wireReviewComparisonButtons();
  initializeCytoscapeGraph();
  selectHandoffMemoryFromGraph(handoffMemoryId);
  void rehydrateHealthState();
  void rehydrateAppShellAfterImport();

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
      const nextMode = shell.getAttribute('data-layout-mode') === 'constellation' ? 'free' : 'constellation';
      setLayoutMode(nextMode);
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
      setLayoutMode('free');
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
