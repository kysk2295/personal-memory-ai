# Related Memory Action Clarity Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Make graph related-memory selection explain which current memory is being compared, why a past memory was surfaced, and what grounded AI action should happen next.

**Architecture:** Keep the existing first-screen graph-to-AI surface, but add a compact comparison inspector inside the related-memory workbench. The inspector is updated by the same selection function that marks the active related memory, so static render, click selection, and action buttons stay in sync.

**Tech Stack:** TypeScript, static app shell HTML generation, browser DOM script, Vitest-style layout evidence tests, Playwright evidence script.

---

## Reins Mapping

- PRD: private second brain -> related past-memory nodes -> grounded Ask/Decision Replay/Weekly Report.
- Phase: Phase 1 usable prototype.
- Epic: graph selection -> related memory path -> grounded action.
- Feature batch: related-memory comparison inspector.

## Verification Gates

- Unit evidence proves the inspector is rendered and wired into `setActiveRelatedWorkbenchMemory`.
- Playwright evidence proves selecting a related memory updates active id, reason, and next-action labels.
- Full gates after implementation: typecheck, targeted tests, build, service-flow evidence, Playwright evidence.

## Tasks

### Task 1: Add Failing Evidence Tests

**Objective:** Prove the workbench needs an active-past-memory inspector and dynamic reason/action updates.

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `scripts/verify-playwright-evidence.ts`

**Step 1:** Assert static inspector attributes and Korean labels exist in the app shell.

**Step 2:** Assert the graph script queries inspector labels and updates active reason and next action.

**Step 3:** Extend Playwright evidence to click a related past memory and verify inspector state follows the click.

### Task 2: Implement Inspector UI and State

**Objective:** Add a compact, non-overlapping inspector to the related-memory workbench.

**Files:**
- Modify: `src/App.tsx`

**Step 1:** Add initial inspector markup after the related-memory list.

**Step 2:** Add responsive CSS so summary, list, inspector, and actions fit without overlap.

**Step 3:** Add DOM refs for current, past, reason, and next-action labels.

**Step 4:** Update `setActiveRelatedWorkbenchMemory` to set active reason, next action, labels, and memory path hop text.

### Task 3: Verify and Commit

**Objective:** Confirm the visible service flow is stable and create one coherent local commit.

**Commands:**
- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm run build`
- `MEMORY_BACKEND_MODE=local-file PORT=3001 npm start`
- `npm run evidence:service-flow`
- `npm run evidence:playwright`

**Commit:** `feat: clarify related memory action path`
