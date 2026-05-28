# Guided Memory Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let a user select one diary memory, see related past memories, and run Ask, Decision Replay, and Weekly Report as one guided memory session.

**Architecture:** Reuse the existing selected-memory related context, live Ask, live Replay, and live Weekly API handlers. Add one orchestration control in the selected-memory inspector and one session summary panel in the web shell that records source memory, related memories, and completion state across the three grounded results.

**Tech Stack:** TypeScript, static app renderer in `src/App.tsx`, Playwright evidence automation, Product Execution Plan docs.

---

### Task 1: Browser Contract

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`

- [ ] **Step 1: Add failing Playwright assertions**

After selecting a Cytoscape memory and verifying related memories, click `[data-control="run-memory-session"]`.

Expected assertions:

```ts
assert((await attribute(page, '.second-brain-shell', 'data-memory-session-state')) === 'completed', 'Guided memory session should complete');
assert((await attribute(page, '[data-memory-session-panel]', 'data-session-source-memory')) === firstCitation, 'Guided memory session should keep selected source memory');
assert(Number(await attribute(page, '[data-memory-session-panel]', 'data-session-related-memory-count')) > 0, 'Guided memory session should keep related memories');
assert((await attribute(page, '[data-memory-session-step="ask"]', 'data-session-step-state')) === 'completed', 'Guided memory session should complete Ask');
assert((await attribute(page, '[data-memory-session-step="replay"]', 'data-session-step-state')) === 'completed', 'Guided memory session should complete Decision Replay');
assert((await attribute(page, '[data-memory-session-step="weekly"]', 'data-session-step-state')) === 'completed', 'Guided memory session should complete Weekly Report');
```

- [ ] **Step 2: Run evidence and verify RED**

Run: `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

Expected: FAIL because the guided session control and panel do not exist yet.

### Task 2: Guided Session UI and Orchestration

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add session control and panel**

Add a `Run Memory Session` button beside the related-memory context actions and a compact `data-memory-session-panel` summary near the result surfaces.

- [ ] **Step 2: Add orchestration function**

Implement `runMemorySession()` that:

1. Reads `data-active-memory` and related chips.
2. Calls `askWithRelatedMemoryContext()`, `askSecondBrain()`.
3. Calls `replayWithRelatedMemoryContext()`, `replayCurrentDecision()`.
4. Calls `reportWithRelatedMemoryContext()`, `refreshWeeklyReport()`.
5. Updates session step states and summary attributes.

- [ ] **Step 3: Preserve context evidence**

Make sure the existing Ask, Replay, and Weekly result evidence badges still receive the same selected source memory and related memories during the session.

- [ ] **Step 4: Run evidence and verify GREEN**

Run: `npm run build && PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

Expected: PASS and verified list includes guided memory session.

### Task 3: Plan and Full Gate

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [ ] **Step 1: Add L87**

Record the feature batch as `L87: guided memory session`.

- [ ] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright
git diff --check
```

Expected: all commands pass.
