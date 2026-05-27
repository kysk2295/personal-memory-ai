# Review History Comparison UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show source review history as explicit before/after comparison cards in the memory detail timeline.

**Architecture:** Add a small `MemoryReviewComparison` projection to `memoryDetailTimeline` so the component does not parse ledger entries. Render those comparisons in `MemoryDetailTimelinePanel` while preserving the existing empty state and owner-scoped ledger filtering.

**Tech Stack:** TypeScript, Vitest, static TSX string renderer.

---

### Task 1: Timeline Comparison Projection

**Files:**
- Modify: `src/lib/memoryDetailTimeline.test.ts`
- Modify: `src/lib/memoryDetailTimeline.ts`

- [ ] **Step 1: Write the failing timeline test**

Add a test that builds a review ledger entry for `mem_freeze_vs_feature_addition` and expects the selected timeline entry to expose `reviewComparisons` with `revisionId`, `reviewedAt`, `changedFieldLabels`, `sourceRef`, `beforeSummary`, `afterSummary`, and `deltaLabel`.

- [ ] **Step 2: Run the focused test to verify RED**

Run: `npm test -- src/lib/memoryDetailTimeline.test.ts -t "review comparison"`

Expected: FAIL because `reviewComparisons` does not exist.

- [ ] **Step 3: Implement minimal comparison projection**

Create `MemoryReviewComparison`, map each `MemoryReviewLedgerEntry` into comparison metadata, and attach `reviewComparisons` to each `MemoryDetailTimelineEntry`.

- [ ] **Step 4: Run the focused test to verify GREEN**

Run: `npm test -- src/lib/memoryDetailTimeline.test.ts -t "review comparison"`

Expected: PASS.

### Task 2: Render Comparison Cards

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/components/MemoryDetailTimelinePanel.tsx`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-017-review-history-comparison-ux.md`

- [ ] **Step 1: Write the failing render test**

Extend the review ledger render test to expect `data-memory-review-comparison`, `data-review-before-summary`, `data-review-after-summary`, and `data-review-changed-field` markers.

- [ ] **Step 2: Run the focused render test to verify RED**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "review ledger"`

Expected: FAIL because the comparison card markers are absent.

- [ ] **Step 3: Render comparison cards**

Replace the simple review list body with comparison cards that show revision date, changed fields, before summary, after summary, and source ref.

- [ ] **Step 4: Run the focused render test to verify GREEN**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "review ledger"`

Expected: PASS.

- [ ] **Step 5: Run full Reins verification**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit the bounded slice**

Run:

```bash
git add TASKS/PMI-017-review-history-comparison-ux.md docs/superpowers/plans/2026-05-28-review-history-comparison-ux.md docs/product/product-execution-plan-2026-05-27.md src/lib/memoryDetailTimeline.ts src/lib/memoryDetailTimeline.test.ts src/lib/appShellEvidenceLayout.test.ts src/components/MemoryDetailTimelinePanel.tsx
git commit -m "feat: add review history comparison ux"
```
