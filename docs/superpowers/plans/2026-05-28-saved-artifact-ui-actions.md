# Saved Artifact UI Actions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add visible save actions for Ask, Decision Replay, and Weekly Report artifacts so cited AI outputs can become future private memories.

**Architecture:** Keep persistence as an existing domain contract (`savedMemoryArtifact`) and add a UI action model that exposes deterministic artifact metadata, source refs, and future memory ids. Render those actions in the existing product panels, then wire lightweight client-side state so the local prototype shows saved status without requiring a live backend write.

**Tech Stack:** TypeScript, Vitest, static HTML rendering, Playwright.

---

### Task 1: RED Saved Artifact Action Tests

**Files:**
- Create: `src/lib/savedArtifactActions.test.ts`

- [x] **Step 1: Write action model tests**

Test that `buildSavedArtifactActions(layout)` returns three actions:

- Ask answer
- Decision Replay
- Weekly Report

Each action must expose:

- artifact id and kind
- button label
- generated future `MemoryRecord` id
- source ref under `personal-memory-ai://saved-artifacts/`
- citation count
- save endpoint `/api/capture`
- initial state `ready`

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/savedArtifactActions.test.ts
```

Expected: FAIL because `savedArtifactActions.ts` does not exist.

### Task 2: Saved Artifact Action Model

**Files:**
- Create: `src/lib/savedArtifactActions.ts`
- Modify: `src/lib/appShellEvidenceLayout.ts`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [x] **Step 1: Implement action model**

Use existing artifact creators:

- `createSavedAskArtifact`
- `createSavedDecisionReplayArtifact`
- `createSavedWeeklyReportArtifact`
- `savedArtifactToMemoryRecord`

- [x] **Step 2: Add actions to app shell layout**

Add `savedArtifactActions` to `InitialAppShellEvidenceLayout`, built from the shell ask/replay/weekly report with deterministic `createdAt`.

- [x] **Step 3: Add shell tests**

Assert rendered HTML contains:

- `data-save-artifact-action="ask_answer"`
- `data-save-artifact-action="decision_replay"`
- `data-save-artifact-action="weekly_report"`
- `data-artifact-save-state="ready"`
- `personal-memory-ai://saved-artifacts/`

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/savedArtifactActions.test.ts src/lib/appShellEvidenceLayout.test.ts
```

Expected: PASS.

### Task 3: Render and Wire Save Actions

**Files:**
- Modify: `src/components/AskMyPastSelfPanel.tsx`
- Modify: `src/components/DecisionReplayPanel.tsx`
- Modify: `src/components/WeeklyReportPanel.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Render save action buttons**

Each panel renders one button using its matching saved artifact action.

- [x] **Step 2: Add interaction script**

Clicking a save action must:

- set the button `data-artifact-save-state` to `saved`
- set shell `data-last-saved-artifact`
- update visible button text to saved

- [x] **Step 3: Run focused shell tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: PASS.

### Task 4: Playwright Evidence + Product Plan

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-saved-artifact-ui-actions.md`

- [x] **Step 1: Add Playwright save-action assertions**

Verify clicking the Ask save action marks it saved and exposes the saved artifact id on the shell.

- [x] **Step 2: Add L27 to product plan**

Record UI save actions as `prototype-ui`, and move next loop to showing saved artifacts in graph/timeline.

- [x] **Step 3: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
```

Expected: all commands exit 0.

- [x] **Step 4: Commit locally**

Run:

```bash
git add src/lib/savedArtifactActions.ts src/lib/savedArtifactActions.test.ts src/lib/appShellEvidenceLayout.ts src/lib/appShellEvidenceLayout.test.ts src/components/AskMyPastSelfPanel.tsx src/components/DecisionReplayPanel.tsx src/components/WeeklyReportPanel.tsx src/App.tsx scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-saved-artifact-ui-actions.md artifacts/web-second-brain-product-surface
git commit -m "feat: add saved artifact ui actions"
```
