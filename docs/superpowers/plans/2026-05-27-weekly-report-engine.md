# Weekly Report Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a deterministic weekly report from dated `MemoryRecord`s with evidence-backed emotion, decision, outcome, project, and pattern insights.

**Architecture:** Add a pure domain module `weeklyReport.ts` that filters records by an explicit date window and returns a renderable report object. Reuse `detectRepeatedPatterns` for pattern evidence, but keep weekly aggregation local to the weekly report engine.

**Tech Stack:** TypeScript, Vitest, existing `MemoryRecord`, existing `patternDetector`.

---

## Files

- Create: `src/lib/weeklyReport.ts`
- Test: `src/lib/weeklyReport.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Date Window and Evidence Threshold

- [ ] **Step 1: Write failing test**

Test that `generateWeeklyReport` includes only memories inside `startDate` and `endDate`, returns included memory ids, and labels insufficient evidence when fewer than two memories are inside the window.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/weeklyReport.test.ts`

Expected: FAIL because `src/lib/weeklyReport` does not exist.

- [ ] **Step 3: Implement minimal date filtering and insufficient evidence**

Create `src/lib/weeklyReport.ts` with exported `generateWeeklyReport`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/weeklyReport.test.ts`

Expected: PASS.

## Task 2: Aggregated Weekly Insights

- [ ] **Step 1: Write failing test**

Test that emotions, decisions, outcomes, and projects are aggregated with counts and supporting memory ids.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/weeklyReport.test.ts`

Expected: FAIL because aggregation insight fields are not implemented yet.

- [ ] **Step 3: Implement aggregation helpers**

Add deterministic aggregation for repeated emotions, decision signals, outcome text, and project tags.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/weeklyReport.test.ts`

Expected: PASS.

## Task 3: Pattern Insight Integration

- [ ] **Step 1: Write failing test**

Test that weekly report includes repeated-pattern insights from in-window records, with citations.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/weeklyReport.test.ts`

Expected: FAIL until pattern insights are included.

- [ ] **Step 3: Integrate pattern detector**

Call `detectRepeatedPatterns` on in-window records and append sufficient/insufficient pattern insight data.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/weeklyReport.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 4: Product Plan Status Update

- [ ] **Step 1: Mark L7 complete in product execution plan**

Update `docs/product/product-execution-plan-2026-05-27.md` so Weekly Report Engine is `done-foundation`, L7 is moved from active loops to completed loops, and L8 becomes the next active UI loop.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/weeklyReport.ts src/lib/weeklyReport.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-weekly-report-engine.md
git commit -m "feat: add weekly report engine"
```
