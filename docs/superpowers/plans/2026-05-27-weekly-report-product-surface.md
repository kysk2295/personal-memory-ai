# Weekly Report Product Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render the weekly report engine as a first-class private second-brain web surface with cited aggregates and insufficient-evidence copy.

**Architecture:** Add `weeklyReport` to `InitialAppShellEvidenceLayout`, then render it through a dedicated `WeeklyReportPanel` component in the right product rail. Keep the graph as evidence UI and make the report citation-first.

**Tech Stack:** TypeScript, string-rendered React-style TSX modules, Vitest, static HTML build.

---

## Files

- Create: `src/components/WeeklyReportPanel.tsx`
- Modify: `src/lib/appShellEvidenceLayout.ts`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/App.tsx`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Layout Contract

- [ ] **Step 1: Write failing test**

Assert `buildInitialAppShellEvidenceLayout().weeklyReport` exists, has `status: implemented`, has `evidenceLabel: sufficient_evidence`, and cites weekly memory ids.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: FAIL because `weeklyReport` is not on the layout.

- [ ] **Step 3: Add layout contract**

Import `generateWeeklyReport`, add `weeklyReport` to the layout interface, generate a fixed fixture week, and mark the weekly report surface `implemented`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: PASS.

## Task 2: Rendered Product Panel

- [ ] **Step 1: Write failing test**

Assert rendered HTML contains `aria-label="Weekly Report cited memory summary"`, report date range, aggregate rows, citation links, and insufficient evidence copy.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: FAIL because no weekly report panel exists.

- [ ] **Step 3: Add component and wire it into `App.tsx`**

Create `renderWeeklyReportPanel(layout)`, import it in `App.tsx`, and place it in `product-rail`.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 3: Screenshot Evidence and Product Plan

- [ ] **Step 1: Capture local screenshot evidence**

Use the running local server at `http://127.0.0.1:3001` and save a screenshot under `artifacts/web-second-brain-product-surface/weekly-report-surface.png`.

- [ ] **Step 2: Mark L8 complete**

Update `docs/product/product-execution-plan-2026-05-27.md` so Weekly Report Product Surface is `done-foundation`, L8 is completed, and L9 becomes the next active loop.

- [ ] **Step 3: Commit locally**

Run:

```bash
git add src/components/WeeklyReportPanel.tsx src/lib/appShellEvidenceLayout.ts src/lib/appShellEvidenceLayout.test.ts src/App.tsx docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-weekly-report-product-surface.md artifacts/web-second-brain-product-surface/weekly-report-surface.png
git commit -m "feat: render weekly report product surface"
```
