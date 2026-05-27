# Memory Detail Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real memory detail/timeline surface so users can inspect diary/import memories as dated evidence, not only as graph nodes.

**Architecture:** Build a deterministic `memoryDetailTimeline` model from `MemoryRecord`s, render it in a focused `MemoryDetailTimelinePanel`, then wire existing graph/search selection to mark the active timeline item. Keep it static/local-first and data-derived from the private fixture records.

**Tech Stack:** TypeScript, Vitest, static HTML rendering, existing app shell, Playwright evidence script.

---

### Task 1: RED Timeline Model Tests

**Files:**
- Create: `src/lib/memoryDetailTimeline.test.ts`

- [x] **Step 1: Write model tests**

Test that `buildMemoryDetailTimeline(records, selectedMemoryId)`:

- sorts memories newest-first
- preserves source/date/raw excerpt/privacy metadata
- marks the selected memory
- computes related memory ids from shared emotions, topics, projects, decisions, and sources
- reports date range and total count

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/memoryDetailTimeline.test.ts
```

Expected: FAIL because `memoryDetailTimeline.ts` does not exist.

### Task 2: Timeline Model Implementation

**Files:**
- Create: `src/lib/memoryDetailTimeline.ts`

- [x] **Step 1: Implement types and helpers**

Create `MemoryDetailTimelineEntry`, `MemoryDetailTimelineSummary`, and `MemoryDetailTimeline` interfaces.

- [x] **Step 2: Implement `buildMemoryDetailTimeline`**

Build entries from `MemoryRecord`s with:

- `memoryId`
- `observedAt`
- `sourceLabel`
- `title`
- `rawExcerpt`
- `privacyScope`
- `facetLabels`
- `relatedMemoryIds`
- `active`

- [x] **Step 3: Run focused model tests**

Run:

```bash
npx vitest run src/lib/memoryDetailTimeline.test.ts
```

Expected: PASS.

### Task 3: Render Timeline Surface

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.ts`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Create: `src/components/MemoryDetailTimelinePanel.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Add timeline to shell layout**

Add `memoryTimeline` to `InitialAppShellEvidenceLayout`, built from records with `mem_freeze_vs_feature_addition` selected by default.

- [x] **Step 2: Add rendering assertions**

Extend app shell tests to assert:

- `data-memory-timeline-panel="pmi025"`
- `data-timeline-entry-count="5"`
- `data-timeline-memory-id="mem_captured_ship_note"`
- `data-timeline-active="true"` for the default selected memory

- [x] **Step 3: Render `MemoryDetailTimelinePanel`**

Render it in the right rail before the evidence drawer. Each item should be a button with `data-timeline-memory-id`, `data-timeline-active`, and `data-timeline-related-count`.

- [x] **Step 4: Wire timeline interactions in the graph script**

When graph/search/timeline selection changes:

- update active timeline item
- set `.second-brain-shell[data-timeline-active-memory]`
- let clicking a timeline item select the graph memory and inspector

- [x] **Step 5: Run focused shell tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts src/lib/memoryDetailTimeline.test.ts
```

Expected: PASS.

### Task 4: Playwright Evidence + Product Plan

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-27-memory-detail-timeline.md`

- [x] **Step 1: Add Playwright timeline assertions**

Verify:

- timeline panel exists
- timeline count is 5
- selecting search result `mem_unrelated_calm_import` marks the matching timeline item active

- [x] **Step 2: Add L25 to product plan**

Record memory detail/timeline surfaces as `prototype-ui`, and move active next loop to multilingual query bridge and saved artifact UI actions.

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
git add src/lib/memoryDetailTimeline.ts src/lib/memoryDetailTimeline.test.ts src/lib/appShellEvidenceLayout.ts src/lib/appShellEvidenceLayout.test.ts src/components/MemoryDetailTimelinePanel.tsx src/App.tsx scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-memory-detail-timeline.md artifacts/web-second-brain-product-surface
git commit -m "feat: add memory detail timeline surface"
```
