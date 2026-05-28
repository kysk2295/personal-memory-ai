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
    letter-spacing: 0;
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
    pointer-events: none;
    width: min(1180px, 100%);
    margin: 0 auto;
    border: 1px solid rgba(117, 122, 143, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 16px 36px rgba(165, 170, 197, 0.14);
    padding: 12px 14px;
    display: grid;
    grid-template-columns: minmax(250px, 0.62fr) minmax(0, 1.38fr) auto;
    gap: 14px;
    align-items: center;
  }
  .product-value-strip a,
  .product-value-strip button,
  .product-value-strip input,
  .product-value-strip textarea {
    pointer-events: auto;
  }
  .prototype-goal-copy {
    min-width: 0;
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
  .guided-service-flow {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    border: 1px solid rgba(225, 29, 63, 0.18);
    border-radius: 8px;
    background: rgba(255, 247, 249, 0.82);
    padding: 9px;
  }
  .guided-flow-steps {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .guided-flow-steps li {
    min-width: 0;
    border: 1px solid rgba(225, 29, 63, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.7);
    padding: 7px;
  }
  .guided-flow-steps li[data-guided-flow-state="active"] {
    border-color: rgba(225, 29, 63, 0.38);
    background: rgba(225, 29, 63, 0.1);
  }
  .guided-flow-steps li[data-guided-flow-state="done"] {
    border-color: rgba(20, 184, 166, 0.28);
    background: rgba(20, 184, 166, 0.1);
  }
  .guided-flow-steps strong,
  .guided-flow-steps span {
    display: block;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .guided-flow-steps strong {
    color: #6f1730;
    font-size: 11px;
    line-height: 1.22;
  }
  .guided-flow-steps span {
    margin-top: 2px;
    color: #80535d;
    font-size: 10px;
    line-height: 1.25;
  }
  .guided-flow-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(88px, 1fr));
    gap: 6px;
  }
  .guided-flow-actions a,
  .guided-flow-actions button {
    min-height: 32px;
    border: 1px solid rgba(225, 29, 63, 0.24);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.76);
    color: #9f1239;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 800;
    text-align: center;
    text-decoration: none;
  }
  .guided-flow-actions [data-guided-flow-action="start-capture"] {
    background: #e11d3f;
    color: #ffffff;
  }
  .prototype-journey-cockpit {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(130px, 0.44fr) minmax(0, 1fr) minmax(130px, 0.46fr);
    gap: 8px;
    align-items: stretch;
    border: 1px solid rgba(97, 102, 125, 0.15);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.88);
    padding: 9px;
  }
  .journey-cockpit-head,
  .journey-cockpit-next {
    display: grid;
    gap: 4px;
    min-width: 0;
    align-content: center;
  }
  .journey-cockpit-head strong,
  .journey-cockpit-head span,
  .journey-cockpit-next strong,
  .journey-cockpit-next span,
  .journey-cockpit-signals span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .journey-cockpit-head strong,
  .journey-cockpit-next strong {
    color: #4f5363;
    font-size: 12px;
  }
  .journey-cockpit-head span,
  .journey-cockpit-next span {
    color: #757b8d;
    font-size: 10px;
  }
  .journey-cockpit-signals {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    min-width: 0;
  }
  .journey-cockpit-signals span {
    border: 1px solid rgba(97, 102, 125, 0.12);
    border-radius: 8px;
    background: rgba(246, 247, 252, 0.82);
    color: #62697a;
    padding: 7px;
    font-size: 10px;
    font-weight: 760;
  }
  .journey-cockpit-actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }
  .journey-cockpit-actions a,
  .journey-cockpit-actions button {
    min-height: 32px;
    border: 1px solid rgba(225, 29, 63, 0.2);
    border-radius: 8px;
    background: rgba(225, 29, 63, 0.08);
    color: #9f1239;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 800;
    text-align: center;
    text-decoration: none;
  }
  .journey-cockpit-actions [data-journey-primary-action="capture"] {
    background: #e11d3f;
    color: #ffffff;
  }
  .prototype-entry-dock {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(190px, 0.85fr) minmax(180px, 0.72fr) minmax(220px, 1fr);
    gap: 8px;
    align-items: stretch;
  }
  .entry-dock-action,
  .entry-dock-note {
    min-width: 0;
    border: 1px solid rgba(117, 122, 143, 0.14);
    border-radius: 8px;
    background: rgba(246, 247, 252, 0.74);
    color: #616779;
    padding: 9px 10px;
    text-decoration: none;
    font: inherit;
    font-size: 12px;
    line-height: 1.38;
    text-align: left;
  }
  .entry-dock-action strong,
  .entry-dock-note strong {
    display: block;
    color: #515668;
    font-size: 12px;
    line-height: 1.25;
  }
  .entry-dock-action.primary {
    border-color: rgba(225, 29, 63, 0.3);
    background: rgba(225, 29, 63, 0.1);
    color: #be123c;
  }
  .entry-dock-action.primary strong { color: #be123c; }
  .memory-intake-hub {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(190px, 0.7fr) minmax(0, 1.3fr);
    gap: 10px;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 8px;
    background: rgba(240, 253, 250, 0.72);
    padding: 10px;
  }
  .memory-intake-copy {
    min-width: 0;
    display: grid;
    gap: 4px;
    align-content: center;
  }
  .memory-intake-copy strong {
    color: #0f766e;
    font-size: 13px;
    line-height: 1.2;
  }
  .memory-intake-copy span {
    color: #57716d;
    font-size: 11px;
    line-height: 1.45;
  }
  .memory-intake-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }
  .memory-intake-draft {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: stretch;
  }
  .memory-intake-draft label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
  .memory-intake-draft textarea {
    min-width: 0;
    min-height: 58px;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.76);
    color: #33524d;
    padding: 8px 9px;
    font: inherit;
    font-size: 11px;
    line-height: 1.4;
    resize: none;
  }
  .memory-intake-draft-actions {
    display: grid;
    gap: 6px;
    align-content: stretch;
  }
  .memory-intake-notion-actions {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 7px;
  }
  .memory-intake-draft-actions button {
    min-width: 92px;
  }
  .memory-intake-notion-actions button {
    min-width: 0;
  }
  .diary-graph-handoff-map {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(150px, 0.48fr);
    gap: 8px;
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.66);
    padding: 8px 9px;
  }
  .handoff-route-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    min-width: 0;
  }
  .handoff-route {
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.14);
    border-radius: 8px;
    background: rgba(240, 253, 250, 0.72);
    padding: 7px;
  }
  .handoff-route[data-handoff-route-state="active"],
  .handoff-route[data-handoff-route-state="done"] {
    border-color: rgba(225, 29, 63, 0.28);
    background: rgba(225, 29, 63, 0.08);
  }
  .handoff-route strong,
  .handoff-route span,
  .handoff-status-grid strong,
  .handoff-status-grid span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .handoff-route strong {
    color: #0f766e;
    font-size: 10px;
  }
  .handoff-route span {
    margin-top: 2px;
    color: #57716d;
    font-size: 9px;
  }
  .handoff-status-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 5px;
    min-width: 0;
  }
  .handoff-status-grid span {
    border: 1px solid rgba(20, 184, 166, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.68);
    color: #57716d;
    padding: 5px 6px;
    font-size: 9px;
    font-weight: 760;
  }
  .memory-intake-draft-actions button,
  .memory-intake-notion-actions button {
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 8px;
    background: rgba(20, 184, 166, 0.1);
    color: #0f766e;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 780;
  }
  .memory-intake-result {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 8px;
    align-items: center;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.68);
    padding: 8px 9px;
  }
  .memory-intake-result strong,
  .memory-intake-result span {
    display: block;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .memory-intake-result strong {
    color: #0f766e;
    font-size: 12px;
    line-height: 1.25;
  }
  .memory-intake-result span {
    margin-top: 2px;
    color: #57716d;
    font-size: 11px;
    line-height: 1.4;
  }
  .memory-intake-result button {
    min-width: 104px;
    min-height: 34px;
    border: 1px solid rgba(225, 29, 63, 0.26);
    border-radius: 8px;
    background: rgba(225, 29, 63, 0.1);
    color: #be123c;
    padding: 7px 9px;
    font-size: 11px;
    font-weight: 780;
  }
  .memory-intake-result button:disabled {
    opacity: 0.42;
    color: #57716d;
    border-color: rgba(20, 184, 166, 0.18);
    background: rgba(20, 184, 166, 0.06);
  }
  .memory-intake-flow-tracker {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 6px;
    margin: 2px 0;
    padding: 0;
    list-style: none;
  }
  .memory-intake-flow-tracker li {
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.6);
    color: #57716d;
    padding: 6px 7px;
  }
  .memory-intake-flow-tracker span {
    margin: 0;
    color: #66807b;
    font-size: 9px;
    font-weight: 800;
  }
  .memory-intake-flow-tracker strong {
    margin-top: 2px;
    color: #134e4a;
    font-size: 10px;
    line-height: 1.2;
  }
  .memory-intake-flow-tracker li[data-intake-flow-state="ready"],
  .memory-intake-flow-tracker li[data-intake-flow-state="loading"] {
    border-color: rgba(225, 29, 63, 0.24);
    background: rgba(225, 29, 63, 0.08);
  }
  .memory-intake-flow-tracker li[data-intake-flow-state="done"] {
    border-color: rgba(20, 184, 166, 0.26);
    background: rgba(20, 184, 166, 0.12);
  }
  .memory-intake-flow-tracker li[data-intake-flow-state="error"] {
    border-color: rgba(190, 18, 60, 0.34);
    background: rgba(190, 18, 60, 0.1);
  }
  .flow-coach {
    grid-column: 1 / -1;
    display: grid;
    gap: 6px;
    border: 1px solid rgba(20, 184, 166, 0.22);
    border-radius: 8px;
    background: rgba(20, 184, 166, 0.08);
    padding: 10px;
  }
  .flow-coach strong,
  .flow-coach span {
    display: block;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .flow-coach strong {
    color: #0f766e;
    font-size: 12px;
    line-height: 1.25;
  }
  .flow-coach span {
    color: #315f5a;
    font-size: 11px;
    line-height: 1.35;
  }
  .flow-coach-steps {
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    margin: 2px 0 0;
    padding: 0;
    list-style: none;
  }
  .flow-coach-steps li {
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.62);
    color: #134e4a;
    padding: 4px 7px;
    font-size: 10px;
    font-weight: 780;
  }
  .flow-coach[data-flow-coach-stage="saved"] {
    border-color: rgba(225, 29, 63, 0.22);
    background: rgba(225, 29, 63, 0.08);
  }
  .capture-handoff-banner {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    border: 1px solid rgba(225, 29, 63, 0.22);
    border-radius: 8px;
    background: rgba(225, 29, 63, 0.08);
    padding: 10px;
  }
  .capture-handoff-banner strong,
  .capture-handoff-banner span {
    display: block;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  .capture-handoff-banner strong {
    color: #be123c;
    font-size: 12px;
    line-height: 1.25;
  }
  .capture-handoff-banner span {
    margin-top: 2px;
    color: #82515b;
    font-size: 11px;
    line-height: 1.35;
  }
  .capture-handoff-banner button {
    min-width: 98px;
    min-height: 34px;
    border: 1px solid rgba(225, 29, 63, 0.28);
    border-radius: 8px;
    background: rgba(225, 29, 63, 0.12);
    color: #be123c;
    padding: 7px 9px;
    font-size: 11px;
    font-weight: 780;
  }
  .capture-handoff-actions {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 7px;
  }
  .capture-handoff-reentry {
    grid-column: 1 / -1;
    display: none;
    align-items: center;
    gap: 8px;
    min-width: 0;
    border-top: 1px solid rgba(225, 29, 63, 0.16);
    padding-top: 8px;
  }
  .capture-handoff-reentry span {
    flex: 1 1 150px;
    margin: 0;
    color: #7f1d1d;
    font-weight: 760;
  }
  .capture-handoff-reentry a {
    flex: 0 0 auto;
    border: 1px solid rgba(225, 29, 63, 0.24);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    color: #9f1239;
    padding: 7px 9px;
    font-size: 11px;
    font-weight: 780;
    text-decoration: none;
  }
  .capture-handoff-banner[data-capture-handoff-reentry-state="ready"] .capture-handoff-reentry {
    display: flex;
  }
  .capture-handoff-banner[data-capture-handoff-banner-state="idle"] {
    display: none;
  }
  .memory-intake-related-bundle {
    grid-column: 1 / -1;
    display: grid;
    gap: 7px;
    min-width: 0;
  }
  .memory-intake-related-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    color: #0f766e;
  }
  .memory-intake-related-heading strong {
    color: #134e4a;
  }
  .memory-intake-related-list {
    display: flex;
    gap: 6px;
    overflow: hidden;
  }
  .memory-intake-related-chip {
    flex: 1 1 0;
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.74);
    padding: 6px 7px;
    text-align: left;
    color: #33524d;
  }
  .memory-intake-related-chip strong,
  .memory-intake-related-chip span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .memory-intake-related-chip strong {
    color: #123b39;
    font-size: 10px;
  }
  .memory-intake-related-chip span {
    margin-top: 2px;
    color: #5f7f78;
    font-size: 9px;
  }
  .memory-intake-related-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }
  .memory-intake-related-actions button {
    min-width: 0;
    min-height: 30px;
    border-color: rgba(20, 184, 166, 0.2);
    background: rgba(20, 184, 166, 0.1);
    color: #0f766e;
    padding: 6px 7px;
    font-size: 10px;
    white-space: nowrap;
  }
  .memory-intake-action {
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.74);
    color: #0f766e;
    padding: 8px 9px;
    text-align: left;
    text-decoration: none;
    font: inherit;
    font-size: 11px;
    line-height: 1.3;
  }
  .memory-intake-action strong,
  .memory-intake-action span {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .memory-intake-action strong {
    white-space: nowrap;
  }
  .memory-intake-action span {
    margin-top: 2px;
    color: #5e7773;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }
  .memory-intake-action.primary {
    border-color: rgba(225, 29, 63, 0.26);
    background: rgba(225, 29, 63, 0.1);
    color: #be123c;
  }
  .memory-intake-action.primary span {
    color: #9f5c6a;
  }
  .first-run-guide {
    grid-column: 1 / -1;
    border: 1px solid rgba(84, 91, 113, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.82);
    padding: 10px;
    display: grid;
    grid-template-columns: minmax(150px, 0.5fr) minmax(0, 1.5fr);
    gap: 10px;
    align-items: stretch;
  }
  .first-run-guide-status {
    min-width: 0;
    border-right: 1px solid rgba(84, 91, 113, 0.12);
    padding-right: 10px;
    display: grid;
    gap: 5px;
    align-content: center;
  }
  .first-run-guide-status strong {
    color: #4f5363;
    font-size: 12px;
    line-height: 1.25;
  }
  .first-run-guide-status span {
    color: #73798a;
    font-size: 11px;
    line-height: 1.3;
  }
  .first-run-actions {
    min-width: 0;
    display: grid;
    grid-template-columns: repeat(5, minmax(92px, 1fr));
    gap: 6px;
  }
  .first-run-action {
    min-width: 0;
    min-height: 54px;
    border: 1px solid rgba(117, 122, 143, 0.14);
    border-radius: 8px;
    background: rgba(246, 247, 252, 0.8);
    color: #555b6d;
    font: inherit;
    font-size: 11px;
    line-height: 1.25;
    font-weight: 780;
    text-align: left;
    padding: 8px;
    cursor: pointer;
  }
  .first-run-action.primary {
    border-color: rgba(225, 29, 63, 0.3);
    background: rgba(225, 29, 63, 0.09);
    color: #be123c;
  }
  .first-run-action[data-guide-state="ready"]::after {
    content: "ready";
    display: block;
    margin-top: 4px;
    color: #6f788b;
    font-size: 9px;
    font-weight: 760;
    text-transform: uppercase;
  }
  .service-flow-steps {
    min-width: 0;
    margin: 0;
    padding: 0;
    list-style: none;
    display: grid;
    grid-template-columns: repeat(6, minmax(86px, 1fr));
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
    grid-template-columns: minmax(0, 1fr) minmax(300px, 360px);
    gap: 16px;
    align-items: stretch;
  }
  .graph-stage {
    position: relative;
    min-height: 680px;
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
    border-radius: 8px;
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
    max-width: 470px;
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    align-items: center;
    color: #6f7688;
    font-size: 11px;
    line-height: 1.35;
  }
  .wiki-compiler-strip strong { color: #5d6272; }
  .wiki-node-chip {
    border: 1px solid rgba(114, 120, 144, 0.12);
    border-radius: 8px;
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
    right: auto;
    left: 28px;
    bottom: 28px;
    z-index: 3;
    width: min(430px, calc(100% - 56px));
    border: 1px solid rgba(120, 126, 149, 0.16);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(14px);
    box-shadow: 0 16px 42px rgba(175, 180, 206, 0.2);
    padding: 16px;
  }
  .memory-inspector h2 {
    margin: 6px 0 8px;
    font-size: 21px;
    line-height: 1.08;
    letter-spacing: 0;
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
  .related-memory-strip .related-memory-action {
    min-width: 0;
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
    border-radius: 8px;
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
  .selected-memory-path-panel {
    position: relative;
    grid-column: 1 / -1;
    z-index: 2;
    display: grid;
    grid-template-columns: minmax(220px, 0.75fr) minmax(260px, 1fr) auto;
    gap: 12px;
    align-items: stretch;
    border: 1px solid rgba(120, 126, 149, 0.15);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.93);
    box-shadow: 0 10px 26px rgba(132, 138, 164, 0.13);
    backdrop-filter: blur(14px);
    padding: 12px;
  }
  .selected-path-current,
  .selected-path-related,
  .selected-path-actions {
    min-width: 0;
  }
  .selected-path-current h3 {
    margin: 3px 0 6px;
    color: #555b6e;
    font-size: 16px;
    line-height: 1.2;
  }
  .selected-path-current p,
  .selected-path-related p {
    margin: 0;
    color: #7a8092;
    font-size: 11px;
    line-height: 1.45;
  }
  .selected-path-related-list {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 7px;
  }
  .selected-path-related-chip {
    display: inline-grid;
    gap: 2px;
    min-width: 0;
    max-width: 180px;
    border: 1px solid rgba(20, 184, 166, 0.18);
    border-radius: 8px;
    background: rgba(240, 253, 250, 0.86);
    color: #0f766e;
    padding: 6px 7px;
    text-align: left;
    font-size: 10px;
    line-height: 1.2;
  }
  .selected-path-related-chip strong,
  .selected-path-related-chip span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .selected-path-related-chip span {
    color: #5f6f6b;
  }
  .selected-path-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(86px, 1fr));
    gap: 7px;
    align-content: center;
  }
  .selected-path-action {
    border: 1px solid rgba(97, 102, 125, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.78);
    color: #5e6374;
    padding: 7px 8px;
    font-size: 11px;
    font-weight: 780;
  }
  .selected-path-action.primary {
    border-color: rgba(225, 29, 63, 0.28);
    background: #e11d3f;
    color: #ffffff;
  }
  .selected-command-rail {
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 18px;
    z-index: 5;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
    border: 1px solid rgba(97, 102, 125, 0.15);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.91);
    box-shadow: 0 16px 36px rgba(132, 138, 164, 0.16);
    backdrop-filter: blur(14px);
    padding: 10px 12px;
  }
  .selected-command-copy {
    min-width: 0;
    display: grid;
    gap: 3px;
  }
  .selected-command-copy strong,
  .selected-command-copy span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .selected-command-copy strong {
    color: #4f5363;
    font-size: 12px;
    line-height: 1.25;
  }
  .selected-command-copy span {
    color: #72798c;
    font-size: 11px;
  }
  .selected-command-actions {
    display: grid;
    grid-template-columns: repeat(4, minmax(62px, 1fr));
    gap: 6px;
  }
  .selected-command-action {
    min-height: 32px;
    border: 1px solid rgba(20, 184, 166, 0.2);
    border-radius: 8px;
    background: rgba(20, 184, 166, 0.08);
    color: #0f766e;
    padding: 6px 8px;
    font-size: 10px;
    font-weight: 780;
  }
  .selected-command-action.primary {
    border-color: rgba(225, 29, 63, 0.28);
    background: #e11d3f;
    color: #ffffff;
  }
  .memory-path-explainer {
    grid-column: 1 / -1;
    display: grid;
    gap: 8px;
    min-width: 0;
    border: 1px solid rgba(143, 128, 255, 0.16);
    border-radius: 8px;
    background: rgba(248, 247, 255, 0.82);
    padding: 9px 10px;
  }
  .memory-path-explainer strong,
  .memory-path-explainer span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .memory-path-explainer > strong {
    color: #6255d7;
    font-size: 12px;
    line-height: 1.25;
  }
  .memory-path-hops {
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(110px, 0.7fr) minmax(0, 1fr) minmax(96px, 0.56fr);
    gap: 6px;
  }
  .memory-path-hop {
    display: grid;
    gap: 2px;
    min-width: 0;
    border: 1px solid rgba(97, 102, 125, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.72);
    padding: 6px 7px;
  }
  .memory-path-hop span {
    color: #8b91a1;
    font-size: 9px;
    font-weight: 800;
  }
  .memory-path-hop strong {
    color: #555b6e;
    font-size: 10px;
    line-height: 1.25;
  }
  .related-memory-workbench {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(180px, 0.54fr) minmax(0, 1fr) minmax(150px, 0.44fr);
    gap: 8px;
    min-width: 0;
    border: 1px solid rgba(225, 29, 63, 0.14);
    border-radius: 8px;
    background: rgba(255, 247, 248, 0.82);
    padding: 9px 10px;
  }
  .related-workbench-summary,
  .related-workbench-list,
  .related-workbench-actions {
    min-width: 0;
  }
  .related-workbench-summary {
    display: grid;
    gap: 4px;
    align-content: start;
  }
  .related-workbench-summary strong,
  .related-workbench-summary span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .related-workbench-summary strong {
    color: #9f1239;
    font-size: 12px;
  }
  .related-workbench-summary span {
    color: #7b6670;
    font-size: 10px;
  }
  .related-workbench-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    max-height: 102px;
    overflow: auto;
  }
  .related-workbench-item {
    display: grid;
    gap: 3px;
    min-width: 0;
    border: 1px solid rgba(225, 29, 63, 0.14);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.76);
    color: #555b6e;
    padding: 7px;
    text-align: left;
    cursor: pointer;
  }
  .related-workbench-item[data-related-workbench-active="true"] {
    border-color: rgba(225, 29, 63, 0.34);
    background: rgba(255, 228, 233, 0.9);
  }
  .related-workbench-item strong,
  .related-workbench-item span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .related-workbench-item strong {
    color: #9f1239;
    font-size: 10px;
  }
  .related-workbench-item span {
    color: #7f4b56;
    font-size: 10px;
  }
  .related-workbench-actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    align-content: start;
  }
  .related-workbench-actions button {
    min-height: 31px;
    border: 1px solid rgba(225, 29, 63, 0.22);
    border-radius: 8px;
    background: rgba(225, 29, 63, 0.08);
    color: #9f1239;
    font-size: 10px;
    font-weight: 780;
    cursor: pointer;
  }
  .related-insight-bridge {
    grid-column: 1 / -1;
    display: grid;
    gap: 8px;
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.16);
    border-radius: 8px;
    background: rgba(240, 253, 250, 0.78);
    padding: 9px 10px;
  }
  .related-insight-bridge > strong {
    color: #0f766e;
    font-size: 12px;
  }
  .related-insight-reason-list {
    display: grid;
    gap: 6px;
  }
  .related-insight-reason {
    display: grid;
    gap: 3px;
    min-width: 0;
    border: 1px solid rgba(20, 184, 166, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.76);
    padding: 7px;
  }
  .related-insight-reason strong,
  .related-insight-reason span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .related-insight-reason strong {
    color: #234e49;
    font-size: 11px;
  }
  .related-insight-reason span {
    color: #60716f;
    font-size: 10px;
  }
  .related-insight-actions {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
  }
  .related-insight-actions button {
    min-height: 32px;
    border: 1px solid rgba(20, 184, 166, 0.24);
    border-radius: 8px;
    background: rgba(20, 184, 166, 0.1);
    color: #0f766e;
    font-size: 11px;
    font-weight: 760;
    cursor: pointer;
  }
  .grounded-action-result {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(120px, 0.42fr) minmax(0, 1fr);
    gap: 8px;
    min-width: 0;
    border: 1px solid rgba(225, 29, 63, 0.16);
    border-radius: 8px;
    background: rgba(255, 241, 243, 0.78);
    padding: 9px 10px;
  }
  .grounded-action-result strong,
  .grounded-action-result span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .grounded-action-result strong {
    color: #9f1239;
    font-size: 12px;
  }
  .grounded-action-result span {
    color: #7f4b56;
    font-size: 11px;
  }
  .grounded-action-result[data-grounded-action-state="ready"] {
    border-color: rgba(225, 29, 63, 0.3);
    background: rgba(255, 228, 233, 0.88);
  }
  .grounded-action-saveback {
    grid-column: 1 / -1;
    min-height: 34px;
    border: 1px solid rgba(225, 29, 63, 0.28);
    border-radius: 8px;
    background: #e11d3f;
    color: #ffffff;
    font-size: 12px;
    font-weight: 800;
    cursor: pointer;
  }
  .grounded-action-saveback[data-grounded-action-save-state="saved"] {
    background: rgba(20, 184, 166, 0.16);
    border-color: rgba(20, 184, 166, 0.32);
    color: #0f766e;
  }
  .selected-ai-action-center {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(150px, 0.48fr) minmax(0, 1fr) minmax(140px, 0.42fr);
    gap: 8px;
    align-items: stretch;
    min-width: 0;
    border: 1px solid rgba(97, 102, 125, 0.15);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.84);
    padding: 9px 10px;
  }
  .action-center-copy,
  .action-center-save {
    display: grid;
    gap: 4px;
    min-width: 0;
    align-content: center;
  }
  .action-center-copy strong,
  .action-center-copy span,
  .action-center-save span,
  .action-center-state-grid span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .action-center-copy strong {
    color: #555b6e;
    font-size: 12px;
  }
  .action-center-copy span,
  .action-center-save span {
    color: #777e91;
    font-size: 10px;
  }
  .action-center-state-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 6px;
    min-width: 0;
  }
  .action-center-state-grid span {
    border: 1px solid rgba(97, 102, 125, 0.13);
    border-radius: 8px;
    background: rgba(246, 247, 251, 0.86);
    color: #5f6678;
    padding: 7px 8px;
    font-size: 10px;
    font-weight: 760;
    text-align: center;
  }
  .action-center-state-grid span[data-action-center-state-value="ready"],
  .action-center-state-grid span[data-action-center-state-value="running"] {
    border-color: rgba(225, 29, 63, 0.24);
    background: rgba(255, 241, 243, 0.9);
    color: #9f1239;
  }
  .action-center-state-grid span[data-action-center-state-value="answered"],
  .action-center-state-grid span[data-action-center-state-value="saved"] {
    border-color: rgba(20, 184, 166, 0.24);
    background: rgba(240, 253, 250, 0.9);
    color: #0f766e;
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
    z-index: 7;
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-height: calc(100vh - 172px);
    overflow: auto;
    padding: 2px 2px 18px;
  }
  .product-rail::before {
    content: "AI 세션과 근거";
    position: sticky;
    top: 0;
    z-index: 2;
    display: block;
    border: 1px solid rgba(117, 122, 143, 0.16);
    border-radius: 8px;
    background: rgba(15, 16, 20, 0.94);
    color: #f3f4f8;
    padding: 9px 11px;
    font-size: 12px;
    font-weight: 780;
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
  .memory-session-steps strong[data-session-status-label] {
    color: #0f766e;
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
  .service-flow-steps li,
  .diary-inbox,
  .diary-inbox-item,
  .memory-intake-hub,
  .memory-intake-action {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
  }
  .diary-inbox {
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: minmax(150px, 0.55fr) minmax(0, 1fr);
    gap: 8px;
    padding: 8px;
    border-radius: 8px;
  }
  .diary-inbox-heading {
    display: grid;
    gap: 4px;
    min-width: 0;
  }
  .diary-inbox-heading strong {
    color: #f0f0f2;
    font-size: 12px;
  }
  .diary-inbox-heading span {
    color: #a7a7ad;
    font-size: 11px;
    line-height: 1.35;
  }
  .diary-inbox-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 6px;
    min-width: 0;
  }
  .diary-inbox-item {
    display: grid;
    gap: 4px;
    min-height: 56px;
    padding: 7px;
    border: 1px solid;
    border-radius: 8px;
    color: #d7d7db;
    text-align: left;
    cursor: pointer;
  }
  .diary-inbox-item strong,
  .diary-inbox-item span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .diary-inbox-item strong {
    color: #f0f0f2;
    font-size: 11px;
  }
  .diary-inbox-item span {
    color: #9f9fa5;
    font-size: 10px;
  }
  .diary-inbox-item[data-diary-inbox-active="true"] {
    border-color: rgba(214, 31, 60, 0.48);
    background: rgba(214, 31, 60, 0.13);
  }
  .memory-intake-draft textarea,
  .memory-intake-draft-actions button {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
    color: #f0f0f2;
  }
  .memory-intake-draft textarea::placeholder {
    color: #8c8c92;
  }
  .memory-intake-copy strong,
  .memory-intake-action {
    color: #f0f0f2;
  }
  .memory-intake-copy span,
  .memory-intake-action span {
    color: #aaaab1;
  }
  .diary-graph-handoff-map,
  .handoff-route,
  .handoff-status-grid span {
    border-color: rgba(255, 255, 255, 0.08);
    background: rgba(255, 255, 255, 0.055);
  }
  .handoff-route strong {
    color: #f0f0f2;
  }
  .handoff-route span,
  .handoff-status-grid span {
    color: #aaaab1;
  }
  .handoff-route[data-handoff-route-state="active"],
  .handoff-route[data-handoff-route-state="done"] {
    border-color: rgba(214, 31, 60, 0.34);
    background: rgba(214, 31, 60, 0.12);
  }
  .memory-intake-action.primary {
    border-color: rgba(214, 31, 60, 0.34);
    background: rgba(214, 31, 60, 0.12);
    color: #ff8797;
  }
  .memory-intake-action.primary span {
    color: #d7a7af;
  }
  .service-flow-steps strong {
    color: #f0f0f2;
  }
  .service-flow-steps span {
    color: #a7a7ad;
  }
  .product-value-strip[data-command-shelf="graph-led"] {
    position: fixed;
    z-index: 9;
    pointer-events: auto;
    top: 84px;
    left: 18px;
    width: min(248px, calc(100vw - 36px));
    max-height: calc(100vh - 96px);
    grid-template-columns: 1fr;
    gap: 9px;
    overflow: auto;
    scrollbar-width: thin;
  }
  .product-value-strip[data-command-shelf="graph-led"] .prototype-goal-copy p:not(.eyebrow) {
    display: none;
  }
  .product-value-strip[data-command-shelf="graph-led"] .service-flow-steps {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .product-value-strip[data-command-shelf="graph-led"] .guided-service-flow {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .product-value-strip[data-command-shelf="graph-led"] .guided-flow-steps {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .guided-flow-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .product-value-strip[data-command-shelf="graph-led"] .prototype-journey-cockpit {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .journey-cockpit-signals {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .product-value-strip[data-command-shelf="graph-led"] .journey-cockpit-actions {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] {
    max-height: min(620px, calc(100vh - 96px));
  }
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] .service-flow-steps,
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] .privacy-actions,
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] .prototype-entry-dock,
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] .first-run-guide,
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] .flow-coach {
    display: none;
  }
  .product-value-strip[data-command-shelf="graph-led"][data-flow-collapsed="true"] .guided-flow-steps {
    grid-template-columns: repeat(5, minmax(0, 1fr));
  }
  .product-value-strip[data-command-shelf="graph-led"] .service-flow-steps li {
    min-height: 48px;
    padding: 7px;
  }
  .product-value-strip[data-command-shelf="graph-led"] .diary-inbox {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .diary-inbox-list {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .diary-inbox-heading span {
    display: none;
  }
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-hub {
    grid-template-columns: 1fr;
    gap: 8px;
  }
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-copy span,
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-action span {
    display: none;
  }
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-actions,
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-notion-actions {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .diary-graph-handoff-map,
  .product-value-strip[data-command-shelf="graph-led"] .handoff-route-list {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-draft {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-draft textarea {
    min-height: 52px;
  }
  .product-value-strip[data-command-shelf="graph-led"] .memory-intake-result {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .prototype-entry-dock[data-entry-dock="diary-start"],
  .product-value-strip[data-command-shelf="graph-led"] .first-run-guide[data-first-run-guide="diary-memory-ai"] {
    margin-top: 0;
    padding: 6px;
    background: rgba(255, 255, 255, 0.035);
  }
  .product-value-strip[data-command-shelf="graph-led"] .prototype-entry-dock[data-entry-dock="diary-start"] {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .first-run-guide[data-first-run-guide="diary-memory-ai"] {
    grid-template-columns: 1fr;
  }
  .product-value-strip[data-command-shelf="graph-led"] .first-run-guide-status {
    border-right: 0;
    padding-right: 0;
  }
  .product-value-strip[data-command-shelf="graph-led"] .first-run-actions {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .product-value-strip[data-command-shelf="graph-led"] .entry-dock-note,
  .product-value-strip[data-command-shelf="graph-led"] .first-run-guide-status span,
  .product-value-strip[data-command-shelf="graph-led"] .first-run-action[data-guide-state="ready"]::after {
    display: none;
  }
  .product-value-strip[data-command-shelf="graph-led"] + .product-main-grid .graph-stage {
    min-height: calc(100vh - 128px);
  }
  .product-main-grid {
    width: 100%;
    margin: 0;
    display: block;
    min-height: calc(100vh - 38px);
  }
  .selected-memory-path-panel {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(18, 18, 21, 0.86);
    box-shadow: 0 14px 34px rgba(0, 0, 0, 0.24);
    grid-template-columns: minmax(180px, 0.76fr) minmax(220px, 1fr) 180px;
    gap: 9px;
    padding: 10px;
  }
  .selected-path-current h3 {
    color: #f0f0f2;
    font-size: 14px;
  }
  .selected-path-current p,
  .selected-path-related p {
    color: #b8b8be;
    font-size: 10px;
  }
  .selected-path-current [data-selected-path-source] {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .selected-path-related-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: 76px;
    overflow: auto;
  }
  .selected-path-related-chip {
    border-color: rgba(20, 184, 166, 0.28);
    background: rgba(20, 184, 166, 0.11);
    color: #91f0e4;
    max-width: none;
    padding: 5px 6px;
  }
  .selected-path-related-chip span {
    color: #a7c9c4;
  }
  .memory-path-explainer {
    border-color: rgba(143, 128, 255, 0.2);
    background: rgba(18, 18, 26, 0.78);
  }
  .memory-path-explainer > strong {
    color: #c7bfff;
  }
  .memory-path-hop {
    border-color: rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.06);
  }
  .memory-path-hop span {
    color: #9a94ce;
  }
  .memory-path-hop strong {
    color: #f0f0f2;
  }
  .related-memory-workbench {
    border-color: rgba(225, 29, 63, 0.24);
    background: rgba(37, 15, 20, 0.78);
  }
  .related-workbench-summary strong,
  .related-workbench-item strong {
    color: #ff9aaa;
  }
  .related-workbench-summary span,
  .related-workbench-item span {
    color: #d8a8af;
  }
  .related-workbench-item {
    border-color: rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.06);
    color: #f0f0f2;
  }
  .related-workbench-item[data-related-workbench-active="true"] {
    border-color: rgba(225, 29, 63, 0.4);
    background: rgba(225, 29, 63, 0.16);
  }
  .related-workbench-actions button {
    border-color: rgba(225, 29, 63, 0.28);
    background: rgba(225, 29, 63, 0.13);
    color: #ffb4c0;
  }
  .related-insight-bridge {
    border-color: rgba(20, 184, 166, 0.2);
    background: rgba(10, 25, 23, 0.78);
  }
  .related-insight-bridge > strong {
    color: #9bf2e8;
  }
  .related-insight-reason {
    border-color: rgba(255, 255, 255, 0.09);
    background: rgba(255, 255, 255, 0.06);
  }
  .related-insight-reason strong {
    color: #f0f0f2;
  }
  .related-insight-reason span {
    color: #a7c9c4;
  }
  .related-insight-actions button {
    border-color: rgba(20, 184, 166, 0.26);
    background: rgba(20, 184, 166, 0.12);
    color: #9bf2e8;
  }
  .grounded-action-result {
    border-color: rgba(225, 29, 63, 0.22);
    background: rgba(38, 14, 19, 0.78);
  }
  .grounded-action-result strong {
    color: #ff9aaa;
  }
  .grounded-action-result span {
    color: #d8a8af;
  }
  .grounded-action-saveback[data-grounded-action-save-state="saved"] {
    color: #9bf2e8;
  }
  .selected-ai-action-center {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.065);
  }
  .action-center-copy strong {
    color: #f0f0f2;
  }
  .action-center-copy span,
  .action-center-save span {
    color: #b8bdc9;
  }
  .action-center-state-grid span {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.06);
    color: #d4d7df;
  }
  .action-center-state-grid span[data-action-center-state-value="ready"],
  .action-center-state-grid span[data-action-center-state-value="running"] {
    border-color: rgba(225, 29, 63, 0.3);
    background: rgba(225, 29, 63, 0.14);
    color: #ffb4c0;
  }
  .action-center-state-grid span[data-action-center-state-value="answered"],
  .action-center-state-grid span[data-action-center-state-value="saved"] {
    border-color: rgba(20, 184, 166, 0.28);
    background: rgba(20, 184, 166, 0.13);
    color: #9bf2e8;
  }
  .selected-path-action {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.065);
    color: #f0f0f2;
    padding: 6px 7px;
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
    position: relative;
    right: auto;
    bottom: auto;
    z-index: 12;
    width: 100%;
    max-height: calc(100vh - 172px);
    overflow: auto;
    padding: 0 8px 10px;
    border: 1px solid rgba(214, 31, 60, 0.3);
    border-radius: 8px;
    background: rgba(12, 12, 12, 0.9);
    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.46);
    transform: none;
    transition: transform 180ms ease, background 180ms ease, border-color 180ms ease;
  }
  .product-rail:hover,
  .product-rail:focus-within {
    transform: none;
    background: rgba(13, 13, 13, 0.96);
  }
  .product-rail::before {
    content: "AI 세션과 근거";
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
    .product-value-strip[data-command-shelf="graph-led"] {
      position: relative;
      top: auto;
      left: auto;
      width: calc(100% - 20px);
      max-height: none;
      margin: 12px auto 0;
    }
    .product-main-grid { grid-template-columns: 1fr; }
    .graph-stage {
      min-height: 520px;
      height: 520px;
      padding-top: 74px;
    }
    .selected-memory-path-panel {
      grid-template-columns: 1fr;
    }
    .related-memory-workbench {
      grid-template-columns: 1fr;
    }
    .selected-ai-action-center {
      grid-template-columns: 1fr;
    }
    .related-workbench-list {
      grid-template-columns: 1fr;
      max-height: 128px;
    }
    .memory-path-hops {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .selected-path-actions {
      grid-template-columns: repeat(4, minmax(74px, 1fr));
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
    .memory-intake-hub,
    .diary-inbox,
    .diary-inbox-list,
    .memory-intake-actions,
    .memory-intake-draft {
      grid-template-columns: 1fr;
    }
    .selected-path-actions { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .action-center-state-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .memory-path-hops { grid-template-columns: 1fr; }
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
  const currentFlowMemoryId = layout.memoryTimeline.summary.selectedMemoryId ?? layout.memoryTimeline.entries[0]?.memoryId ?? '';
  const currentFlowEntry = layout.memoryTimeline.entries.find((entry) => entry.memoryId === currentFlowMemoryId);
  const currentFlowRelatedCount = currentFlowEntry?.relatedMemoryIds.length ?? 0;
  const currentFlowRelatedEntries = (currentFlowEntry?.relatedMemoryIds ?? [])
    .map((memoryId) => layout.memoryTimeline.entries.find((entry) => entry.memoryId === memoryId))
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
    .slice(0, 4);
  const diaryInboxPreferredIds = ['mem_captured_ship_note', 'mem_unrelated_calm_import', currentFlowMemoryId];
  const diaryInboxSeen = new Set<string>();
  const diaryInboxEntries = [
    ...diaryInboxPreferredIds
      .map((memoryId) => layout.memoryTimeline.entries.find((entry) => entry.memoryId === memoryId))
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    ...layout.memoryTimeline.entries.filter((entry) => {
      const searchable = [entry.memoryId, entry.sourceLabel, entry.title, entry.rawExcerpt, entry.memoryType].join(' ').toLocaleLowerCase();
      return (
        searchable.includes('mobile') ||
        searchable.includes('markdown') ||
        searchable.includes('notion') ||
        searchable.includes('paste') ||
        searchable.includes('diary') ||
        searchable.includes('일기')
      );
    }),
  ]
    .filter((entry) => {
      if (diaryInboxSeen.has(entry.memoryId)) return false;
      diaryInboxSeen.add(entry.memoryId);
      return true;
    })
    .slice(0, 5);
  const diaryInboxHtml = diaryInboxEntries
    .map(
      (entry) =>
        `<button type="button" class="diary-inbox-item" data-control="diary-inbox-select-memory" data-diary-inbox-memory-id="${escapeHtml(entry.memoryId)}" data-diary-inbox-active="${entry.memoryId === currentFlowMemoryId ? 'true' : 'false'}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(`${entry.observedAt} · ${entry.sourceLabel}`)}</span></button>`,
    )
    .join('');
  const firstFlowRelatedEntry = currentFlowRelatedEntries[0];
  const firstFlowSharedFacet =
    firstFlowRelatedEntry?.facetLabels.find((facet) => currentFlowEntry?.facetLabels.includes(facet)) ??
    firstFlowRelatedEntry?.memoryType ??
    '감정/결정/결과';
  const currentFlowRelatedHtml = currentFlowRelatedEntries
    .map((entry) => {
      const sharedFacet = entry.facetLabels.find((facet) => currentFlowEntry?.facetLabels.includes(facet)) ?? entry.memoryType;
      return `<button type="button" class="selected-path-related-chip" data-selected-path-related-memory-id="${escapeHtml(entry.memoryId)}" data-selected-path-related-reason="${escapeHtml(sharedFacet)}"><strong>${escapeHtml(entry.title)}</strong><span>연결 이유 · ${escapeHtml(sharedFacet)}</span></button>`;
    })
    .join('');
  const currentFlowInsightHtml = currentFlowRelatedEntries
    .slice(0, 3)
    .map((entry) => {
      const sharedFacet = entry.facetLabels.find((facet) => currentFlowEntry?.facetLabels.includes(facet)) ?? entry.memoryType;
      return `<article class="related-insight-reason" data-related-insight-memory-id="${escapeHtml(entry.memoryId)}" data-related-insight-reason="${escapeHtml(sharedFacet)}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(sharedFacet)} 때문에 지금 일기와 함께 떠올랐다.</span></article>`;
    })
    .join('');
  const citationLinks = layout.ask.citationMemoryIds
    .slice(0, 3)
    .map((citationId) => `<a href="#evidence-${escapeHtml(citationId)}" class="citation-ref" data-citation-ref="${escapeHtml(citationId)}">[${escapeHtml(citationId)}]</a>`)
    .join('');

  if (variant === 'plain' || variant === 'topbar-only' || variant === 'debug-text') {
    return `<main class="second-brain-shell"><aside class="brain-sidebar"><section class="brain-title"><p class="eyebrow">지식 그래프</p><h1>내 세컨브레인</h1><p>${escapeHtml(layout.northStar)}</p></section></aside></main>`;
  }

  return `<main class="second-brain-shell" data-prototype-ux="korean-usable-mvp" data-product-goal="quick-diary-to-private-second-brain-ai" data-labels="visible" data-spacing="normal" data-layout-mode="free" data-layout-explainer="Free mode keeps the graph organic for open-ended memory exploration." data-layout-version="0" data-filter-semantic="on" data-filter-reflective="on" data-filter-procedural="on" data-filter-episodic="on" data-filter-thesis="on" data-filter-source="on" data-graph-renderer="cytoscape-pending" data-benchmark-reference="https://www.careerhackeralex.com/memory" data-memory-node-count="${memoryNodeCount}" data-rendered-memory-node-count="${renderedMemoryNodeCount}" data-graph-node-count="${graphNodeCount}" data-graph-edge-count="${graphEdgeCount}" data-surface-mode="graph-first" data-rail-mode="collapsed-evidence-drawer" data-first-screen-contract="korean-diary-flow-graph-dominant" data-panel-visibility="secondary-drawer" data-interaction-contract="capture-import-select-related-session-save">
    <aside class="brain-sidebar" aria-label="세컨브레인 그래프 조절">
      <div class="sidebar-topline">
        <a class="home-button" href="/" aria-label="home">←</a>
        <div class="locale-toggle" role="group" aria-label="언어">
          <button type="button" aria-pressed="true">한</button>
          <button type="button" aria-pressed="false">영</button>
        </div>
      </div>

      <section class="brain-title">
        <p class="eyebrow">지식 그래프</p>
        <h1>내 세컨브레인</h1>
        <p>${escapeHtml(layout.northStar)} 일기, 가져온 기록, 결정의 결과가 하나의 기억 그래프로 연결된다.</p>
      </section>

      <div class="graph-meta-line" aria-label="Memory graph scale">
        <span><strong data-live-count="memory-nodes">${memoryNodeCount}</strong> 기억</span>
        <span class="graph-meta-dot">·</span>
        <span><strong data-live-count="rendered-memory-nodes">${renderedMemoryNodeCount}</strong> 표시</span>
        <span class="graph-meta-dot">·</span>
        <span><strong data-live-count="graph-nodes">${graphNodeCount}</strong> 노드</span>
        <span class="graph-meta-dot">·</span>
        <span><strong data-live-count="graph-edges">${graphEdgeCount}</strong> 엣지</span>
        <span class="graph-meta-dot">·</span>
        <span>일기와 가져온 기록 기반</span>
      </div>

      <section class="memory-search-control" aria-label="Memory search" data-memory-search-endpoint="/api/memory/search">
        <input type="search" data-control="memory-search" placeholder="기억 검색" aria-label="기억 검색" autocomplete="off" />
        <div class="memory-search-meta">
          <span data-search-count>${layout.primaryNodes.length} / ${layout.primaryNodes.length}</span>
          <span>개인 보관함</span>
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
          <button type="button" class="layout-button active" data-layout-choice="free" aria-pressed="true">자유</button>
          <button type="button" class="layout-button" data-layout-choice="constellation" aria-pressed="false">별자리</button>
          <button type="button" class="layout-button" data-layout-choice="hierarchy" aria-pressed="false">계층</button>
          <button type="button" class="layout-button" data-layout-choice="timeline" aria-pressed="false">시간</button>
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

    <section class="brain-canvas" aria-label="개인 기억 AI 세컨브레인 캔버스">
      <form class="ask-memory-bar" aria-label="세컨브레인에게 묻기" data-ask-endpoint="/api/ask">
        <span class="ask-lock" aria-hidden="true">⌘</span>
        <span class="benchmark-signin-cta" data-auth-cta="private-second-brain">내 기억에게 묻기</span>
        <input id="ask-memory-bar-question" name="question" value="${escapeHtml(layout.askQuestion)}" aria-label="과거의 나에게 묻기" />
        <button class="ask-submit" type="submit" aria-label="질문하기" data-control="ask-second-brain">→</button>
      </form>

      <section class="product-value-strip" aria-label="Private memory product value" data-command-shelf="graph-led" data-benchmark-alignment="careerhacker-memory-graph-first" data-visible-priority="capture-import-ai-session" data-first-screen-density="compact-command-shelf">
        <div class="prototype-goal-copy">
          <p class="eyebrow">개인 일기 세컨브레인</p>
          <h2>오늘 쓴 고민을 과거 기억과 연결해서 답하게 한다</h2>
          <p>앱에서는 빠르게 쓰고, 웹에서는 일기 DB만 가져온다. 기억은 공개 공유가 아니라 내 안에서만 현재 일기와 과거 기억이 함께 떠오르는 구조다.</p>
        </div>
        <section class="prototype-journey-cockpit" data-prototype-journey-cockpit="diary-memory-ai" data-journey-current-step="capture" data-journey-selected-memory="${escapeHtml(currentFlowMemoryId)}" data-journey-related-count="${currentFlowRelatedCount}" data-journey-ai-state="idle" data-journey-save-state="idle" data-journey-next-action="write-or-import" aria-label="일기에서 AI 고민 해결까지 현재 흐름">
          <div class="journey-cockpit-head">
            <strong>지금 흐름</strong>
            <span data-journey-step-label>기록 단계 · 앱 빠른 기록 또는 웹 일기 가져오기</span>
          </div>
          <div class="journey-cockpit-signals" aria-label="현재 기억 흐름 상태">
            <span data-journey-memory-label>선택 기억 · ${escapeHtml(currentFlowEntry?.title ?? currentFlowMemoryId)}</span>
            <span data-journey-related-label>연관 기억 · ${currentFlowRelatedCount}개</span>
            <span data-journey-ai-label>AI 실행 · 대기</span>
            <span data-journey-save-label>미래 기억 저장 · 대기</span>
          </div>
          <div class="journey-cockpit-next">
            <strong>다음 행동</strong>
            <span data-journey-next-action-label>일기를 쓰거나 가져오면 그래프와 연관 기억이 열린다.</span>
          </div>
          <div class="journey-cockpit-actions" aria-label="주요 다음 행동">
            <a href="/capture/" data-journey-primary-action="capture">일기 쓰기</a>
            <button type="button" data-journey-primary-action="graph">그래프에서 기억 보기</button>
            <button type="button" data-journey-primary-action="session">AI 세션 실행</button>
          </div>
        </section>
        <section class="guided-service-flow" data-guided-service-flow="diary-memory-ai" data-guided-flow-current-step="capture" data-guided-flow-source="${escapeHtml(currentFlowMemoryId)}" data-guided-flow-related-count="${currentFlowRelatedCount}" data-guided-flow-saved-memory="" aria-label="일기에서 개인 기억 AI까지 한 화면 흐름">
          <ol class="guided-flow-steps" aria-label="핵심 사용 흐름">
            <li data-guided-flow-step="capture" data-guided-flow-state="active"><strong>기록</strong><span>앱/웹 일기 입력</span></li>
            <li data-guided-flow-step="graph" data-guided-flow-state="idle"><strong>세컨브레인</strong><span>기억 그래프 생성</span></li>
            <li data-guided-flow-step="related" data-guided-flow-state="idle"><strong>연관 기억</strong><span>과거 노드 연결</span></li>
            <li data-guided-flow-step="ai" data-guided-flow-state="idle"><strong>AI 실행</strong><span>인용 근거 답변</span></li>
            <li data-guided-flow-step="save" data-guided-flow-state="idle"><strong>미래 기억 저장</strong><span>다음 고민의 근거</span></li>
          </ol>
          <div class="guided-flow-actions" aria-label="핵심 흐름 바로가기">
            <a href="/capture/" data-guided-flow-action="start-capture">일기 쓰기</a>
            <button type="button" data-guided-flow-action="focus-graph">그래프 보기</button>
            <button type="button" data-guided-flow-action="run-session">AI 세션</button>
            <button type="button" data-guided-flow-action="save-result">결과 저장</button>
          </div>
        </section>
        <ol class="prototype-flow-board service-flow-steps" aria-label="Diary to Second Brain service flow" data-prototype-flow="tonight-usable" data-service-flow="diary-to-second-brain" data-service-flow-primary-entry="app-or-web-diary" data-service-flow-graph-source="actual-memory-records">
          <li data-primary-flow-step="quick-diary" data-service-flow-step="quick-diary-capture"><strong>빠른 일기</strong><span>앱/PWA에서 바로 기록</span></li>
          <li data-primary-flow-step="diary-import" data-service-flow-step="diary-database-load"><strong>일기 DB 가져오기</strong><span>습관리스트/일기 DB만 선택</span></li>
          <li data-primary-flow-step="second-brain" data-service-flow-step="second-brain-graph"><strong>내 세컨브레인</strong><span>MemoryRecord 그래프 생성</span></li>
          <li data-primary-flow-step="related-memories" data-service-flow-step="related-memory-nodes"><strong>연관 과거 기억</strong><span>감정·결정·결과 엣지</span></li>
          <li data-primary-flow-step="ai-session" data-service-flow-step="ask-report"><strong>AI 고민 세션</strong><span>인용 근거로만 답변</span></li>
          <li data-primary-flow-step="saveback"><strong>다시 기억으로 저장</strong><span>세션 결과가 미래 근거가 됨</span></li>
        </ol>
        <div class="privacy-actions" aria-label="Privacy and control actions">
          <span>비공개 기본값</span>
          <span>로컬 프로토타입</span>
          <span>내보내기</span>
          <span>삭제</span>
        </div>
        <section class="diary-inbox" data-diary-inbox="app-web-diary-sources" data-diary-inbox-count="${diaryInboxEntries.length}" data-diary-inbox-active-memory="${escapeHtml(currentFlowMemoryId)}" aria-label="앱과 웹에서 들어온 일기">
          <div class="diary-inbox-heading">
            <strong>오늘 들어온 일기</strong>
            <span>앱 빠른 기록과 웹 가져오기가 내 세컨브레인 그래프로 들어온 기록이다.</span>
          </div>
          <div class="diary-inbox-list" data-diary-inbox-list>
            ${diaryInboxHtml}
          </div>
        </section>
        <section class="memory-intake-hub" data-memory-intake-hub="app-web-diary" data-intake-stage="capture-or-import" data-intake-source-scope="diary-only" data-intake-result="graph-handoff" data-intake-last-action="none" data-intake-draft-state="idle" aria-label="기록 인입 허브">
          <div class="memory-intake-copy">
            <strong>기록 인입 허브</strong>
            <span>앱에서 짧게 쓰거나, 웹에서 일기만 붙여넣거나, 습관리스트 Notion DB를 불러오면 곧바로 개인 세컨브레인 그래프와 AI 세션으로 이어진다.</span>
          </div>
          <div class="memory-intake-actions" aria-label="기록 인입 액션">
            <a class="memory-intake-action primary" href="/capture/" data-intake-action="quick-capture"><strong>앱 빠른 기록</strong><span>채팅처럼 쓰고 저장 후 그래프로 이동</span></a>
            <button type="button" class="memory-intake-action" data-intake-action="paste-diary"><strong>웹 일기 붙여넣기</strong><span>긴 일기/Markdown을 미리보기 후 적용</span></button>
            <button type="button" class="memory-intake-action" data-intake-action="notion-diary-db"><strong>습관리스트 Notion DB</strong><span>일기 데이터베이스만 선택해서 가져오기</span></button>
          </div>
          <div class="memory-intake-draft">
            <label for="intake-diary-draft">오늘의 일기를 바로 붙여넣기</label>
            <textarea id="intake-diary-draft" data-control="intake-diary-draft" placeholder="오늘의 일기를 바로 붙여넣기"></textarea>
            <div class="memory-intake-draft-actions">
              <button type="button" data-control="intake-preview-diary">미리보기 만들기</button>
              <button type="button" data-control="intake-apply-diary">그래프에 적용</button>
            </div>
          </div>
          <div class="memory-intake-notion-actions" aria-label="습관리스트 Notion DB 인입">
            <button type="button" data-control="intake-find-notion-source">습관리스트 소스 찾기</button>
            <button type="button" data-control="intake-preview-notion-diary">습관리스트 미리보기</button>
            <button type="button" data-control="intake-apply-notion-diary">Notion 그래프 적용</button>
          </div>
          <section class="diary-graph-handoff-map" data-diary-graph-handoff-map="app-web-notion-to-graph" data-handoff-active-route="none" data-handoff-stage="waiting" data-handoff-selected-memory="${escapeHtml(currentFlowMemoryId)}" data-handoff-related-count="${currentFlowRelatedCount}" data-handoff-ai-state="idle" data-handoff-saveback-state="idle" aria-label="일기 입력에서 세컨브레인 그래프까지 연결 상태">
            <div class="handoff-route-list" aria-label="일기 인입 경로">
              <div class="handoff-route" data-handoff-route="app-quick-diary" data-handoff-route-state="idle"><strong>앱 빠른 일기</strong><span>저장 후 그래프 선택</span></div>
              <div class="handoff-route" data-handoff-route="web-paste-diary" data-handoff-route-state="idle"><strong>웹 일기 붙여넣기</strong><span>미리보기 후 적용</span></div>
              <div class="handoff-route" data-handoff-route="notion-diary-db" data-handoff-route-state="idle"><strong>Notion 일기 DB</strong><span>습관리스트만 가져오기</span></div>
            </div>
            <div class="handoff-status-grid" aria-label="그래프 반영 상태">
              <span data-handoff-stage-label>그래프 반영 상태 · 대기</span>
              <span data-handoff-memory-label>선택 기억 · ${escapeHtml(currentFlowMemoryId)}</span>
              <span data-handoff-related-label>연관 기억 · ${currentFlowRelatedCount}개</span>
              <span data-handoff-ai-label>AI 실행 · 대기</span>
              <span data-handoff-saveback-label>미래 기억 저장 · 대기</span>
            </div>
          </section>
          <div class="memory-intake-result" data-intake-session-result="applied-memory" data-intake-applied-memory="none" data-intake-related-memory-count="0" data-intake-next-step="waiting-for-diary">
            <div>
              <strong data-intake-result-title>적용하면 여기서 바로 다음 행동을 보여준다</strong>
              <span data-intake-result-summary>일기를 그래프에 넣으면 생성된 기억과 연관 과거 기억 수를 확인하고 AI 세션을 실행할 수 있다.</span>
            </div>
            <ol class="memory-intake-flow-tracker" data-intake-flow-tracker="diary-memory-ai" aria-label="기록에서 AI 저장까지 진행 상태">
              <li data-intake-flow-step="capture" data-intake-flow-state="ready"><span>1</span><strong>기록</strong></li>
              <li data-intake-flow-step="graph" data-intake-flow-state="idle"><span>2</span><strong>그래프 연결</strong></li>
              <li data-intake-flow-step="related" data-intake-flow-state="idle"><span>3</span><strong>연관 기억</strong></li>
              <li data-intake-flow-step="ai" data-intake-flow-state="idle"><span>4</span><strong>AI 실행</strong></li>
              <li data-intake-flow-step="save" data-intake-flow-state="idle"><span>5</span><strong>다시 저장</strong></li>
            </ol>
            <section class="memory-intake-related-bundle" data-intake-related-bundle="past-memory-nodes" data-intake-related-bundle-count="0" data-intake-ai-action-result="idle" aria-label="인입된 일기와 연결된 과거 기억">
              <div class="memory-intake-related-heading">
                <strong>관련 과거 기억</strong>
                <span data-intake-related-bundle-summary>일기 적용 후 실제 그래프 연결을 보여준다</span>
              </div>
              <div class="memory-intake-related-list" data-intake-related-bundle-list></div>
              <div class="memory-intake-related-actions" aria-label="연관 기억 기반 AI 액션">
                <button type="button" data-control="intake-run-ask" disabled>기억에게 묻기</button>
                <button type="button" data-control="intake-run-decision-replay" disabled>결정 되짚기</button>
                <button type="button" data-control="intake-run-weekly-report" disabled>주간 패턴</button>
                <button type="button" data-control="intake-save-ai-result" data-intake-ai-save-state="idle" disabled>결과를 기억으로 저장</button>
              </div>
            </section>
            <button type="button" data-control="intake-run-session" disabled>AI 세션 실행</button>
          </div>
        </section>
        <section class="flow-coach" data-flow-coach="diary-to-memory-ai" data-flow-coach-stage="start" data-flow-coach-next-action="write-or-import" aria-label="일기에서 기억 AI까지 다음 행동">
          <strong data-flow-coach-title>지금 해야 할 일</strong>
          <span data-flow-coach-summary>앱 빠른 기록 또는 일기 DB 가져오기부터 시작하면, 관련 과거 기억과 AI 세션이 이어진다.</span>
          <ol class="flow-coach-steps" aria-label="진행 흐름">
            <li>1 기록/가져오기</li>
            <li>2 그래프 연결</li>
            <li>3 연관 기억</li>
            <li>4 AI 실행</li>
            <li>5 미래 기억 저장</li>
          </ol>
        </section>
        <section class="capture-handoff-banner" data-capture-handoff-banner="selected-memory-session" data-capture-handoff-banner-state="idle" data-capture-handoff-memory="" data-capture-handoff-related-count="0" data-capture-handoff-saved-memory="" data-capture-handoff-reentry-state="idle" aria-label="앱 기록에서 넘어온 기억">
          <div>
            <strong data-capture-handoff-title>방금 저장한 일기</strong>
            <span data-capture-handoff-summary>앱에서 저장한 일기가 그래프에서 선택되면 연관 과거 기억과 AI 세션 준비 상태를 여기서 보여준다.</span>
          </div>
          <div class="capture-handoff-actions">
            <button type="button" data-control="capture-handoff-run-session">AI 세션 실행</button>
          </div>
          <div class="capture-handoff-reentry" data-capture-handoff-reentry="saved-session-memory">
            <span>저장된 세션 기억으로 다시 열기</span>
            <a href="#" data-control="open-saved-session-memory-graph">그래프에서 보기</a>
            <a href="#" data-control="open-saved-session-memory-session">AI 세션으로 열기</a>
          </div>
        </section>
        <div class="prototype-entry-dock" data-entry-dock="diary-start" aria-label="첫 화면 일기 시작 액션">
          <a class="entry-dock-action primary" href="/capture/" data-primary-entry-action="quick-diary">
            <strong>앱처럼 빠른 일기 쓰기</strong>
            지금 떠오른 고민을 바로 기록하고 세컨브레인으로 넘긴다.
          </a>
          <button type="button" class="entry-dock-action" data-primary-entry-action="diary-import" data-control="focus-local-import">
            <strong>일기 붙여넣어 가져오기</strong>
            웹에서 긴 일기/Notion export를 먼저 넣는다.
          </button>
          <div class="entry-dock-note" data-primary-entry-action="memory-session-hint">
            <strong>선택한 기억에서 AI 세션 실행</strong>
            그래프 노드를 고르면 연관 과거 기억과 함께 질문·결정·주간 패턴으로 이어진다.
          </div>
        </div>
        <section class="first-run-guide" data-first-run-guide="diary-memory-ai" data-first-run-stage="entry-to-session" data-flow-current-memory="${escapeHtml(currentFlowMemoryId)}" data-flow-related-memory-count="${currentFlowRelatedCount}" aria-label="처음 쓰는 흐름">
          <div class="first-run-guide-status">
            <strong>오늘의 흐름</strong>
            <span>선택 기억 ${escapeHtml(currentFlowMemoryId)}</span>
            <span>연관 기억 ${currentFlowRelatedCount}개</span>
          </div>
          <div class="first-run-actions" aria-label="처음 실행 액션">
            <button type="button" class="first-run-action primary" data-guide-action="write-diary" data-guide-state="ready">지금 일기 쓰기</button>
            <button type="button" class="first-run-action" data-guide-action="import-diary" data-guide-state="ready">일기 DB 불러오기</button>
            <button type="button" class="first-run-action" data-guide-action="select-memory" data-guide-state="ready">그래프에서 기억 고르기</button>
            <button type="button" class="first-run-action" data-guide-action="run-ai-session" data-guide-state="ready">AI 세션 실행</button>
            <button type="button" class="first-run-action" data-guide-action="save-session" data-guide-state="ready">결과를 기억으로 저장</button>
          </div>
        </section>
        <section class="selected-memory-path-panel" data-selected-memory-path="graph-related-session" data-selected-memory-source="${escapeHtml(currentFlowMemoryId)}" data-selected-memory-related-count="${currentFlowRelatedCount}" aria-label="선택한 기억에서 AI 세션으로 이어지는 경로">
          <div class="selected-path-current">
            <p class="eyebrow">선택한 기억</p>
            <h3 data-selected-path-title>${escapeHtml(currentFlowEntry?.title ?? '그래프에서 기억을 선택하세요')}</h3>
            <p data-selected-path-source>${escapeHtml(currentFlowEntry ? `${currentFlowEntry.sourceLabel} · ${currentFlowEntry.observedAt}` : '선택 전')}</p>
          </div>
          <div class="selected-path-related">
            <p><strong>연결 이유</strong> · 감정, 결정, 출처, 결과가 겹치는 과거 기억 ${currentFlowRelatedCount}개</p>
            <div class="selected-path-related-list" data-selected-path-related-list>
              ${currentFlowRelatedHtml}
            </div>
          </div>
          <div class="memory-path-explainer" data-memory-path-explainer="selected-memory-related-reasons" data-memory-path-state="ready" data-memory-path-source="${escapeHtml(currentFlowMemoryId)}" data-memory-path-related-count="${currentFlowRelatedCount}">
            <strong>기억 연결 경로</strong>
            <div class="memory-path-hops" aria-label="선택 기억에서 AI 액션까지 연결 경로">
              <div class="memory-path-hop" data-memory-path-hop="current"><span>현재 기억</span><strong data-memory-path-current>${escapeHtml(currentFlowMemoryId)}</strong></div>
              <div class="memory-path-hop" data-memory-path-hop="shared-reason"><span>공통 이유</span><strong data-memory-path-reason>${escapeHtml(firstFlowSharedFacet)}</strong></div>
              <div class="memory-path-hop" data-memory-path-hop="past-memory"><span>과거 기억</span><strong data-memory-path-past>${escapeHtml(firstFlowRelatedEntry?.title ?? '연관 과거 기억 없음')}</strong></div>
              <div class="memory-path-hop" data-memory-path-hop="ai-action"><span>다음 행동</span><strong data-memory-path-action>AI 세션</strong></div>
            </div>
          </div>
          <section class="related-memory-workbench" data-related-memory-workbench="selected-diary-comparison" data-related-workbench-source="${escapeHtml(currentFlowMemoryId)}" data-related-workbench-active-memory="${escapeHtml(firstFlowRelatedEntry?.memoryId ?? '')}" data-related-workbench-count="${currentFlowRelatedCount}" aria-label="선택 일기와 과거 기억 비교">
            <div class="related-workbench-summary">
              <strong>과거 기억 비교</strong>
              <span>현재 일기 · <b data-related-workbench-source-label>${escapeHtml(currentFlowEntry?.title ?? currentFlowMemoryId)}</b></span>
              <span>비교할 과거 기억 · <b data-related-workbench-active-label>${escapeHtml(firstFlowRelatedEntry?.title ?? '선택 전')}</b></span>
            </div>
            <div class="related-workbench-list" data-related-workbench-list aria-label="비교할 과거 기억">
              ${currentFlowRelatedEntries
                .slice(0, 4)
                .map((entry, index) => {
                  const reason = entry.facetLabels.find((facet) => currentFlowEntry?.facetLabels.includes(facet)) ?? entry.memoryType;
                  return `<button type="button" class="related-workbench-item" data-related-workbench-memory-id="${escapeHtml(entry.memoryId)}" data-related-workbench-reason="${escapeHtml(reason)}" data-related-workbench-active="${String(index === 0)}"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(reason)} 때문에 연결됨</span></button>`;
                })
                .join('')}
            </div>
            <div class="related-workbench-actions" aria-label="비교한 기억으로 실행">
              <button type="button" data-related-workbench-action="ask">질문</button>
              <button type="button" data-related-workbench-action="replay">결정</button>
              <button type="button" data-related-workbench-action="weekly">주간</button>
              <button type="button" data-related-workbench-action="session">세션</button>
            </div>
          </section>
          <section class="related-insight-bridge" data-related-insight-bridge="diary-to-past-memory-actions" data-related-insight-source="${escapeHtml(currentFlowMemoryId)}" data-related-insight-count="${currentFlowRelatedCount}" aria-label="선택 일기와 관련 과거 기억 이유">
            <strong>왜 이 기억이 떠올랐나</strong>
            <div class="related-insight-reason-list" data-related-insight-reason-list>
              ${currentFlowInsightHtml}
            </div>
            <div class="related-insight-actions" aria-label="관련 과거 기억으로 바로 실행">
              <button type="button" data-related-insight-action="ask">과거 기억으로 질문하기</button>
              <button type="button" data-related-insight-action="replay">결정 되짚기</button>
              <button type="button" data-related-insight-action="weekly">주간 패턴 보기</button>
            </div>
          </section>
          <section class="grounded-action-result" data-grounded-action-result="related-memory-ai" data-grounded-action-state="idle" data-grounded-action-kind="none" data-grounded-action-source="${escapeHtml(currentFlowMemoryId)}" data-grounded-action-related-count="${currentFlowRelatedCount}" data-grounded-action-citation-count="0" data-grounded-action-save-state="idle" data-grounded-action-saved-memory="" aria-label="관련 기억 기반 AI 실행 결과">
            <strong>근거 있는 실행 결과</strong>
            <span data-grounded-action-summary>질문, 결정 되짚기, 주간 패턴을 실행하면 선택한 기억과 관련 과거 기억 수가 여기에 남는다.</span>
            <span data-grounded-action-save-next>결과가 나오면 세션 저장으로 미래 기억에 남길 수 있다.</span>
            <button type="button" class="grounded-action-saveback" data-control="grounded-action-saveback" data-grounded-action-save-state="idle">결과를 미래 기억으로 저장</button>
          </section>
          <section class="selected-ai-action-center" data-selected-ai-action-center="grounded-memory-actions" data-action-center-source="${escapeHtml(currentFlowMemoryId)}" data-action-center-related-count="${currentFlowRelatedCount}" data-action-center-last-action="none" data-action-center-citation-count="0" data-action-center-save-state="idle" aria-label="선택 기억 AI 실행 상태">
            <div class="action-center-copy">
              <strong>선택 기억 AI 실행</strong>
              <span data-action-center-source-label>선택 기억 · ${escapeHtml(currentFlowEntry?.title ?? currentFlowMemoryId)}</span>
              <span data-action-center-related-label>연관 기억 · ${currentFlowRelatedCount}개</span>
            </div>
            <div class="action-center-state-grid" aria-label="AI 액션 상태">
              <span data-action-center-state="ask" data-action-center-state-value="idle">질문 · 대기</span>
              <span data-action-center-state="replay" data-action-center-state-value="idle">결정 · 대기</span>
              <span data-action-center-state="weekly" data-action-center-state-value="idle">주간 · 대기</span>
              <span data-action-center-state="session" data-action-center-state-value="idle">세션 · 대기</span>
            </div>
            <div class="action-center-save">
              <span data-action-center-citation-label>인용 근거 · 0개</span>
              <span data-action-center-save-label>미래 기억 저장 · 대기</span>
            </div>
          </section>
          <div class="selected-path-actions" aria-label="AI 세션 준비">
            <button type="button" class="selected-path-action" data-selected-path-action="ask">질문</button>
            <button type="button" class="selected-path-action" data-selected-path-action="replay">결정</button>
            <button type="button" class="selected-path-action" data-selected-path-action="weekly">주간</button>
            <button type="button" class="selected-path-action primary" data-selected-path-action="session">AI 세션 준비</button>
          </div>
        </section>
      </section>

      <div class="product-main-grid">
        <div class="graph-stage">
          <div id="memory-graph-cytoscape" class="cytoscape-memory-graph" data-graph-library="cytoscape" data-memory-node-count="${memoryNodeCount}" data-rendered-memory-node-count="${renderedMemoryNodeCount}" data-graph-node-count="${graphNodeCount}" data-graph-edge-count="${graphEdgeCount}" aria-label="Cytoscape data-driven personal memory graph"></div>
          ${renderMemoryGraphPayload(memoryGraph)}
          ${renderSavedArtifactPayload(layout)}
          ${variant === 'no-svg' ? '' : renderMemoryGraph(layout)}
          <section class="selected-command-rail" data-command-rail="selected-memory-actions" data-command-rail-state="ready" data-command-rail-source="${escapeHtml(currentFlowMemoryId)}" data-command-rail-related-count="${currentFlowRelatedCount}" aria-label="선택한 기억 바로 실행">
            <div class="selected-command-copy">
              <strong data-command-rail-title>선택 기억 바로 실행</strong>
              <span data-command-rail-summary>${escapeHtml(currentFlowMemoryId)} 기억과 연관 과거 기억 ${currentFlowRelatedCount}개로 AI 액션을 실행한다.</span>
            </div>
            <div class="selected-command-actions" aria-label="선택 기억 AI 액션">
              <button type="button" class="selected-command-action" data-command-rail-action="ask">질문</button>
              <button type="button" class="selected-command-action" data-command-rail-action="replay">결정</button>
              <button type="button" class="selected-command-action" data-command-rail-action="weekly">주간</button>
              <button type="button" class="selected-command-action primary" data-command-rail-action="session">세션</button>
            </div>
          </section>
          <aside class="wiki-compiler-strip" aria-label="LLM Wiki memory structure preview" data-wiki-compiler="pmi017" data-llm-wiki-visible="true">
            <span><strong data-live-count="wiki-atoms">${layout.compiledWiki.atomCount}</strong> 원자 기억</span>
            <span><strong data-live-count="wiki-nodes">${layout.compiledWiki.nodeCount}</strong> 위키 노드</span>
            <span><strong data-live-count="wiki-citations">${layout.compiledWiki.citationCount}</strong> 인용</span>
            <span data-memory-ops="retain-recall-reflect">보존 ${layout.compiledWiki.operationCounts.retain} · 회상 ${layout.compiledWiki.operationCounts.recall} · 성찰 ${layout.compiledWiki.operationCounts.reflect}</span>
            <span data-memory-freshness="strengthening-stable-stale">강화/안정/오래됨 ${layout.compiledWiki.freshnessCounts.strengthening}/${layout.compiledWiki.freshnessCounts.stable}/${layout.compiledWiki.freshnessCounts.stale}</span>
            <span>출처·패턴·인용 구조</span>
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

          <article class="memory-inspector" aria-label="과거의 나에게 묻기 인용 경로" data-inspector-panel="pmi015">
            <p class="eyebrow">과거의 나에게 묻기 · 인용 경로</p>
            <h2 data-inspector-headline>${escapeHtml(layout.ask.recommendation)}</h2>
            <p class="memory-inspector-source" data-inspector-source>선택 경로 · 인용 기억 3개</p>
            <p data-inspector-body>반복된 <span class="pill-red">불안 → 기능 추가 → 출시 지연</span> 경로만 근거로 답한다. 결정 되짚기는 현재 결정을 과거 결과와 비교하고, 근거 서랍은 출처·날짜·기억 원문으로 되돌아간다.</p>
            <div class="related-memory-strip" data-related-memory-strip="selected-node" data-related-memory-count="0">
              <strong>연관된 과거 기억</strong>
              <div class="related-memory-list" data-related-memory-list></div>
              <button type="button" class="related-memory-action" data-control="ask-with-related-memory-context">이 맥락으로 질문</button>
              <button type="button" class="related-memory-action" data-control="replay-with-related-memory-context">이 맥락으로 결정 되짚기</button>
              <button type="button" class="related-memory-action" data-control="report-with-related-memory-context">이 맥락으로 주간 패턴</button>
              <button type="button" class="related-memory-action primary" data-control="run-memory-session">AI 세션 실행</button>
            </div>
            <div class="citation-row" aria-label="과거의 나에게 묻기 인용" data-inspector-citations>${citationLinks}</div>
          </article>
        </div>

        <aside class="product-rail" aria-label="인용 기억 제품 레일" data-rail-mode="persistent-evidence-rail" data-benchmark-drawer-tab="AI 세션과 근거">
          <section class="memory-session-panel" aria-label="기억 AI 세션" data-memory-session-panel data-session-state="idle" data-session-source-memory="" data-session-related-memory-count="0">
            <div>
              <p class="eyebrow">기억 AI 세션</p>
              <h3>선택한 기억 하나로 질문 · 결정 · 주간 패턴을 이어서 실행</h3>
            </div>
            <p data-memory-session-summary>그래프에서 기억을 선택하면 관련 과거 기억을 같은 맥락으로 묶어 세 가지 AI 작업을 한 번에 실행한다.</p>
            <ol class="memory-session-steps" aria-label="Guided memory session steps">
              <li data-memory-session-step="ask" data-session-step-state="idle"><span>질문</span><strong>대기</strong></li>
              <li data-memory-session-step="replay" data-session-step-state="idle"><span>결정 되짚기</span><strong>대기</strong></li>
              <li data-memory-session-step="weekly" data-session-step-state="idle"><span>주간 패턴</span><strong>대기</strong></li>
            </ol>
            <button type="button" class="save-artifact-action" data-control="save-memory-session" data-artifact-save-state="idle" data-artifact-save-endpoint="/api/capture" data-artifact-save-method="POST">세션 저장</button>
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
  const selectedPathPanel = document.querySelector('[data-selected-memory-path="graph-related-session"]');
  const selectedPathTitle = selectedPathPanel?.querySelector('[data-selected-path-title]');
  const selectedPathSource = selectedPathPanel?.querySelector('[data-selected-path-source]');
  const selectedPathRelatedList = selectedPathPanel?.querySelector('[data-selected-path-related-list]');
  const selectedPathActions = Array.from(document.querySelectorAll('[data-selected-path-action]'));
  const commandRail = document.querySelector('[data-command-rail="selected-memory-actions"]');
  const commandRailTitle = commandRail?.querySelector('[data-command-rail-title]');
  const commandRailSummary = commandRail?.querySelector('[data-command-rail-summary]');
  const commandRailActions = Array.from(document.querySelectorAll('[data-command-rail-action]'));
  const memoryPathExplainer = document.querySelector('[data-memory-path-explainer="selected-memory-related-reasons"]');
  const memoryPathCurrent = memoryPathExplainer?.querySelector('[data-memory-path-current]');
  const memoryPathReason = memoryPathExplainer?.querySelector('[data-memory-path-reason]');
  const memoryPathPast = memoryPathExplainer?.querySelector('[data-memory-path-past]');
  const memoryPathAction = memoryPathExplainer?.querySelector('[data-memory-path-action]');
  const relatedInsightBridge = document.querySelector('[data-related-insight-bridge="diary-to-past-memory-actions"]');
  const relatedInsightReasonList = relatedInsightBridge?.querySelector('[data-related-insight-reason-list]');
  const relatedInsightActions = Array.from(document.querySelectorAll('[data-related-insight-action]'));
  const relatedMemoryWorkbench = document.querySelector('[data-related-memory-workbench="selected-diary-comparison"]');
  const relatedWorkbenchSourceLabel = relatedMemoryWorkbench?.querySelector('[data-related-workbench-source-label]');
  const relatedWorkbenchActiveLabel = relatedMemoryWorkbench?.querySelector('[data-related-workbench-active-label]');
  const relatedWorkbenchList = relatedMemoryWorkbench?.querySelector('[data-related-workbench-list]');
  const relatedWorkbenchActions = Array.from(document.querySelectorAll('[data-related-workbench-action]'));
  const groundedActionResult = document.querySelector('[data-grounded-action-result="related-memory-ai"]');
  const groundedActionSummary = groundedActionResult?.querySelector('[data-grounded-action-summary]');
  const groundedActionSaveNext = groundedActionResult?.querySelector('[data-grounded-action-save-next]');
  const groundedActionSaveback = document.querySelector('[data-control="grounded-action-saveback"]');
  const selectedAiActionCenter = document.querySelector('[data-selected-ai-action-center="grounded-memory-actions"]');
  const actionCenterSourceLabel = selectedAiActionCenter?.querySelector('[data-action-center-source-label]');
  const actionCenterRelatedLabel = selectedAiActionCenter?.querySelector('[data-action-center-related-label]');
  const actionCenterCitationLabel = selectedAiActionCenter?.querySelector('[data-action-center-citation-label]');
  const actionCenterSaveLabel = selectedAiActionCenter?.querySelector('[data-action-center-save-label]');
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
  const handoffQueryParams = new URLSearchParams(window.location.search);
  const handoffMemoryId = handoffQueryParams.get('memory');
  const handoffStartMode = handoffQueryParams.get('start');
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
  const focusLocalImportButton = document.querySelector('[data-control="focus-local-import"]');
  const memoryIntakeHub = document.querySelector('[data-memory-intake-hub="app-web-diary"]');
  const diaryGraphHandoffMap = document.querySelector('[data-diary-graph-handoff-map="app-web-notion-to-graph"]');
  const handoffStageLabel = diaryGraphHandoffMap?.querySelector('[data-handoff-stage-label]');
  const handoffMemoryLabel = diaryGraphHandoffMap?.querySelector('[data-handoff-memory-label]');
  const handoffRelatedLabel = diaryGraphHandoffMap?.querySelector('[data-handoff-related-label]');
  const handoffAiLabel = diaryGraphHandoffMap?.querySelector('[data-handoff-ai-label]');
  const handoffSavebackLabel = diaryGraphHandoffMap?.querySelector('[data-handoff-saveback-label]');
  const diaryInbox = document.querySelector('[data-diary-inbox="app-web-diary-sources"]');
  const diaryInboxItems = Array.from(document.querySelectorAll('[data-control="diary-inbox-select-memory"]'));
  const intakeDiaryDraft = document.querySelector('[data-control="intake-diary-draft"]');
  const intakePreviewDiaryButton = document.querySelector('[data-control="intake-preview-diary"]');
  const intakeApplyDiaryButton = document.querySelector('[data-control="intake-apply-diary"]');
  const intakeFindNotionSourceButton = document.querySelector('[data-control="intake-find-notion-source"]');
  const intakePreviewNotionButton = document.querySelector('[data-control="intake-preview-notion-diary"]');
  const intakeApplyNotionButton = document.querySelector('[data-control="intake-apply-notion-diary"]');
  const intakeSessionResult = document.querySelector('[data-intake-session-result="applied-memory"]');
  const intakeResultTitle = intakeSessionResult?.querySelector('[data-intake-result-title]');
  const intakeResultSummary = intakeSessionResult?.querySelector('[data-intake-result-summary]');
  const intakeRelatedBundle = document.querySelector('[data-intake-related-bundle="past-memory-nodes"]');
  const intakeRelatedBundleSummary = intakeRelatedBundle?.querySelector('[data-intake-related-bundle-summary]');
  const intakeRelatedBundleList = intakeRelatedBundle?.querySelector('[data-intake-related-bundle-list]');
  const intakeFlowTracker = document.querySelector('[data-intake-flow-tracker="diary-memory-ai"]');
  const intakeRunAskButton = document.querySelector('[data-control="intake-run-ask"]');
  const intakeRunReplayButton = document.querySelector('[data-control="intake-run-decision-replay"]');
  const intakeRunWeeklyButton = document.querySelector('[data-control="intake-run-weekly-report"]');
  const intakeSaveAiResultButton = document.querySelector('[data-control="intake-save-ai-result"]');
  const intakeRunSessionButton = document.querySelector('[data-control="intake-run-session"]');
  const productValueStrip = document.querySelector('.product-value-strip[data-command-shelf="graph-led"]');
  const flowCoach = document.querySelector('[data-flow-coach="diary-to-memory-ai"]');
  const flowCoachTitle = flowCoach?.querySelector('[data-flow-coach-title]');
  const flowCoachSummary = flowCoach?.querySelector('[data-flow-coach-summary]');
  const guidedServiceFlow = document.querySelector('[data-guided-service-flow="diary-memory-ai"]');
  const guidedFlowSteps = Array.from(document.querySelectorAll('[data-guided-flow-step]'));
  const guidedFlowActions = Array.from(document.querySelectorAll('[data-guided-flow-action]'));
  const prototypeJourneyCockpit = document.querySelector('[data-prototype-journey-cockpit="diary-memory-ai"]');
  const journeyStepLabel = prototypeJourneyCockpit?.querySelector('[data-journey-step-label]');
  const journeyMemoryLabel = prototypeJourneyCockpit?.querySelector('[data-journey-memory-label]');
  const journeyRelatedLabel = prototypeJourneyCockpit?.querySelector('[data-journey-related-label]');
  const journeyAiLabel = prototypeJourneyCockpit?.querySelector('[data-journey-ai-label]');
  const journeySaveLabel = prototypeJourneyCockpit?.querySelector('[data-journey-save-label]');
  const journeyNextActionLabel = prototypeJourneyCockpit?.querySelector('[data-journey-next-action-label]');
  const journeyPrimaryActions = Array.from(document.querySelectorAll('[data-journey-primary-action]'));
  const captureHandoffBanner = document.querySelector('[data-capture-handoff-banner="selected-memory-session"]');
  const captureHandoffTitle = captureHandoffBanner?.querySelector('[data-capture-handoff-title]');
  const captureHandoffSummary = captureHandoffBanner?.querySelector('[data-capture-handoff-summary]');
  const captureHandoffRunSessionButton = document.querySelector('[data-control="capture-handoff-run-session"]');
  const captureHandoffSavedGraphLink = document.querySelector('[data-control="open-saved-session-memory-graph"]');
  const captureHandoffSavedSessionLink = document.querySelector('[data-control="open-saved-session-memory-session"]');
  const intakeActions = Array.from(document.querySelectorAll('[data-intake-action]'));
  const firstRunGuideActions = Array.from(document.querySelectorAll('[data-guide-action]'));
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
  const memorySessionSaveButton = document.querySelector('[data-control="save-memory-session"]');
  let cytoscapeGraph = null;
  let layoutVersion = Number(shell.getAttribute('data-layout-version') || '0');
  let lastLocalImportPreview = null;
  let lastLocalImportUndoAction = null;
  let lastAskFollowUpContext = null;
  let lastReplayRelatedContext = null;
  let lastWeeklyRelatedContext = null;
  let pendingIntakeApplyAfterPreview = false;
  let pendingIntakeNotionApplyAfterPreview = false;

  const setInteractionState = (value) => {
    shell.setAttribute('data-interaction-state', value);
  };

  const setMemoryReviewMode = (mode, shouldUpdateInteraction = true) => {
    if (!memoryReviewPanel || !mode) return;
    memoryReviewPanel.setAttribute('data-memory-review-mode', mode);
    memoryReviewModeButtons.forEach((button) => {
      const active = button.getAttribute('data-review-mode-target') === mode;
      button.setAttribute('aria-pressed', String(active));
    });
    if (shouldUpdateInteraction) setInteractionState('memory-review-mode-' + mode);
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
    const currentTimelineItems = Array.from(timelinePanel?.querySelectorAll('[data-control="timeline-select-memory"]') || timelineItems);
    currentTimelineItems.forEach((item) => {
      item.setAttribute('data-timeline-active', String(item.getAttribute('data-timeline-memory-id') === citation));
    });
  };

  const updateDiaryInboxSelection = (citation) => {
    if (!citation) return;
    diaryInbox?.setAttribute('data-diary-inbox-active-memory', citation);
    diaryInboxItems.forEach((item) => {
      item.setAttribute('data-diary-inbox-active', String(item.getAttribute('data-diary-inbox-memory-id') === citation));
    });
  };

  const updateMemoryReviewSelection = (citation, title, body, source) => {
    if (!memoryReviewPanel || !citation) return;
    memoryReviewPanel.setAttribute('data-memory-review-selected-id', citation);
    memoryReviewPanel.setAttribute('data-memory-review-state', 'ready');
    setMemoryReviewMode('review', false);
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
    if (window.location.protocol === 'file:') {
      const exportBundle = { memory: { id: payload.memoryId }, reviewHistory: [], relatedMemoryIds: payload.relatedMemoryIds || [] };
      memoryReviewPanel.setAttribute('data-memory-provenance-export-state', 'ready');
      memoryReviewPanel.setAttribute('data-memory-provenance-export-memory-id', payload.memoryId);
      memoryReviewPanel.setAttribute('data-memory-provenance-export-review-count', '0');
      memoryReviewPanel.setAttribute('data-memory-provenance-export-related-count', String(exportBundle.relatedMemoryIds.length));
      shell.setAttribute('data-last-provenance-export-memory', payload.memoryId);
      setInteractionState('memory-provenance-exported');
      return exportBundle;
    }
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
    if (window.location.protocol === 'file:') {
      const filename = 'memory-provenance-' + payload.memoryId + '-' + new Date().toISOString().slice(0, 10) + '.json';
      const blobUrl = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
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
      return;
    }
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

  const setActiveRelatedWorkbenchMemory = (memoryId) => {
    relatedMemoryWorkbench?.setAttribute('data-related-workbench-active-memory', memoryId);
    shell.setAttribute('data-related-workbench-active-memory', memoryId);
    Array.from(relatedWorkbenchList?.querySelectorAll('[data-related-workbench-memory-id]') || []).forEach((item) => {
      const isActive = item.getAttribute('data-related-workbench-memory-id') === memoryId;
      item.setAttribute('data-related-workbench-active', String(isActive));
      if (isActive && relatedWorkbenchActiveLabel) {
        relatedWorkbenchActiveLabel.textContent = item.querySelector('strong')?.textContent || memoryId;
      }
    });
  };

  const actionCenterLabels = {
    ask: '질문',
    replay: '결정',
    weekly: '주간',
    session: '세션',
  };

  const actionCenterStateLabels = {
    idle: '대기',
    ready: '준비',
    running: '실행 중',
    answered: '완료',
    saved: '저장됨',
  };

  const setActionCenterStepState = (action, state = 'ready') => {
    Array.from(selectedAiActionCenter?.querySelectorAll('[data-action-center-state]') || []).forEach((item) => {
      const itemAction = item.getAttribute('data-action-center-state') || '';
      if (itemAction !== action) return;
      const normalizedState = actionCenterStateLabels[state] ? state : 'ready';
      item.setAttribute('data-action-center-state-value', normalizedState);
      item.textContent = (actionCenterLabels[itemAction] || itemAction) + ' · ' + actionCenterStateLabels[normalizedState];
    });
  };

  const updateSelectedAiActionCenter = (detail = {}) => {
    if (!selectedAiActionCenter) return;
    const source =
      detail.sourceMemoryId ||
      shell.getAttribute('data-active-memory') ||
      selectedAiActionCenter.getAttribute('data-action-center-source') ||
      '';
    const relatedCount = String(
      detail.relatedCount ??
        shell.getAttribute('data-related-memory-count') ??
        selectedAiActionCenter.getAttribute('data-action-center-related-count') ??
        '0',
    );
    const lastAction = detail.lastAction || selectedAiActionCenter.getAttribute('data-action-center-last-action') || 'none';
    const citationCount = String(detail.citationCount ?? selectedAiActionCenter.getAttribute('data-action-center-citation-count') ?? '0');
    const saveState = detail.saveState || selectedAiActionCenter.getAttribute('data-action-center-save-state') || 'idle';
    selectedAiActionCenter?.setAttribute('data-action-center-source', source);
    selectedAiActionCenter?.setAttribute('data-action-center-related-count', relatedCount);
    selectedAiActionCenter?.setAttribute('data-action-center-last-action', lastAction);
    selectedAiActionCenter?.setAttribute('data-action-center-citation-count', citationCount);
    selectedAiActionCenter?.setAttribute('data-action-center-save-state', saveState);
    shell.setAttribute('data-action-center-source', source);
    shell.setAttribute('data-action-center-related-count', relatedCount);
    shell.setAttribute('data-action-center-last-action', lastAction);
    shell.setAttribute('data-action-center-save-state', saveState);
    if (actionCenterSourceLabel) {
      const selectedNode = source ? cytoscapeGraph?.getElementById('memory:' + source) : null;
      actionCenterSourceLabel.textContent =
        '선택 기억 · ' + (selectedNode?.data('graphLabel') || selectedNode?.data('label') || source || '대기');
    }
    if (actionCenterRelatedLabel) actionCenterRelatedLabel.textContent = '연관 기억 · ' + relatedCount + '개';
    if (actionCenterCitationLabel) actionCenterCitationLabel.textContent = '인용 근거 · ' + citationCount + '개';
    if (actionCenterSaveLabel) {
      actionCenterSaveLabel.textContent =
        saveState === 'saved'
          ? '미래 기억 저장 · 완료'
          : saveState === 'saving'
            ? '미래 기억 저장 · 저장 중'
            : saveState === 'ready'
              ? '미래 기억 저장 · 가능'
              : '미래 기억 저장 · 대기';
    }
    if (lastAction === 'none') {
      Array.from(selectedAiActionCenter.querySelectorAll('[data-action-center-state]')).forEach((item) => {
        const itemAction = item.getAttribute('data-action-center-state') || '';
        item.setAttribute('data-action-center-state-value', 'idle');
        item.textContent = (actionCenterLabels[itemAction] || itemAction) + ' · 대기';
      });
      return;
    }
    setActionCenterStepState(detail.lastAction || 'none', detail.actionState || (lastAction === 'none' ? 'idle' : 'ready'));
  };

  const renderRelatedMemoryWorkbench = (citation, related) => {
    if (!relatedMemoryWorkbench || !relatedWorkbenchList) return;
    relatedMemoryWorkbench.setAttribute('data-related-workbench-source', citation);
    relatedMemoryWorkbench.setAttribute('data-related-workbench-count', String(related.length));
    relatedMemoryWorkbench.setAttribute('data-related-workbench-state', related.length ? 'ready' : 'empty');
    const selectedNode = cytoscapeGraph?.getElementById('memory:' + citation);
    if (relatedWorkbenchSourceLabel) {
      relatedWorkbenchSourceLabel.textContent = selectedNode?.data('graphLabel') || selectedNode?.data('label') || citation;
    }
    relatedWorkbenchList.replaceChildren();
    related.slice(0, 4).forEach((item, index) => {
      const workbenchItem = document.createElement('button');
      workbenchItem.type = 'button';
      workbenchItem.className = 'related-workbench-item';
      workbenchItem.setAttribute('data-related-workbench-memory-id', item.id);
      workbenchItem.setAttribute('data-related-workbench-reason', item.reason);
      workbenchItem.setAttribute('data-related-workbench-active', String(index === 0));
      const title = document.createElement('strong');
      title.textContent = item.label;
      const reason = document.createElement('span');
      reason.textContent = item.reason + ' 때문에 연결됨';
      workbenchItem.append(title, reason);
      workbenchItem.addEventListener('click', () => setActiveRelatedWorkbenchMemory(item.id));
      relatedWorkbenchList.append(workbenchItem);
    });
    setActiveRelatedWorkbenchMemory(related[0]?.id || '');
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
    if (selectedPathPanel && selectedPathRelatedList) {
      selectedPathRelatedList.replaceChildren();
      related.slice(0, 4).forEach((item) => {
        const pathChip = document.createElement('button');
        pathChip.type = 'button';
        pathChip.className = 'selected-path-related-chip';
        pathChip.setAttribute('data-selected-path-related-memory-id', item.id);
        pathChip.setAttribute('data-selected-path-related-reason', item.reason);
        const title = document.createElement('strong');
        title.textContent = item.label;
        const reason = document.createElement('span');
        reason.textContent = '연결 이유 · ' + item.reason;
        pathChip.append(title, reason);
        pathChip.addEventListener('click', () => selectMemoryByCitation(item.id));
        selectedPathRelatedList.append(pathChip);
      });
      selectedPathPanel.setAttribute('data-selected-memory-source', citation);
      selectedPathPanel.setAttribute('data-selected-memory-related-count', String(related.length));
      selectedPathPanel.setAttribute('data-selected-path-state', related.length ? 'ready' : 'empty');
      if (selectedPathTitle) selectedPathTitle.textContent = selectedNode.data('graphLabel') || selectedNode.data('label') || citation;
      if (selectedPathSource) {
        selectedPathSource.textContent = [selectedNode.data('sourceType'), selectedNode.data('recordType'), selectedNode.data('observedAt')]
          .filter(Boolean)
          .join(' · ');
      }
    }
    renderRelatedMemoryWorkbench(citation, related);
    updateSelectedAiActionCenter({ sourceMemoryId: citation, relatedCount: related.length, lastAction: 'none', citationCount: 0, saveState: 'idle' });
    commandRail?.setAttribute('data-command-rail-state', related.length ? 'ready' : 'empty');
    commandRail?.setAttribute('data-command-rail-source', citation);
    commandRail?.setAttribute('data-command-rail-related-count', String(related.length));
    if (commandRailTitle) commandRailTitle.textContent = '선택 기억 바로 실행';
    if (commandRailSummary) {
      commandRailSummary.textContent =
        citation + ' 기억과 연관 과거 기억 ' + String(related.length) + '개로 질문, 결정, 주간 패턴, AI 세션을 실행한다.';
    }
    memoryPathExplainer?.setAttribute('data-memory-path-state', related.length ? 'ready' : 'empty');
    memoryPathExplainer?.setAttribute('data-memory-path-source', citation);
    memoryPathExplainer?.setAttribute('data-memory-path-related-count', String(related.length));
    if (memoryPathCurrent) memoryPathCurrent.textContent = citation;
    if (memoryPathReason) memoryPathReason.textContent = related.length ? related[0].reason : '연결 이유 없음';
    if (memoryPathPast) memoryPathPast.textContent = related.length ? related[0].label : '연관 과거 기억 없음';
    if (memoryPathAction) memoryPathAction.textContent = related.length ? '질문/결정/주간/세션' : '먼저 기억 선택';
    relatedInsightBridge?.setAttribute('data-related-insight-source', citation);
    relatedInsightBridge?.setAttribute('data-related-insight-count', String(related.length));
    if (relatedInsightReasonList) {
      relatedInsightReasonList.replaceChildren();
      related.slice(0, 3).forEach((item) => {
        const reasonCard = document.createElement('article');
        reasonCard.className = 'related-insight-reason';
        reasonCard.setAttribute('data-related-insight-memory-id', item.id);
        reasonCard.setAttribute('data-related-insight-reason', item.reason);
        reasonCard.innerHTML =
          '<strong>' +
          escapeText(item.label) +
          '</strong><span>' +
          escapeText(item.reason) +
          ' 때문에 지금 일기와 함께 떠올랐다.</span>';
        relatedInsightReasonList.append(reasonCard);
      });
    }
    relatedMemoryStrip.setAttribute('data-related-memory-count', String(related.length));
    updateDiaryInboxSelection(citation);
    shell.setAttribute('data-selected-path-source-memory', citation);
    shell.setAttribute('data-selected-path-related-memory-count', String(related.length));
    shell.setAttribute('data-selected-path-related-memories', related.map((item) => item.id).join(','));
    shell.setAttribute('data-related-memory-source', citation);
    shell.setAttribute('data-related-memory-count', String(related.length));
    shell.setAttribute('data-related-memory-highlighted-edge-count', String(highlightedEdgeCount));
    updateGuidedServiceFlow('related', { sourceMemoryId: citation, relatedCount: related.length });
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
    updateSelectedAiActionCenter({ sourceMemoryId, relatedCount: relatedMemoryIds.length, lastAction: 'ask', actionState: 'ready', citationCount: 0, saveState: 'idle' });
    updateGuidedServiceFlow('ai', { sourceMemoryId, relatedCount: relatedMemoryIds.length });
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
    updateSelectedAiActionCenter({ sourceMemoryId, relatedCount: relatedMemoryIds.length, lastAction: 'replay', actionState: 'ready', citationCount: 0, saveState: 'idle' });
    updateGuidedServiceFlow('ai', { sourceMemoryId, relatedCount: relatedMemoryIds.length });
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
    updateSelectedAiActionCenter({ sourceMemoryId, relatedCount: relatedMemoryIds.length, lastAction: 'weekly', actionState: 'ready', citationCount: 0, saveState: 'idle' });
    updateGuidedServiceFlow('ai', { sourceMemoryId, relatedCount: relatedMemoryIds.length });
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

  const getIntakeMemorySessionContext = () => {
    const sourceMemoryId = intakeSessionResult?.getAttribute('data-intake-applied-memory') || '';
    const relatedMemoryIds = String(intakeRelatedBundle?.getAttribute('data-intake-related-memory-ids') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    if (!sourceMemoryId || !relatedMemoryIds.length) return null;
    return { sourceMemoryId, relatedMemoryIds };
  };

  const setMemorySessionStep = (step, state) => {
    const item = memorySessionPanel?.querySelector('[data-memory-session-step="' + step + '"]');
    if (!item) return;
    item.setAttribute('data-session-step-state', state);
    const status = item.querySelector('strong');
    if (status) {
      status.setAttribute('data-session-status-label', state);
      status.textContent =
        state === 'completed' ? '완료' : state === 'running' ? '실행 중' : state === 'failed' ? '실패' : '대기';
    }
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
      updateSelectedAiActionCenter({
        sourceMemoryId: context.sourceMemoryId,
        relatedCount: context.relatedMemoryIds.length,
        lastAction: 'session',
        actionState: state === 'completed' ? 'answered' : state === 'running' ? 'running' : state === 'error' ? 'ready' : 'ready',
        citationCount: currentCitationList('data-live-ask-highlighted-memories').length +
          currentCitationList('data-live-replay-highlighted-memories').length +
          currentCitationList('data-live-weekly-highlighted-memories').length,
        saveState: state === 'completed' ? 'ready' : 'idle',
      });
    }
    if (memorySessionSaveButton && state === 'completed') {
      memorySessionSaveButton.setAttribute('data-artifact-save-state', 'ready');
      memorySessionSaveButton.textContent = '세션 저장';
    }
    if (memorySessionSummary && context?.sourceMemoryId) {
      memorySessionSummary.textContent =
        context.sourceMemoryId + ' 기억과 관련 과거 기억 ' + String(context.relatedMemoryIds.length) + '개로 질문, 결정 되짚기, 주간 패턴을 실행한다.';
    }
    if (state === 'running') {
      updateGuidedServiceFlow('ai', {
        sourceMemoryId: context?.sourceMemoryId || shell.getAttribute('data-active-memory') || '',
        relatedCount: context?.relatedMemoryIds?.length ?? shell.getAttribute('data-related-memory-count') ?? '0',
      });
      updateFlowCoach('ai-running', 'wait-for-session', 'AI 고민 세션 실행 중', '질문, 결정 되짚기, 주간 패턴을 같은 기억 묶음으로 처리하고 있다.');
    } else if (state === 'completed') {
      updateGuidedServiceFlow('ai', {
        sourceMemoryId: context?.sourceMemoryId || shell.getAttribute('data-active-memory') || '',
        relatedCount: context?.relatedMemoryIds?.length ?? shell.getAttribute('data-related-memory-count') ?? '0',
      });
      updateFlowCoach('ai-ready', 'save-session', 'AI 세션이 끝났다', '결과가 준비됐다. 세션 저장을 누르면 이 판단도 미래의 과거 기억으로 남는다.');
    }
  };

  const setIntakeFlowStepState = (step, state) => {
    const target = intakeFlowTracker?.querySelector('[data-intake-flow-step="' + step + '"]');
    target?.setAttribute('data-intake-flow-state', state);
    memoryIntakeHub?.setAttribute('data-intake-flow-current-step', step);
    memoryIntakeHub?.setAttribute('data-intake-flow-current-state', state);
    intakeSessionResult?.setAttribute('data-intake-flow-current-step', step);
    intakeSessionResult?.setAttribute('data-intake-flow-current-state', state);
  };

  const guidedStepOrder = ['capture', 'graph', 'related', 'ai', 'save'];
  const journeyStepLabels = {
    capture: '기록 단계',
    graph: '세컨브레인 연결',
    related: '연관 기억 확인',
    ai: 'AI 실행',
    save: '미래 기억 저장',
  };
  const journeyNextActionLabels = {
    'write-or-import': '일기를 쓰거나 가져오면 그래프와 연관 기억이 열린다.',
    'inspect-graph': '그래프에서 기억을 선택하면 관련 과거 기억이 떠오른다.',
    'inspect-related': '연관 과거 기억을 확인한 뒤 질문, 결정, 주간 패턴을 실행한다.',
    'run-ai-session': '이 기억 묶음으로 AI 세션을 실행한다.',
    'save-result': '결과를 기억으로 저장하면 다음 고민의 과거 근거가 된다.',
    'reopen-saved-memory': '저장된 세션 기억을 그래프에서 다시 열 수 있다.',
  };
  const updatePrototypeJourneyCockpit = (detail = {}) => {
    if (!prototypeJourneyCockpit) return;
    const step = detail.step || guidedServiceFlow?.getAttribute('data-guided-flow-current-step') || 'capture';
    const selectedMemory =
      detail.sourceMemoryId ||
      shell.getAttribute('data-active-memory') ||
      shell.getAttribute('data-capture-handoff-selected-memory') ||
      prototypeJourneyCockpit.getAttribute('data-journey-selected-memory') ||
      '';
    const relatedCount = String(
      detail.relatedCount ??
        shell.getAttribute('data-related-memory-count') ??
        shell.getAttribute('data-memory-session-related-memory-count') ??
        prototypeJourneyCockpit.getAttribute('data-journey-related-count') ??
        '0',
    );
    const aiState = detail.aiState || prototypeJourneyCockpit.getAttribute('data-journey-ai-state') || 'idle';
    const saveState = detail.saveState || prototypeJourneyCockpit.getAttribute('data-journey-save-state') || 'idle';
    const nextAction =
      detail.nextAction ||
      (step === 'capture'
        ? 'write-or-import'
        : step === 'graph'
          ? 'inspect-graph'
          : step === 'related'
            ? 'inspect-related'
            : step === 'ai'
              ? aiState === 'answered' || aiState === 'session-completed'
                ? 'save-result'
                : 'run-ai-session'
              : saveState === 'saved'
                ? 'reopen-saved-memory'
                : 'save-result');
    prototypeJourneyCockpit?.setAttribute('data-journey-current-step', step);
    prototypeJourneyCockpit?.setAttribute('data-journey-selected-memory', selectedMemory);
    prototypeJourneyCockpit?.setAttribute('data-journey-related-count', relatedCount);
    prototypeJourneyCockpit?.setAttribute('data-journey-ai-state', aiState);
    prototypeJourneyCockpit?.setAttribute('data-journey-save-state', saveState);
    prototypeJourneyCockpit?.setAttribute('data-journey-next-action', nextAction);
    if (journeyStepLabel) journeyStepLabel.textContent = (journeyStepLabels[step] || '현재 단계') + ' · ' + (journeyNextActionLabels[nextAction] || '');
    if (journeyMemoryLabel) journeyMemoryLabel.textContent = '선택 기억 · ' + (selectedMemory || '대기');
    if (journeyRelatedLabel) journeyRelatedLabel.textContent = '연관 기억 · ' + relatedCount + '개';
    if (journeyAiLabel) journeyAiLabel.textContent = 'AI 실행 · ' + (aiState === 'answered' ? '완료' : aiState === 'running' ? '실행 중' : aiState === 'session-completed' ? '세션 완료' : aiState === 'ready' ? '준비' : '대기');
    if (journeySaveLabel) journeySaveLabel.textContent = '미래 기억 저장 · ' + (saveState === 'saved' ? '완료' : saveState === 'saving' ? '저장 중' : saveState === 'ready' ? '가능' : '대기');
    if (journeyNextActionLabel) journeyNextActionLabel.textContent = journeyNextActionLabels[nextAction] || nextAction;
    journeyPrimaryActions.forEach((item) => {
      const action = item.getAttribute('data-journey-primary-action') || '';
      item.setAttribute('data-journey-primary-state', action === 'session' && step === 'ai' ? 'primary' : action === 'graph' && (step === 'graph' || step === 'related') ? 'primary' : action === 'capture' && step === 'capture' ? 'primary' : 'idle');
    });
  };

  const updateGuidedServiceFlow = (step, detail = {}) => {
    step = guidedStepOrder.includes(step) ? step : 'capture';
    const activeIndex = guidedStepOrder.indexOf(step);
    guidedServiceFlow?.setAttribute('data-guided-flow-current-step', step);
    productValueStrip?.setAttribute('data-flow-collapsed', String(step !== 'capture' && step !== 'graph'));
    guidedServiceFlow?.setAttribute('data-guided-flow-source', detail.sourceMemoryId || shell.getAttribute('data-active-memory') || guidedServiceFlow?.getAttribute('data-guided-flow-source') || '');
    guidedServiceFlow?.setAttribute('data-guided-flow-related-count', String(detail.relatedCount ?? shell.getAttribute('data-related-memory-count') ?? guidedServiceFlow?.getAttribute('data-guided-flow-related-count') ?? '0'));
    if (detail.savedMemoryId) guidedServiceFlow?.setAttribute('data-guided-flow-saved-memory', detail.savedMemoryId);
    shell.setAttribute('data-guided-flow-current-step', step);
    updatePrototypeJourneyCockpit({
      step,
      sourceMemoryId: detail.sourceMemoryId,
      relatedCount: detail.relatedCount,
      aiState: step === 'ai' ? detail.aiState || 'ready' : detail.aiState,
      saveState: step === 'save' ? detail.saveState || 'saved' : detail.saveState,
      nextAction: detail.nextAction,
    });
    guidedFlowSteps.forEach((item) => {
      const itemStep = item.getAttribute('data-guided-flow-step') || '';
      const itemIndex = guidedStepOrder.indexOf(itemStep);
      item.setAttribute('data-guided-flow-state', itemIndex < activeIndex ? 'done' : itemStep === step ? 'active' : 'idle');
    });
  };

  const updateFlowCoach = (stage, nextAction, title, summary) => {
    flowCoach?.setAttribute('data-flow-coach-stage', stage);
    flowCoach?.setAttribute('data-flow-coach-next-action', nextAction);
    shell.setAttribute('data-flow-coach-stage', stage);
    shell.setAttribute('data-flow-coach-next-action', nextAction);
    if (flowCoachTitle) flowCoachTitle.textContent = title;
    if (flowCoachSummary) flowCoachSummary.textContent = summary;
    updatePrototypeJourneyCockpit({
      aiState: stage === 'ai-running' ? 'running' : stage === 'ai-answered' ? 'answered' : stage === 'ai-ready' ? 'ready' : stage === 'saved' ? 'session-completed' : undefined,
      saveState: stage === 'saved' ? 'saved' : undefined,
      nextAction,
    });
  };

  const setHandoffRouteState = (route, state) => {
    Array.from(diaryGraphHandoffMap?.querySelectorAll('[data-handoff-route]') || []).forEach((item) => {
      const itemRoute = item.getAttribute('data-handoff-route') || '';
      item.setAttribute('data-handoff-route-state', itemRoute === route ? state : state === 'done' ? 'idle' : 'idle');
    });
  };

  const updateDiaryGraphHandoffMap = (detail = {}) => {
    const route = detail.route || diaryGraphHandoffMap?.getAttribute('data-handoff-active-route') || 'none';
    const stage = detail.stage || diaryGraphHandoffMap?.getAttribute('data-handoff-stage') || 'waiting';
    const memoryId =
      detail.memoryId ||
      shell.getAttribute('data-import-session-source-memory') ||
      shell.getAttribute('data-active-memory') ||
      diaryGraphHandoffMap?.getAttribute('data-handoff-selected-memory') ||
      '';
    const relatedCount = String(
      detail.relatedCount ??
        shell.getAttribute('data-import-session-related-memory-count') ??
        shell.getAttribute('data-related-memory-count') ??
        diaryGraphHandoffMap?.getAttribute('data-handoff-related-count') ??
        '0',
    );
    const aiState = detail.aiState || diaryGraphHandoffMap?.getAttribute('data-handoff-ai-state') || 'idle';
    const savebackState = detail.savebackState || diaryGraphHandoffMap?.getAttribute('data-handoff-saveback-state') || 'idle';
    diaryGraphHandoffMap?.setAttribute('data-handoff-active-route', route);
    diaryGraphHandoffMap?.setAttribute('data-handoff-stage', stage);
    diaryGraphHandoffMap?.setAttribute('data-handoff-selected-memory', memoryId);
    diaryGraphHandoffMap?.setAttribute('data-handoff-related-count', relatedCount);
    diaryGraphHandoffMap?.setAttribute('data-handoff-ai-state', aiState);
    diaryGraphHandoffMap?.setAttribute('data-handoff-saveback-state', savebackState);
    shell.setAttribute('data-diary-graph-handoff-route', route);
    shell.setAttribute('data-diary-graph-handoff-stage', stage);
    shell.setAttribute('data-diary-graph-handoff-memory', memoryId);
    shell.setAttribute('data-diary-graph-handoff-related-count', relatedCount);
    if (route !== 'none') setHandoffRouteState(detail.route || 'web-paste-diary', stage === 'applied' || stage === 'session-saved' ? 'done' : 'active');
    if (handoffStageLabel) handoffStageLabel.textContent = '그래프 반영 상태 · ' + stage;
    if (handoffMemoryLabel) handoffMemoryLabel.textContent = '선택 기억 · ' + (memoryId || '대기');
    if (handoffRelatedLabel) handoffRelatedLabel.textContent = '연관 기억 · ' + relatedCount + '개';
    if (handoffAiLabel) handoffAiLabel.textContent = 'AI 실행 · ' + aiState;
    if (handoffSavebackLabel) handoffSavebackLabel.textContent = '미래 기억 저장 · ' + savebackState;
    updatePrototypeJourneyCockpit({
      step: stage === 'applied' || stage === 'session-ready' ? 'related' : stage === 'session-saved' ? 'save' : route === 'none' ? 'capture' : 'graph',
      sourceMemoryId: memoryId,
      relatedCount,
      aiState,
      saveState: savebackState,
    });
  };

  const renderIntakeRelatedBundle = () => {
    if (!intakeRelatedBundle || !intakeRelatedBundleList) return [];
    let related = Array.from(relatedMemoryList?.querySelectorAll('[data-related-memory-id]') || [])
      .slice(0, 3)
      .map((item) => ({
        id: item.getAttribute('data-related-memory-id') || '',
        title: item.querySelector('strong')?.textContent || item.getAttribute('data-related-memory-id') || '관련 기억',
        reason: item.querySelector('span')?.textContent || '그래프에서 연결됨',
      }))
      .filter((item) => item.id);
    if (!related.length) {
      related = memoryNodes.slice(0, 3).map((node) => ({
        id: node.getAttribute('data-inspector-citation') || '',
        title: node.querySelector('.node-label')?.textContent || node.getAttribute('data-inspector-citation') || '관련 기억',
        reason: '현재 그래프에서 바로 연결할 수 있는 과거 기억',
      })).filter((item) => item.id);
    }
    intakeRelatedBundle?.setAttribute('data-intake-related-bundle-count', String(related.length));
    intakeRelatedBundle?.setAttribute('data-intake-related-memory-ids', related.map((item) => item.id).join(','));
    if (intakeRelatedBundleSummary) {
      intakeRelatedBundleSummary.textContent = related.length
        ? '현재 일기와 연결된 과거 기억 ' + String(related.length) + '개'
        : '아직 연결된 과거 기억을 찾는 중이다';
    }
    setIntakeFlowStepState('related', related.length ? 'ready' : 'loading');
    intakeRelatedBundleList.replaceChildren();
    related.forEach((item) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'memory-intake-related-chip';
      chip.setAttribute('data-intake-related-memory-id', item.id);
      chip.setAttribute('data-intake-related-reason', item.reason);
      chip.innerHTML =
        '<strong>' +
        escapeText(item.title) +
        '</strong><span>' +
        escapeText(item.reason) +
        '</span>';
      chip.addEventListener('click', () => {
        selectMemoryByCitation(item.id);
        setInteractionState('intake-related-memory-selected');
      });
      intakeRelatedBundleList.append(chip);
    });
    [intakeRunAskButton, intakeRunReplayButton, intakeRunWeeklyButton, intakeRunSessionButton].forEach((button) => {
      if (related.length) button?.removeAttribute('disabled');
    });
    if (related.length) {
      updateFlowCoach(
        'ai-ready',
        'run-ai-session',
        '연관 기억을 찾았다',
        '이제 이 기억 묶음으로 기억에게 묻기, 결정 되짚기, 주간 패턴 또는 AI 세션을 실행하면 된다.',
      );
    }
    return related;
  };

  const setIntakeAiActionState = (kind, state, message) => {
    const labels = {
      ask: '기억에게 묻기',
      replay: '결정 되짚기',
      weekly: '주간 패턴',
    };
    const actionLabel = labels[kind] || 'AI 액션';
    memoryIntakeHub?.setAttribute('data-intake-last-ai-action', kind);
    memoryIntakeHub?.setAttribute('data-intake-ai-action-result', kind + '-' + state);
    intakeRelatedBundle?.setAttribute('data-intake-last-ai-action', kind);
    intakeRelatedBundle?.setAttribute('data-intake-ai-action-result', kind + '-' + state);
    intakeSessionResult?.setAttribute('data-intake-ai-action-result', kind + '-' + state);
    updateDiaryGraphHandoffMap({ aiState: kind + '-' + state });
    updatePrototypeJourneyCockpit({
      step: 'ai',
      aiState: state === 'answered' ? 'answered' : state === 'loading' ? 'running' : 'error',
      saveState: state === 'answered' ? 'ready' : 'idle',
      nextAction: state === 'answered' ? 'save-result' : 'run-ai-session',
    });
    setIntakeFlowStepState('ai', state === 'answered' ? 'done' : state === 'loading' ? 'loading' : 'error');
    updateFlowCoach(
      state === 'answered' ? 'ai-answered' : state === 'loading' ? 'ai-running' : 'ai-error',
      state === 'answered' ? 'save-result' : state === 'loading' ? 'wait-for-answer' : 'retry-ai',
      state === 'answered' ? actionLabel + ' 결과가 나왔다' : state === 'loading' ? actionLabel + ' 실행 중' : actionLabel + ' 다시 시도 필요',
      state === 'answered'
        ? '인용 근거가 있는 결과가 준비됐다. 이 결과를 기억으로 저장하면 다음 고민의 과거 근거가 된다.'
        : state === 'loading'
          ? '관련 과거 기억을 근거로 답을 만들고 있다.'
          : '오류가 났다. 같은 기억 묶음으로 다시 실행할 수 있다.',
    );
    if (intakeResultTitle) {
      intakeResultTitle.textContent =
        state === 'loading'
          ? actionLabel + ' 실행 중'
          : state === 'answered'
            ? actionLabel + ' 완료'
            : actionLabel + ' 실패';
    }
    if (intakeResultSummary) {
      intakeResultSummary.textContent =
        message ||
        (state === 'loading'
          ? '관련 과거 기억을 근거로 결과를 생성하고 있다.'
          : state === 'answered'
            ? '결과 패널과 그래프 하이라이트에 인용 근거가 반영됐다.'
            : '액션 실행 중 오류가 발생했다. 같은 기억 묶음으로 다시 시도할 수 있다.');
    }
    if (intakeSaveAiResultButton) {
      if (state === 'answered') {
        intakeSaveAiResultButton.removeAttribute('disabled');
        intakeSaveAiResultButton.setAttribute('data-intake-ai-save-state', 'ready');
        intakeSaveAiResultButton.textContent = '결과를 기억으로 저장';
      } else if (state === 'loading') {
        intakeSaveAiResultButton.setAttribute('disabled', '');
        intakeSaveAiResultButton.setAttribute('data-intake-ai-save-state', 'idle');
      }
    }
  };

  const saveLatestIntakeAiResult = () => {
    const lastAction = memoryIntakeHub?.getAttribute('data-intake-last-ai-action') || '';
    const targetSaveButton =
      lastAction === 'ask'
        ? document.querySelector('[data-save-artifact-action="ask_answer"]')
        : lastAction === 'replay'
          ? document.querySelector('[data-save-artifact-action="decision_replay"]')
          : lastAction === 'weekly'
            ? document.querySelector('[data-save-artifact-action="weekly_report"]')
            : null;
    if (!targetSaveButton || targetSaveButton.getAttribute('data-artifact-save-state') !== 'ready') return;
    intakeSaveAiResultButton?.setAttribute('data-intake-ai-save-state', 'saving');
    targetSaveButton?.click();
    const startedAt = Date.now();
    const waitForSaved = () => {
      const saveState = targetSaveButton.getAttribute('data-artifact-save-state') || '';
      if (saveState === 'saved') {
        const savedMemoryId = shell.getAttribute('data-last-saved-memory') || '';
        memoryIntakeHub?.setAttribute('data-intake-ai-save-state', 'saved');
        memoryIntakeHub?.setAttribute('data-intake-saved-ai-memory', savedMemoryId);
        intakeRelatedBundle?.setAttribute('data-intake-ai-save-state', 'saved');
        intakeSessionResult?.setAttribute('data-intake-saved-ai-memory', savedMemoryId);
        intakeSaveAiResultButton?.setAttribute('data-intake-ai-save-state', 'saved');
        if (intakeSaveAiResultButton) intakeSaveAiResultButton.textContent = '기억으로 저장됨';
        if (intakeResultTitle) intakeResultTitle.textContent = 'AI 결과가 미래 기억으로 저장됐다';
        if (intakeResultSummary) {
          intakeResultSummary.textContent =
            (savedMemoryId || '새 기억') + '으로 저장됐다. 다음 고민에서 이 결과도 과거 근거로 다시 불러올 수 있다.';
        }
        setIntakeFlowStepState('save', 'done');
        updateFlowCoach(
          'saved',
          'reopen-saved-memory',
          '미래 기억으로 저장됐다',
          (savedMemoryId || '새 기억') + '이 세컨브레인에 들어갔다. 다음 질문에서는 이 AI 결과도 과거 기억으로 다시 연결된다.',
        );
        setInteractionState('intake-ai-result-saved');
        return;
      }
      if (saveState === 'error' || Date.now() - startedAt > 12000) {
        memoryIntakeHub?.setAttribute('data-intake-ai-save-state', 'error');
        intakeSaveAiResultButton?.setAttribute('data-intake-ai-save-state', 'error');
        setIntakeFlowStepState('save', 'error');
        setInteractionState('intake-ai-result-save-error');
        return;
      }
      window.setTimeout(waitForSaved, 80);
    };
    waitForSaved();
  };

  const updateIntakeSessionResult = (appliedMemoryId) => {
    if (!intakeSessionResult || !appliedMemoryId) return;
    const related = renderIntakeRelatedBundle();
    const relatedCount =
      String(related.length || '') ||
      shell.getAttribute('data-import-session-related-memory-count') ||
      shell.getAttribute('data-related-memory-count') ||
      '0';
    intakeSessionResult.setAttribute('data-intake-applied-memory', appliedMemoryId);
    intakeSessionResult.setAttribute('data-intake-related-memory-count', relatedCount);
    intakeSessionResult.setAttribute('data-intake-next-step', 'memory-session-ready');
    memoryIntakeHub?.setAttribute('data-intake-applied-memory', appliedMemoryId);
    memoryIntakeHub?.setAttribute('data-intake-related-memory-count', relatedCount);
    memoryIntakeHub?.setAttribute('data-intake-next-step', 'memory-session-ready');
    setIntakeFlowStepState('capture', 'done');
    setIntakeFlowStepState('graph', 'done');
    setIntakeFlowStepState('related', related.length ? 'ready' : 'loading');
    setIntakeFlowStepState('ai', 'ready');
    updateDiaryGraphHandoffMap({ route: 'web-paste-diary', stage: 'applied', memoryId: appliedMemoryId, relatedCount, aiState: 'ready' });
    updateGuidedServiceFlow('related', { sourceMemoryId: appliedMemoryId, relatedCount, aiState: 'ready', saveState: 'idle', nextAction: 'inspect-related' });
    updateFlowCoach(
      'graph-ready',
      'inspect-related-memories',
      '새 일기가 세컨브레인에 들어왔다',
      appliedMemoryId + ' 기억이 그래프에 연결됐다. 관련 과거 기억을 확인한 뒤 AI 세션을 실행하면 된다.',
    );
    if (intakeResultTitle) intakeResultTitle.textContent = '새 일기가 그래프에 연결됐다';
    if (intakeResultSummary) {
      intakeResultSummary.textContent =
        appliedMemoryId + ' 기억에서 연관 과거 기억 ' + relatedCount + '개를 찾았다. 이제 AI 세션으로 질문, 결정 되짚기, 주간 패턴을 한 번에 실행할 수 있다.';
    }
    intakeRunSessionButton?.removeAttribute('disabled');
  };

  const setIntakeNotionState = (state, message) => {
    memoryIntakeHub?.setAttribute('data-intake-result', 'notion-' + state);
    memoryIntakeHub?.setAttribute('data-intake-next-step', state === 'preview-ready' ? 'notion-apply-ready' : state);
    intakeSessionResult?.setAttribute('data-intake-next-step', state === 'preview-ready' ? 'notion-apply-ready' : state);
    updateDiaryGraphHandoffMap({ route: 'notion-diary-db', stage: 'notion-ready', aiState: 'idle' });
    if (intakeResultTitle) {
      intakeResultTitle.textContent =
        state === 'token-required'
          ? 'Notion 연결이 필요하다'
          : state === 'rate-limited'
            ? 'Notion이 잠시 제한 중이다'
            : state === 'source-required'
              ? '습관리스트 소스를 먼저 선택해야 한다'
            : state === 'sources-ready'
              ? '습관리스트 소스 후보를 찾았다'
            : state === 'source-selected'
              ? '습관리스트 소스를 선택했다'
            : state === 'preview-ready'
              ? '습관리스트 미리보기가 준비됐다'
              : '습관리스트를 불러오는 중이다';
    }
    if (intakeResultSummary) {
      intakeResultSummary.textContent =
        message ||
        (state === 'token-required'
          ? 'Notion 통합 토큰이 없어서 실제 일기 DB를 아직 가져올 수 없다. 토큰이 연결되면 이 버튼이 같은 그래프 적용 흐름으로 이어진다.'
          : state === 'rate-limited'
            ? 'Notion API 제한이 풀리면 같은 버튼으로 다시 시도할 수 있다.'
            : state === 'source-required'
              ? '이름만으로는 DB를 확정할 수 없다. 소스 찾기에서 습관리스트를 선택하거나 정확한 database/data source id를 넣으면 그래프 적용이 이어진다.'
            : state === 'sources-ready'
              ? '후보 목록에서 습관리스트를 고르면 같은 첫 화면에서 미리보기와 그래프 적용을 이어갈 수 있다.'
            : state === 'source-selected'
              ? '선택한 습관리스트 소스로 미리보기를 만들거나 바로 그래프 적용을 실행할 수 있다.'
            : state === 'preview-ready'
              ? '미리보기 후보를 확인했다. Notion 그래프 적용을 누르면 비공개 기억 그래프에 반영된다.'
              : '습관리스트 일기 DB 미리보기를 준비한다.');
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

  const updateCaptureHandoffBanner = (state, memoryId, relatedCount) => {
    const normalizedMemoryId = String(memoryId || '').replace(/^memory:/, '');
    const count = String(relatedCount || shell.getAttribute('data-related-memory-count') || '0');
    captureHandoffBanner?.setAttribute('data-capture-handoff-banner-state', state);
    captureHandoffBanner?.setAttribute('data-capture-handoff-memory', normalizedMemoryId);
    captureHandoffBanner?.setAttribute('data-capture-handoff-related-count', count);
    captureHandoffBanner?.setAttribute('data-capture-handoff-save-state', state === 'session-saved' ? 'saved' : 'idle');
    shell.setAttribute('data-capture-handoff-banner-state', state);
    shell.setAttribute('data-capture-handoff-related-count', count);
    const currentHandoffRoute = diaryGraphHandoffMap?.getAttribute('data-handoff-active-route') || '';
    const nextHandoffRoute = state === 'idle' ? 'none' : currentHandoffRoute && currentHandoffRoute !== 'none' ? currentHandoffRoute : 'web-paste-diary';
    const nextHandoffStage = state === 'ready' ? 'session-ready' : state;
    updateDiaryGraphHandoffMap({
      route: nextHandoffRoute,
      stage: nextHandoffStage,
      memoryId: normalizedMemoryId,
      relatedCount: count,
      aiState: state === 'session-running' ? 'session-running' : state === 'session-completed' || nextHandoffStage === 'session-ready' ? 'session-ready' : diaryGraphHandoffMap?.getAttribute('data-handoff-ai-state') || 'idle',
      savebackState: state === 'session-saved' ? 'saved' : diaryGraphHandoffMap?.getAttribute('data-handoff-saveback-state') || 'idle',
    });
    if (captureHandoffTitle) {
      captureHandoffTitle.textContent =
        state === 'session-saved'
          ? '방금 저장한 일기 세션이 미래 기억으로 저장됐다'
          : state === 'session-completed'
            ? '방금 저장한 일기 세션 완료'
            : state === 'session-running'
              ? '방금 저장한 일기로 AI 세션 실행 중'
              : state === 'session-ready'
                ? '방금 저장한 일기로 AI 세션 준비 완료'
                : '방금 저장한 일기가 그래프에 선택됐다';
    }
    if (captureHandoffSummary) {
      captureHandoffSummary.textContent =
        state === 'session-saved'
          ? normalizedMemoryId + ' 세션 결과가 저장됐다. 다음 고민에서 이 결과도 과거 근거로 다시 불러올 수 있다.'
          : normalizedMemoryId + ' 기억에서 연관 과거 기억 ' + count + '개를 찾았다. 바로 질문, 결정 되짚기, 주간 패턴 세션을 실행할 수 있다.';
    }
  };

  const updateCaptureHandoffReentry = (savedMemoryId) => {
    if (!savedMemoryId) return;
    const graphUrl = '/?memory=' + encodeURIComponent(savedMemoryId);
    const sessionUrl = graphUrl + '&start=session';
    captureHandoffBanner?.setAttribute('data-capture-handoff-saved-memory', savedMemoryId);
    captureHandoffBanner?.setAttribute('data-capture-handoff-reentry-state', 'ready');
    shell.setAttribute('data-capture-handoff-saved-memory', savedMemoryId);
    shell.setAttribute('data-capture-handoff-reentry-state', 'ready');
    captureHandoffSavedGraphLink?.setAttribute('href', graphUrl);
    captureHandoffSavedSessionLink?.setAttribute('href', sessionUrl);
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
    updateCaptureHandoffBanner('ready', normalizedCitation, shell.getAttribute('data-related-memory-count') || '0');
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
    free: '자유 모드는 기억 탐색을 위해 그래프를 유기적으로 유지한다.',
    constellation: 'Constellation pins decision and thesis nodes around the selected memory.',
    hierarchy: '계층 모드는 출처, 패턴, 결정, 결과 노드 아래 기억을 정리한다.',
    timeline: '시간 모드는 오래된 일기 흔적부터 최근 가져오기까지 펼쳐 보여준다.',
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
        askSaveButton.textContent = '답변 저장';
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
      '<strong>선택한 기억 맥락</strong><span>' +
      escapeText(context.sourceMemoryId) +
      ' + ' +
      String(relatedMemoryIds.length) +
      '개의 연관 기억</span>';
    shell.setAttribute('data-' + kind + '-result-context-source-memory', context.sourceMemoryId);
    shell.setAttribute('data-' + kind + '-result-context-related-memory-count', String(relatedMemoryIds.length));
    shell.setAttribute('data-' + kind + '-result-context-related-memories', relatedMemoryIds.join(','));
    renderGroundedActionResult(kind, context, shell.getAttribute('data-' + kind + '-citation-count') || String(relatedMemoryIds.length + 1));
  };

  const renderGroundedActionResult = (kind, context, citationCount) => {
    if (!groundedActionResult || !context?.sourceMemoryId) return;
    const relatedMemoryIds = Array.from(new Set(context.relatedMemoryIds || [])).filter(Boolean);
    const labels = {
      ask: '질문',
      replay: '결정 되짚기',
      weekly: '주간 패턴',
    };
    const actionLabel = labels[kind] || 'AI 실행';
    groundedActionResult?.setAttribute('data-grounded-action-state', 'ready');
    groundedActionResult?.setAttribute('data-grounded-action-kind', kind);
    groundedActionResult?.setAttribute('data-grounded-action-source', context.sourceMemoryId);
    groundedActionResult?.setAttribute('data-grounded-action-related-count', String(relatedMemoryIds.length));
    groundedActionResult?.setAttribute('data-grounded-action-citation-count', String(citationCount || '0'));
    if (groundedActionSummary) {
      groundedActionSummary.textContent =
        actionLabel +
        ' 결과가 ' +
        context.sourceMemoryId +
        '와 연관 과거 기억 ' +
        String(relatedMemoryIds.length) +
        '개를 근거로 생성됐다.';
    }
    if (groundedActionSaveNext) {
      groundedActionSaveNext.textContent = '이 결과는 세션 저장을 누르면 다음 고민에서 다시 불러올 미래 기억이 된다.';
    }
    shell.setAttribute('data-grounded-action-kind', kind);
    shell.setAttribute('data-grounded-action-source', context.sourceMemoryId);
    shell.setAttribute('data-grounded-action-related-count', String(relatedMemoryIds.length));
    updateSelectedAiActionCenter({
      sourceMemoryId: context.sourceMemoryId,
      relatedCount: relatedMemoryIds.length,
      lastAction: kind,
      actionState: 'answered',
      citationCount: citationCount || '0',
      saveState: 'ready',
    });
  };

  const askSecondBrain = async () => {
    const question = askQuestionInput?.value?.trim() || '';
    if (!question || !askEndpoint) return;
    if (window.location.protocol === 'file:') {
      shell.setAttribute('data-ask-state', 'answered');
      shell.setAttribute('data-ask-citation-count', shell.getAttribute('data-related-memory-count') || '0');
      setInteractionState('ask-answered');
      return;
    }
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

  const runMemorySession = async (contextOverride) => {
    const context = contextOverride || getSelectedRelatedMemoryContext();
    if (!context) return;
    if (window.location.protocol === 'file:') {
      setMemorySessionStep('ask', 'completed');
      setMemorySessionStep('replay', 'completed');
      setMemorySessionStep('weekly', 'completed');
      setMemorySessionState('completed', context);
      if (captureHandoffBanner?.getAttribute('data-capture-handoff-banner-state') === 'session-running') {
        updateCaptureHandoffBanner('session-completed', context.sourceMemoryId, context.relatedMemoryIds.length);
      }
      setInteractionState('memory-session-completed');
      return;
    }
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
      if (captureHandoffBanner?.getAttribute('data-capture-handoff-banner-state') === 'session-running') {
        updateCaptureHandoffBanner('session-completed', context.sourceMemoryId, context.relatedMemoryIds.length);
      }
      setInteractionState('memory-session-completed');
    } catch (error) {
      setMemorySessionState('error', context);
      shell.setAttribute('data-memory-session-error', String(error?.message || error));
      setInteractionState('memory-session-error');
    } finally {
      runMemorySessionButton?.setAttribute('aria-busy', 'false');
    }
  };

  const currentCitationList = (attributeName) =>
    Array.from(new Set(String(shell.getAttribute(attributeName) || '').split(',').map((item) => item.trim()).filter(Boolean)));

  const buildMemorySessionArtifact = () => {
    const sourceMemoryId = memorySessionPanel?.getAttribute('data-session-source-memory') || shell.getAttribute('data-memory-session-source-memory') || '';
    const relatedMemoryIds = String(memorySessionPanel?.getAttribute('data-session-related-memories') || '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
    const askCitationMemoryIds = currentCitationList('data-live-ask-highlighted-memories');
    const replayCitationMemoryIds = currentCitationList('data-live-replay-highlighted-memories');
    const weeklyCitationMemoryIds = currentCitationList('data-live-weekly-highlighted-memories');
    const citationMemoryIds = Array.from(new Set([sourceMemoryId, ...relatedMemoryIds, ...askCitationMemoryIds, ...replayCitationMemoryIds, ...weeklyCitationMemoryIds].filter(Boolean))).sort();
    const createdAt = new Date().toISOString();
    const basis = [sourceMemoryId, ...citationMemoryIds, createdAt].join('|');
    let hash = 2166136261;
    for (let index = 0; index < basis.length; index += 1) {
      hash ^= basis.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    const artifactId = 'artifact_memory_session_sha-' + ((hash >>> 0).toString(36).padStart(7, '0'));
    return {
      id: artifactId,
      kind: 'memory_session',
      title: '기억 AI 세션: ' + sourceMemoryId,
      body: [
        '출발 기억: ' + sourceMemoryId,
        '연관 기억: ' + relatedMemoryIds.join(', '),
        '묻기 인용: ' + askCitationMemoryIds.join(', '),
        '결정 되짚기 인용: ' + replayCitationMemoryIds.join(', '),
        '주간 패턴 인용: ' + weeklyCitationMemoryIds.join(', '),
        '인용: ' + citationMemoryIds.join(', '),
      ].join('\\n'),
      createdAt,
      observedAt: createdAt.slice(0, 10),
      evidenceLabel: citationMemoryIds.length ? 'sufficient_evidence' : 'insufficient_evidence',
      confidence: citationMemoryIds.length ? 0.86 : 0,
      citationMemoryIds,
      graphHighlightIds: citationMemoryIds.map((memoryId) => 'memory:' + memoryId),
      privacyScope: 'private',
      metadata: {
        sourceMemoryId,
        relatedMemoryIds,
        relatedMemoryCount: relatedMemoryIds.length,
        askCitationCount: askCitationMemoryIds.length,
        replayCitationCount: replayCitationMemoryIds.length,
        weeklyCitationCount: weeklyCitationMemoryIds.length,
      },
    };
  };

  const saveMemorySession = async () => {
    if (!memorySessionSaveButton) return;
    const endpoint = memorySessionSaveButton.getAttribute('data-artifact-save-endpoint') || '/api/capture';
    const method = memorySessionSaveButton.getAttribute('data-artifact-save-method') || 'POST';
    const artifact = buildMemorySessionArtifact();
    memorySessionSaveButton.setAttribute('data-artifact-id', artifact.id);
    if (window.location.protocol === 'file:') {
      const savedMemoryId = 'mem_api_' + artifact.id;
      shell.setAttribute('data-last-saved-session-artifact', artifact.id);
      shell.setAttribute('data-last-saved-session-memory', savedMemoryId);
      shell.setAttribute('data-memory-session-save-state', 'saved');
      groundedActionResult?.setAttribute('data-grounded-action-save-state', 'saved');
      groundedActionResult?.setAttribute('data-grounded-action-saved-memory', savedMemoryId);
      groundedActionSaveback?.setAttribute('data-grounded-action-save-state', 'saved');
      updateSelectedAiActionCenter({
        sourceMemoryId: artifact.metadata.sourceMemoryId,
        relatedCount: artifact.metadata.relatedMemoryCount,
        lastAction: 'session',
        actionState: 'saved',
        citationCount: artifact.citationMemoryIds.length,
        saveState: 'saved',
      });
      if (groundedActionSaveback) groundedActionSaveback.textContent = '미래 기억으로 저장됨';
      intakeSessionResult?.setAttribute('data-intake-saved-session-memory', savedMemoryId);
      intakeSessionResult?.setAttribute('data-intake-next-step', 'session-saved');
      memoryIntakeHub?.setAttribute('data-intake-result', 'session-saved');
      memoryIntakeHub?.setAttribute('data-intake-saved-session-memory', savedMemoryId);
      memoryIntakeHub?.setAttribute('data-intake-next-step', 'session-saved');
      updateDiaryGraphHandoffMap({ stage: 'session-saved', memoryId: savedMemoryId, aiState: 'session-completed', savebackState: 'saved' });
      memorySessionSaveButton.setAttribute('data-artifact-save-state', 'saved');
      memorySessionSaveButton.textContent = '세션 저장 완료';
      if (captureHandoffBanner?.getAttribute('data-capture-handoff-banner-state') === 'session-completed') {
        updateCaptureHandoffBanner('session-saved', shell.getAttribute('data-memory-session-source-memory') || memorySessionPanel?.getAttribute('data-session-source-memory') || '', shell.getAttribute('data-memory-session-related-memory-count') || memorySessionPanel?.getAttribute('data-session-related-memory-count') || '0');
        updateCaptureHandoffReentry(savedMemoryId);
      }
      updateGuidedServiceFlow('save', {
        sourceMemoryId: shell.getAttribute('data-memory-session-source-memory') || memorySessionPanel?.getAttribute('data-session-source-memory') || '',
        relatedCount: shell.getAttribute('data-memory-session-related-memory-count') || memorySessionPanel?.getAttribute('data-session-related-memory-count') || '0',
        savedMemoryId,
      });
      updateFlowCoach(
        'saved',
        'reopen-saved-memory',
        'AI 세션이 미래 기억으로 저장됐다',
        savedMemoryId + '으로 저장됐다. 그래프에서 다시 열면 이 판단도 다음 고민의 과거 근거가 된다.',
      );
      setInteractionState('grounded-action-result-saved');
      return;
    }
    memorySessionSaveButton.setAttribute('data-artifact-save-state', 'saving');
    shell.setAttribute('data-memory-session-save-state', 'saving');
    const shouldUpdateCaptureHandoffAfterSave =
      captureHandoffBanner?.getAttribute('data-capture-handoff-banner-state') === 'session-completed';
    const captureHandoffSaveSource =
      shell.getAttribute('data-memory-session-source-memory') || memorySessionPanel?.getAttribute('data-session-source-memory') || '';
    const captureHandoffSaveRelatedCount =
      shell.getAttribute('data-memory-session-related-memory-count') ||
      memorySessionPanel?.getAttribute('data-session-related-memory-count') ||
      '0';
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ artifact }),
      });
      if (!response.ok) throw new Error('memory session save failed with ' + response.status);
      const body = await response.json().catch(() => ({}));
      const savedMemoryId = body?.createdMemoryIds?.[0] || body?.record?.id || 'mem_api_' + artifact.id;
      shell.setAttribute('data-last-saved-session-artifact', artifact.id);
      shell.setAttribute('data-last-saved-session-memory', savedMemoryId);
      await rehydrateAppShellAfterImport(savedMemoryId);
      shell.setAttribute('data-memory-session-save-state', 'saved');
      groundedActionResult?.setAttribute('data-grounded-action-save-state', 'saved');
      groundedActionResult?.setAttribute('data-grounded-action-saved-memory', savedMemoryId);
      groundedActionSaveback?.setAttribute('data-grounded-action-save-state', 'saved');
      updateSelectedAiActionCenter({
        sourceMemoryId: artifact.metadata.sourceMemoryId,
        relatedCount: artifact.metadata.relatedMemoryCount,
        lastAction: 'session',
        actionState: 'saved',
        citationCount: artifact.citationMemoryIds.length,
        saveState: 'saved',
      });
      if (groundedActionSaveback) groundedActionSaveback.textContent = '미래 기억으로 저장됨';
      intakeSessionResult?.setAttribute('data-intake-saved-session-memory', savedMemoryId);
      intakeSessionResult?.setAttribute('data-intake-next-step', 'session-saved');
      memoryIntakeHub?.setAttribute('data-intake-result', 'session-saved');
      memoryIntakeHub?.setAttribute('data-intake-saved-session-memory', savedMemoryId);
      memoryIntakeHub?.setAttribute('data-intake-next-step', 'session-saved');
      updateDiaryGraphHandoffMap({ stage: 'session-saved', memoryId: savedMemoryId, aiState: 'session-completed', savebackState: 'saved' });
      if (intakeResultTitle) intakeResultTitle.textContent = 'AI 세션이 미래 기억으로 저장됐다';
      if (intakeResultSummary) {
        intakeResultSummary.textContent =
          savedMemoryId + ' 기억으로 저장됐다. 다음 질문과 결정 되짚기는 이 세션도 과거 근거로 다시 불러올 수 있다.';
      }
      memorySessionSaveButton.setAttribute('data-artifact-save-state', 'saved');
      memorySessionSaveButton.textContent = '세션 저장 완료';
      if (shouldUpdateCaptureHandoffAfterSave) {
        updateCaptureHandoffBanner('session-saved', captureHandoffSaveSource, captureHandoffSaveRelatedCount);
        updateCaptureHandoffReentry(savedMemoryId);
      }
      updateGuidedServiceFlow('save', {
        sourceMemoryId: captureHandoffSaveSource || shell.getAttribute('data-memory-session-source-memory') || '',
        relatedCount: captureHandoffSaveRelatedCount,
        savedMemoryId,
      });
      updateFlowCoach(
        'saved',
        'reopen-saved-memory',
        'AI 세션이 미래 기억으로 저장됐다',
        savedMemoryId + '으로 저장됐다. 그래프에서 다시 열면 이 판단도 다음 고민의 과거 근거가 된다.',
      );
      setInteractionState('memory-session-saved');
      setInteractionState('grounded-action-result-saved');
    } catch (error) {
      shell.setAttribute('data-memory-session-save-state', 'error');
      shell.setAttribute('data-memory-session-save-error', String(error?.message || error));
      memorySessionSaveButton.setAttribute('data-artifact-save-state', 'error');
      setInteractionState('memory-session-save-error');
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
    if (!prompt || !replayEndpoint) return;
    if (window.location.protocol === 'file:') {
      shell.setAttribute('data-replay-state', 'answered');
      decisionReplayPanel?.setAttribute('data-replay-state', 'answered');
      shell.setAttribute('data-replay-citation-count', shell.getAttribute('data-related-memory-count') || '0');
      setInteractionState('decision-replay-answered');
      return;
    }
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
    if (!weeklyReportEndpoint) return;
    if (window.location.protocol === 'file:') {
      weeklyReportPanel?.setAttribute('data-weekly-report-state', 'ready');
      shell.setAttribute('data-weekly-report-state', 'ready');
      shell.setAttribute('data-weekly-report-citation-count', shell.getAttribute('data-related-memory-count') || '0');
      setInteractionState('weekly-report-ready');
      return;
    }
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
  memorySessionSaveButton?.addEventListener('click', () => {
    void saveMemorySession();
  });
  groundedActionSaveback?.addEventListener('click', async () => {
    groundedActionResult?.setAttribute('data-grounded-action-save-state', 'saving');
    groundedActionSaveback?.setAttribute('data-grounded-action-save-state', 'saving');
    updateSelectedAiActionCenter({ lastAction: 'session', actionState: 'running', saveState: 'saving' });
    if (shell.getAttribute('data-memory-session-state') !== 'completed') {
      await runMemorySession();
      await waitForShellState('data-memory-session-state', 'completed');
    }
    await saveMemorySession();
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

  diaryInboxItems.forEach((item) => {
    item.addEventListener('click', () => {
      const citation = item.getAttribute('data-diary-inbox-memory-id') || '';
      if (!citation) return;
      selectMemoryByCitation(citation);
      updateDiaryInboxSelection(citation);
      setInteractionState('diary-inbox-memory-selected');
    });
  });
  diaryInbox?.addEventListener('click', (event) => {
    const item = event.target?.closest?.('[data-control="diary-inbox-select-memory"]');
    const citation = item?.getAttribute('data-diary-inbox-memory-id') || '';
    if (!citation) return;
    selectMemoryByCitation(citation);
    updateDiaryInboxSelection(citation);
    setInteractionState('diary-inbox-memory-selected');
  });
  document.addEventListener('click', (event) => {
    const item = event.target?.closest?.('[data-control="diary-inbox-select-memory"]');
    if (!item) return;
    const citation = item.getAttribute('data-diary-inbox-memory-id') || '';
    if (!citation) return;
    selectMemoryByCitation(citation);
    updateDiaryInboxSelection(citation);
    setInteractionState('diary-inbox-memory-selected');
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
    feedbackSubmit.textContent = feedbackSubmit.getAttribute('data-feedback-submitted-label') || '피드백 저장됨';
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

  const diaryNotionSourceTerms = ['습관리스트', '습관리', '습관', '일기', '다이어리', 'diary', 'journal', 'habit', 'daily'];
  const findBestDiaryNotionSource = (sources) => {
    const sourceList = Array.isArray(sources) ? sources : [];
    return (
      sourceList.find((source) => {
        const sourceText = String(source?.title || source?.id || '').toLowerCase();
        return diaryNotionSourceTerms.some((term) => sourceText.includes(term.toLowerCase()));
      }) || null
    );
  };
  const selectNotionSource = (source, mode = 'manual') => {
    const sourceId = String(source?.id || '');
    const sourceTitle = String(source?.title || sourceId || '선택한 소스');
    if (!sourceId) return false;
    if (notionDatabaseId) notionDatabaseId.value = sourceId;
    notionImportPanel?.setAttribute('data-notion-selected-source', sourceId);
    notionImportPanel?.setAttribute('data-notion-selected-source-title', sourceTitle);
    notionImportPanel?.setAttribute('data-notion-auto-selected-source', mode === 'auto' ? 'true' : 'false');
    memoryIntakeHub?.setAttribute('data-intake-selected-notion-source', sourceId);
    memoryIntakeHub?.setAttribute('data-intake-selected-notion-source-title', sourceTitle);
    memoryIntakeHub?.setAttribute('data-intake-selected-notion-source-mode', mode);
    memoryIntakeHub?.setAttribute('data-intake-result', 'notion-source-selected');
    memoryIntakeHub?.setAttribute('data-intake-next-step', 'notion-preview-ready');
    intakeSessionResult?.setAttribute('data-intake-selected-notion-source', sourceId);
    intakeSessionResult?.setAttribute('data-intake-selected-notion-source-title', sourceTitle);
    intakeSessionResult?.setAttribute('data-intake-next-step', 'notion-preview-ready');
    if (mode === 'auto') {
      setIntakeNotionState('source-selected', sourceTitle + ' 소스를 자동으로 선택했다. 이제 습관리스트 미리보기 또는 Notion 그래프 적용을 바로 실행할 수 있다.');
      setInteractionState('notion-source-auto-selected');
      return true;
    }
    setIntakeNotionState('source-selected', sourceTitle + ' 소스를 선택했다. 이제 습관리스트 미리보기 또는 Notion 그래프 적용을 실행할 수 있다.');
    setInteractionState('notion-source-selected');
    return true;
  };

  const renderNotionSourceRows = (sources) => {
    if (!notionSourceList) return false;
    notionSourceList.innerHTML = (sources || [])
      .slice(0, 5)
      .map(
        (source) =>
          '<button type="button" data-control="select-notion-source" data-notion-source-id="' +
          escapeText(source.id || '') +
          '" data-notion-source-title="' +
          escapeText(source.title || source.id || 'Untitled source') +
          '"><strong>' +
          escapeText(source.title || source.id || 'Untitled source') +
          '</strong><span>' +
          escapeText(source.object || 'data_source') +
          '</span></button>',
      )
      .join('');
    Array.from(notionSourceList.querySelectorAll('[data-control="select-notion-source"]')).forEach((button) => {
      button.addEventListener('click', () => {
        selectNotionSource({
          id: button.getAttribute('data-notion-source-id') || '',
          title: button.getAttribute('data-notion-source-title') || button.querySelector('strong')?.textContent || '',
        });
      });
    });
    const autoSelectedSource = findBestDiaryNotionSource(sources);
    const currentDatabaseId = notionDatabaseId?.value?.trim() || '';
    const shouldAutoSelect =
      memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion') &&
      autoSelectedSource &&
      (!currentDatabaseId || currentDatabaseId === '습관리스트' || currentDatabaseId === autoSelectedSource.id);
    return shouldAutoSelect ? selectNotionSource(autoSelectedSource, 'auto') : false;
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
      records.forEach((record, index) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'timeline-memory-item imported-memory-item';
        item.setAttribute('data-control', 'timeline-select-memory');
        item.setAttribute('data-timeline-memory-id', record.id || '');
        item.setAttribute('data-timeline-active', index === 0 ? 'true' : 'false');
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
    shell.setAttribute('data-import-session-source-memory', '');
    shell.setAttribute('data-import-session-related-memory-count', '0');
    shell.setAttribute('data-import-session-state', 'undone');
    if (importAppliedFeedback) importAppliedFeedback.setAttribute('data-import-applied-count', '0');
    if (importAppliedMemoryList) importAppliedMemoryList.innerHTML = '';
    if (importUndoButton) importUndoButton.setAttribute('disabled', '');
  };

  const prepareImportedMemorySession = (targetMemoryId) => {
    if (!targetMemoryId) return false;
    const selected = selectHandoffMemoryFromGraph(targetMemoryId);
    if (!selected) return false;
    shell.setAttribute('data-import-session-source-memory', targetMemoryId);
    shell.setAttribute('data-import-session-related-memory-count', shell.getAttribute('data-related-memory-count') || '0');
    shell.setAttribute('data-import-session-state', 'ready');
    setMemorySessionState('ready', {
      sourceMemoryId: targetMemoryId,
      relatedMemoryIds: Array.from(relatedMemoryList?.querySelectorAll('[data-related-memory-id]') || [])
        .map((item) => item.getAttribute('data-related-memory-id') || '')
        .filter(Boolean),
    });
    return true;
  };

  const prepareHandoffSessionFromQuery = () => {
    if (handoffStartMode !== 'session' || !handoffMemoryId) return false;
    const prepared = prepareImportedMemorySession(handoffMemoryId);
    if (!prepared) return false;
    shell.setAttribute('data-capture-handoff-start-mode', 'session');
    shell.setAttribute('data-capture-handoff-session-state', 'ready');
    updateCaptureHandoffBanner('session-ready', handoffMemoryId, shell.getAttribute('data-import-session-related-memory-count') || shell.getAttribute('data-related-memory-count') || '0');
    return true;
  };

  const rehydrateAppShellAfterImport = async (targetMemoryId) => {
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
      if (targetMemoryId) {
        prepareImportedMemorySession(targetMemoryId);
      } else if (!prepareHandoffSessionFromQuery()) {
        selectHandoffMemoryFromGraph(handoffMemoryId);
      } else {
        shell.setAttribute('data-capture-handoff-state', 'selected');
      }
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
        notionImportPanel.setAttribute('data-notion-sources-state', 'source-required');
        notionImportPanel.setAttribute('data-notion-source-count', '0');
        if (notionImportSummary) notionImportSummary.textContent = 'Notion source selection required';
        if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion')) setIntakeNotionState('source-required');
        } else {
          const response = await fetch(endpoint, {
          method: 'GET',
          headers: { accept: 'application/json' },
          });
        if (response.status === 424) {
          notionImportPanel.setAttribute('data-notion-sources-state', 'token-required');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion token required';
          if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion')) setIntakeNotionState('token-required');
          setInteractionState('notion-import-token-required');
          return;
        }
        if (response.status === 429) {
          notionImportPanel.setAttribute('data-notion-sources-state', 'rate-limited');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion rate limited. Retry shortly.';
          if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion')) setIntakeNotionState('rate-limited');
          setInteractionState('notion-sources-rate-limited');
          return;
        }
        if (response.status === 502) {
          notionImportPanel.setAttribute('data-notion-sources-state', 'source-required');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion source selection required';
          if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion')) setIntakeNotionState('source-required');
          setInteractionState('notion-sources-source-required');
          return;
        }
        if (!response.ok) throw new Error('notion source search failed with ' + response.status);
        const body = await response.json();
        const sources = body?.sources || [];
        notionImportPanel.setAttribute('data-notion-sources-state', 'ready');
        notionImportPanel.setAttribute('data-notion-source-count', String(sources.length));
        if (notionImportSummary) notionImportSummary.textContent = sources.length + ' Notion sources';
        const didAutoSelectSource = renderNotionSourceRows(sources);
        if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion') && !didAutoSelectSource) {
          setIntakeNotionState('sources-ready', String(sources.length) + '개의 Notion 소스 후보를 찾았다. 습관리스트를 선택하면 미리보기와 그래프 적용이 이어진다.');
        }
      }
      if (shell.getAttribute('data-interaction-state') !== 'notion-source-auto-selected') setInteractionState('notion-sources-ready');
    } catch (error) {
      notionImportPanel.setAttribute('data-notion-sources-state', 'error');
      shell.setAttribute('data-notion-sources-error', String(error?.message || error));
      if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion')) setIntakeNotionState('source-required');
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
          notionImportPanel.setAttribute('data-notion-import-state', 'source-required');
          notionImportPanel.setAttribute('data-notion-import-candidate-count', '0');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion source selection required';
          setIntakeNotionState('source-required');
          setInteractionState('notion-import-source-required');
          return;
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
          setIntakeNotionState('token-required');
          setInteractionState('notion-import-token-required');
          return;
        }
        if (response.status === 429) {
          notionImportPanel.setAttribute('data-notion-import-state', 'rate-limited');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion rate limited. Retry shortly.';
          setIntakeNotionState('rate-limited');
          setInteractionState('notion-import-rate-limited');
          return;
        }
        if (response.status === 502) {
          notionImportPanel.setAttribute('data-notion-import-state', 'source-required');
          if (notionImportSummary) notionImportSummary.textContent = 'Notion source selection required';
          setIntakeNotionState('source-required');
          setInteractionState('notion-import-source-required');
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
      if (memoryIntakeHub?.getAttribute('data-intake-last-action')?.includes('notion')) {
        setIntakeNotionState('preview-ready');
      }
      importApplyButton?.removeAttribute('disabled');
      setInteractionState('notion-import-preview-ready');
      if (pendingIntakeNotionApplyAfterPreview) {
        pendingIntakeNotionApplyAfterPreview = false;
        importApplyButton?.click();
      }
    } catch (error) {
      notionImportPanel.setAttribute('data-notion-import-state', 'error');
      shell.setAttribute('data-notion-import-error', String(error?.message || error));
      setInteractionState('notion-import-error');
    }
  });

  importPreviewButton?.addEventListener('click', async () => {
    if (!importUploadPanel) return;
    if (!pendingIntakeApplyAfterPreview && memoryIntakeHub?.getAttribute('data-intake-last-action') === 'apply-diary') {
      memoryIntakeHub.setAttribute('data-intake-last-action', 'local-import');
    }
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
      if (pendingIntakeApplyAfterPreview) {
        pendingIntakeApplyAfterPreview = false;
        memoryIntakeHub?.setAttribute('data-intake-draft-state', 'preview-ready');
        importApplyButton?.click();
      }
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
    let appliedMemoryId = '';
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
        appliedMemoryId = body.createdMemoryIds?.[0] || '';
        lastLocalImportUndoAction = body.undoAction || null;
        renderAppliedImportFeedback(body.createdMemoryIds || [], body.graphEvidenceRecords || []);
        if (lastLocalImportUndoAction?.enabled) importUndoButton?.removeAttribute('disabled');
        await rehydrateAppShellAfterImport(appliedMemoryId);
      } else {
        const previewRecords = Array.isArray(lastLocalImportPreview.records) ? lastLocalImportPreview.records : [];
        const graphEvidenceRecords = previewRecords.map((record, index) => ({
          id: record.id || 'local_preview_' + (index + 1),
          summary: record.memoryRecord?.summary || record.memoryRecord?.rawText || record.id || 'Local import memory',
          sourceType: record.sourceType || 'markdown',
          observedAt: record.observedDate || new Date().toISOString().slice(0, 10),
        }));
        const createdMemoryIds = graphEvidenceRecords.map((record) => record.id).filter(Boolean);
        appliedMemoryId = createdMemoryIds[0] || '';
        lastLocalImportUndoAction = { enabled: true, appliedMemoryRecordIds: createdMemoryIds };
        renderAppliedImportFeedback(createdMemoryIds, graphEvidenceRecords);
        if (lastLocalImportUndoAction.enabled) importUndoButton?.removeAttribute('disabled');
        const isIntakeDiaryApply = memoryIntakeHub?.getAttribute('data-intake-last-action') === 'apply-diary';
        if (!isIntakeDiaryApply) {
          shell.setAttribute('data-graph-rehydrate-state', 'ready');
          shell.setAttribute('data-graph-rebuild-state', 'rebuilt');
          shell.setAttribute('data-rehydrated-memory-node-count', String(memoryNodes.length + createdMemoryIds.length));
          if (window.__personalMemoryGraph?.stats) {
            window.__personalMemoryGraph.stats.memoryNodeCount = memoryNodes.length + createdMemoryIds.length;
          }
        }
        if (appliedMemoryId) {
          const relatedMemoryIds = renderIntakeRelatedBundle().map((item) => item.id).filter(Boolean);
          shell.setAttribute('data-active-memory', appliedMemoryId);
          shell.setAttribute('data-import-session-source-memory', appliedMemoryId);
          shell.setAttribute('data-import-session-related-memory-count', String(relatedMemoryIds.length));
          shell.setAttribute('data-import-session-related-memories', relatedMemoryIds.join(','));
          shell.setAttribute('data-import-session-state', 'ready');
        }
      }
      importUploadPanel.setAttribute('data-import-upload-state', 'applied');
      if (memoryIntakeHub?.getAttribute('data-intake-last-action') === 'apply-diary') {
        memoryIntakeHub?.setAttribute('data-intake-draft-state', 'applied');
        memoryIntakeHub?.setAttribute('data-intake-result', 'graph-applied');
        updateIntakeSessionResult(appliedMemoryId || shell.getAttribute('data-import-session-source-memory') || '');
      }
      if (memoryIntakeHub?.getAttribute('data-intake-last-action') === 'apply-notion-diary') {
        memoryIntakeHub?.setAttribute('data-intake-result', 'notion-graph-applied');
        updateIntakeSessionResult(appliedMemoryId || shell.getAttribute('data-import-session-source-memory') || '');
      }
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
    } else {
      const revisionId = 'memory_review_static_' + Date.now();
      memoryReviewPanel.setAttribute('data-memory-review-ledger', 'recorded');
      memoryReviewPanel.setAttribute('data-memory-review-revision', revisionId);
      appendMemoryReviewComparison({
        id: revisionId,
        memoryId,
        previousSummary: memoryReviewPanel.getAttribute('data-memory-review-original-summary') || '',
        nextSummary: memoryEditSummary?.value || '',
        previousRawText: memoryReviewPanel.getAttribute('data-memory-review-original-raw-text') || '',
        nextRawText: memoryEditRawText?.value || '',
        createdAt: new Date().toISOString(),
      });
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
  intakeRunAskButton?.addEventListener('click', async () => {
    setIntakeAiActionState('ask', 'loading', '관련 과거 기억을 근거로 현재 반복 패턴을 묻고 있다.');
    try {
      askWithRelatedMemoryContext();
      await askSecondBrain();
      setIntakeAiActionState('ask', 'answered',
        '기억에게 묻기 결과가 준비됐다. 인용 기억 ' + (shell.getAttribute('data-ask-citation-count') || '0') + '개가 그래프에 하이라이트됐다.',
      );
    } catch (error) {
      setIntakeAiActionState('ask', 'error', String(error?.message || error));
    }
  });
  intakeRunReplayButton?.addEventListener('click', async () => {
    setIntakeAiActionState('replay', 'loading', '관련 과거 선택과 결과를 기준으로 현재 결정을 비교하고 있다.');
    try {
      replayWithRelatedMemoryContext();
      await replayCurrentDecision();
      setIntakeAiActionState('replay', 'answered',
        '결정 되짚기 결과가 준비됐다. 인용 기억 ' + (shell.getAttribute('data-replay-citation-count') || '0') + '개가 그래프에 하이라이트됐다.',
      );
    } catch (error) {
      setIntakeAiActionState('replay', 'error', String(error?.message || error));
    }
  });
  intakeRunWeeklyButton?.addEventListener('click', async () => {
    setIntakeAiActionState('weekly', 'loading', '관련 기억 묶음이 포함된 주간 패턴을 생성하고 있다.');
    try {
      reportWithRelatedMemoryContext();
      await refreshWeeklyReport();
      setIntakeAiActionState('weekly', 'answered',
        '주간 패턴 결과가 준비됐다. 포함 기억 ' + (shell.getAttribute('data-weekly-report-citation-count') || '0') + '개가 그래프에 하이라이트됐다.',
      );
    } catch (error) {
      setIntakeAiActionState('weekly', 'error', String(error?.message || error));
    }
  });
  intakeSaveAiResultButton?.addEventListener('click', saveLatestIntakeAiResult);
  intakeRunSessionButton?.addEventListener('click', () => {
    intakeSessionResult?.setAttribute('data-intake-next-step', 'memory-session-running');
    memoryIntakeHub?.setAttribute('data-intake-next-step', 'memory-session-running');
    void runMemorySession(getIntakeMemorySessionContext());
  });
  captureHandoffRunSessionButton?.addEventListener('click', () => {
    updateCaptureHandoffBanner('session-running', captureHandoffBanner?.getAttribute('data-capture-handoff-memory') || shell.getAttribute('data-capture-handoff-selected-memory') || '', captureHandoffBanner?.getAttribute('data-capture-handoff-related-count') || shell.getAttribute('data-capture-handoff-related-count') || '0');
    void runMemorySession();
  });
  guidedFlowActions.forEach((button) => {
    button.addEventListener('click', (event) => {
      const action = button.getAttribute('data-guided-flow-action') || '';
      guidedServiceFlow?.setAttribute('data-guided-flow-last-action', action);
      shell.setAttribute('data-guided-flow-last-action', action);
      if (action === 'start-capture') return;
      event.preventDefault();
      if (action === 'focus-graph') {
        document.querySelector('.graph-stage')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        updateGuidedServiceFlow('graph');
        setInteractionState('guided-flow-graph-focused');
        return;
      }
      if (action === 'run-session') {
        updateGuidedServiceFlow('ai');
        void runMemorySession();
        return;
      }
      if (action === 'save-result') {
        void saveMemorySession();
      }
    });
  });
  journeyPrimaryActions.forEach((button) => {
    button.addEventListener('click', (event) => {
      const action = button.getAttribute('data-journey-primary-action') || '';
      prototypeJourneyCockpit?.setAttribute('data-journey-last-click', action);
      shell.setAttribute('data-journey-last-click', action);
      if (action === 'capture') return;
      event.preventDefault();
      if (action === 'graph') {
        document.querySelector('.graph-stage')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        updateGuidedServiceFlow('graph', { nextAction: 'inspect-graph' });
        setInteractionState('journey-cockpit-graph-focused');
        return;
      }
      if (action === 'session') {
        updateGuidedServiceFlow('ai', { nextAction: 'run-ai-session' });
        void runMemorySession();
      }
    });
  });
  selectedPathActions.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-selected-path-action');
      selectedPathPanel?.setAttribute('data-selected-path-last-action', action || '');
      if (action === 'ask') {
        askWithRelatedMemoryContext();
        return;
      }
      if (action === 'replay') {
        replayWithRelatedMemoryContext();
        return;
      }
      if (action === 'weekly') {
        reportWithRelatedMemoryContext();
        return;
      }
      if (action === 'session') {
        void runMemorySession();
      }
    });
  });
  commandRailActions.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-command-rail-action');
      commandRail?.setAttribute('data-command-rail-last-action', action || '');
      shell.setAttribute('data-command-rail-last-action', action || '');
      if (action === 'ask') {
        askWithRelatedMemoryContext();
        setInteractionState('command-rail-ask-ready');
        return;
      }
      if (action === 'replay') {
        replayWithRelatedMemoryContext();
        setInteractionState('command-rail-replay-ready');
        return;
      }
      if (action === 'weekly') {
        reportWithRelatedMemoryContext();
        setInteractionState('command-rail-weekly-ready');
        return;
      }
      if (action === 'session') {
        void runMemorySession();
      }
    });
  });
  relatedWorkbenchActions.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-related-workbench-action');
      relatedMemoryWorkbench?.setAttribute('data-related-workbench-last-action', action || '');
      shell.setAttribute('data-related-workbench-last-action', action || '');
      if (action === 'ask') {
        askWithRelatedMemoryContext();
        setInteractionState('related-workbench-ask-ready');
        return;
      }
      if (action === 'replay') {
        replayWithRelatedMemoryContext();
        setInteractionState('related-workbench-replay-ready');
        return;
      }
      if (action === 'weekly') {
        reportWithRelatedMemoryContext();
        setInteractionState('related-workbench-weekly-ready');
        return;
      }
      if (action === 'session') {
        void runMemorySession();
      }
    });
  });
  relatedInsightActions.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-related-insight-action');
      relatedInsightBridge?.setAttribute('data-related-insight-last-action', action || '');
      if (action === 'ask') {
        askWithRelatedMemoryContext();
        setInteractionState('related-insight-ask-ready');
        return;
      }
      if (action === 'replay') {
        replayWithRelatedMemoryContext();
        setInteractionState('related-insight-replay-ready');
        return;
      }
      if (action === 'weekly') {
        reportWithRelatedMemoryContext();
        setInteractionState('related-insight-weekly-ready');
      }
    });
  });
  focusLocalImportButton?.addEventListener('click', () => {
    importPasteText?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    importPasteText?.focus();
    setInteractionState('diary-import-focused');
  });
  const syncIntakeDraftToImportPaste = () => {
    if (!intakeDiaryDraft || !importPasteText) return false;
    importPasteText.value = intakeDiaryDraft.value;
    importPasteText.dispatchEvent(new Event('input', { bubbles: true }));
    memoryIntakeHub?.setAttribute('data-intake-draft-length', String(intakeDiaryDraft.value.trim().length));
    return Boolean(intakeDiaryDraft.value.trim());
  };
  intakePreviewDiaryButton?.addEventListener('click', () => {
    if (!syncIntakeDraftToImportPaste()) {
      memoryIntakeHub?.setAttribute('data-intake-draft-state', 'empty');
      setInteractionState('intake-diary-draft-empty');
      return;
    }
    memoryIntakeHub?.setAttribute('data-intake-last-action', 'preview-diary');
    memoryIntakeHub?.setAttribute('data-intake-draft-state', 'preview-requested');
    shell.setAttribute('data-intake-last-action', 'preview-diary');
    updateDiaryGraphHandoffMap({ route: 'web-paste-diary', stage: 'previewing', aiState: 'idle', savebackState: 'idle' });
    importPreviewButton?.click();
    setInteractionState('intake-diary-preview-requested');
  });
  intakeApplyDiaryButton?.addEventListener('click', () => {
    if (!syncIntakeDraftToImportPaste()) {
      memoryIntakeHub?.setAttribute('data-intake-draft-state', 'empty');
      setInteractionState('intake-diary-draft-empty');
      return;
    }
    memoryIntakeHub?.setAttribute('data-intake-last-action', 'apply-diary');
    memoryIntakeHub?.setAttribute('data-intake-draft-state', 'apply-requested');
    shell.setAttribute('data-intake-last-action', 'apply-diary');
    updateDiaryGraphHandoffMap({ route: 'web-paste-diary', stage: 'applying', aiState: 'idle', savebackState: 'idle' });
    pendingIntakeApplyAfterPreview = true;
    importPreviewButton?.click();
    setInteractionState('intake-diary-apply-requested');
  });
  const prepareNotionDiaryIntake = (action) => {
    if (notionDatabaseId && !notionDatabaseId.value.trim()) notionDatabaseId.value = '습관리스트';
    memoryIntakeHub?.setAttribute('data-intake-last-action', action);
    memoryIntakeHub?.setAttribute('data-intake-stage', 'notion-diary-ready');
    memoryIntakeHub?.setAttribute('data-intake-source-scope', 'diary-only');
    shell.setAttribute('data-intake-last-action', action);
    notionImportPanel?.setAttribute('data-notion-source-scope', 'diary-only');
    updateDiaryGraphHandoffMap({ route: 'notion-diary-db', stage: 'notion-ready', aiState: 'idle', savebackState: 'idle' });
    updateFlowCoach('importing', 'preview-diary-db', '일기 DB를 불러오는 중', '습관리스트/일기 데이터베이스만 가져와서 개인 기억 그래프에 연결할 준비를 한다.');
    setIntakeFlowStepState('capture', 'loading');
    setIntakeFlowStepState('graph', 'idle');
    setIntakeFlowStepState('related', 'idle');
    setIntakeFlowStepState('ai', 'idle');
    setIntakeFlowStepState('save', 'idle');
    setIntakeNotionState('loading');
  };
  intakeFindNotionSourceButton?.addEventListener('click', () => {
    prepareNotionDiaryIntake('find-notion-source');
    notionSourcesButton?.click();
    setInteractionState('intake-notion-source-search-requested');
  });
  intakePreviewNotionButton?.addEventListener('click', () => {
    prepareNotionDiaryIntake('preview-notion-diary');
    notionImportPreviewButton?.click();
    setInteractionState('intake-notion-diary-preview-requested');
  });
  intakeApplyNotionButton?.addEventListener('click', () => {
    prepareNotionDiaryIntake('apply-notion-diary');
    if (importApplyButton?.hasAttribute('disabled') || notionImportPanel?.getAttribute('data-notion-import-state') !== 'preview-ready') {
      pendingIntakeNotionApplyAfterPreview = true;
      notionImportPreviewButton?.click();
    } else {
      importApplyButton?.click();
    }
    setInteractionState('intake-notion-diary-apply-requested');
  });
  intakeActions.forEach((button) => {
    button.addEventListener('click', (event) => {
      const action = button.getAttribute('data-intake-action') || '';
      memoryIntakeHub?.setAttribute('data-intake-last-action', action);
      shell.setAttribute('data-intake-last-action', action);
      if (action === 'quick-capture') {
        updateDiaryGraphHandoffMap({ route: 'app-quick-diary', stage: 'capture-opened', aiState: 'idle', savebackState: 'idle' });
        return;
      }
      event.preventDefault();
      if (action === 'paste-diary') {
        importPasteText?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        importPasteText?.focus();
        memoryIntakeHub?.setAttribute('data-intake-stage', 'paste-diary-focused');
        updateDiaryGraphHandoffMap({ route: 'web-paste-diary', stage: 'drafting', aiState: 'idle', savebackState: 'idle' });
        updateFlowCoach('importing', 'paste-and-preview', '웹에서 일기를 붙여넣는 단계', '긴 일기나 Markdown을 붙여넣고 미리보기를 만들면 그래프에 넣을 기억 후보가 나온다.');
        setIntakeFlowStepState('capture', 'loading');
        setIntakeFlowStepState('graph', 'idle');
        setIntakeFlowStepState('related', 'idle');
        setIntakeFlowStepState('ai', 'idle');
        setIntakeFlowStepState('save', 'idle');
        setInteractionState('intake-paste-diary-focused');
        return;
      }
      if (action === 'notion-diary-db') {
        if (notionDatabaseId && !notionDatabaseId.value.trim()) notionDatabaseId.value = '습관리스트';
        notionImportPanel?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        notionDatabaseId?.focus();
        memoryIntakeHub?.setAttribute('data-intake-stage', 'notion-diary-ready');
        notionImportPanel?.setAttribute('data-notion-source-scope', 'diary-only');
        updateDiaryGraphHandoffMap({ route: 'notion-diary-db', stage: 'notion-ready', aiState: 'idle', savebackState: 'idle' });
        updateFlowCoach('importing', 'select-notion-diary-db', '습관리스트 일기 DB 선택', 'Notion에서 일기 데이터베이스만 선택해 미리보기와 그래프 적용으로 이어간다.');
        setIntakeFlowStepState('capture', 'loading');
        setIntakeFlowStepState('graph', 'idle');
        setIntakeFlowStepState('related', 'idle');
        setIntakeFlowStepState('ai', 'idle');
        setIntakeFlowStepState('save', 'idle');
        setInteractionState('intake-notion-diary-ready');
      }
    });
  });
  firstRunGuideActions.forEach((button) => {
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-guide-action');
      shell.setAttribute('data-first-run-last-action', action || '');
      if (action === 'write-diary') {
        window.location.href = '/capture/';
        return;
      }
      if (action === 'import-diary') {
        importPasteText?.scrollIntoView({ block: 'center', behavior: 'smooth' });
        importPasteText?.focus();
        setInteractionState('diary-import-focused');
        return;
      }
      if (action === 'select-memory') {
        const selected = document.querySelector('[data-control="select-memory"][data-selected="true"]') || memoryNodes[2];
        if (selected) selectMemory(selected);
        document.querySelector('.selected-node-affordance')?.scrollIntoView({ block: 'center', inline: 'center', behavior: 'smooth' });
        setInteractionState('first-run-memory-selected');
        return;
      }
      if (action === 'run-ai-session') {
        void runMemorySession();
        return;
      }
      if (action === 'save-session') {
        void saveMemorySession();
      }
    });
  });
  if (memoryNodes[2]) selectMemory(memoryNodes[2]);
  wireReviewComparisonButtons();
  initializeCytoscapeGraph();
  selectHandoffMemoryFromGraph(handoffMemoryId);
  prepareHandoffSessionFromQuery();
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
    <title>개인 기억 AI 세컨브레인</title>
    <style>${APP_SHELL_STYLES}</style>
  </head>
  <body>${renderAppShellHtml(variant)}<script src="vendor/cytoscape.min.js"></script><script data-graph-control-script="pmi019">${GRAPH_CONTROL_SCRIPT}</script></body>
</html>`;
}
