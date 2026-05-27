# Saved Artifacts In Graph Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show saved Ask, Decision Replay, and Weekly Report artifacts as future private memories in the graph and timeline.

**Architecture:** Convert deterministic saved artifact actions into `MemoryRecord`s inside the app shell data builder, then use augmented display records for graph, timeline, compiled wiki, and privacy controls. Keep reasoning outputs based on the original diary/import memories to avoid circular self-citation.

**Tech Stack:** TypeScript, Vitest, static HTML rendering, Playwright.

---

### Task 1: RED Shell Data Tests

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [x] **Step 1: Add saved artifact record assertions**

Assert:

- `shell.records` includes original 5 memories plus 3 saved artifact memories
- saved artifact record ids start with `mem_api_artifact_`
- saved artifacts appear in `primaryNodes`
- memory timeline count is 8
- HTML contains saved artifact timeline entries and graph stats for 8 memories

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: FAIL because saved artifacts are not yet included in shell records.

### Task 2: App Shell Data Augmentation

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.ts`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [x] **Step 1: Convert saved artifact actions into records**

Use `savedArtifactToMemoryRecord(action.artifact)`.

- [x] **Step 2: Split base reasoning records and display records**

Keep Ask/Replay/Weekly Report generated from original records. Use display records for:

- `records`
- `primaryNodes`
- `links`
- `compiledWiki`
- `memoryTimeline`
- `privacyControls`

- [x] **Step 3: Run focused shell tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts src/lib/memoryGraphModel.test.ts src/lib/memoryDetailTimeline.test.ts
```

Expected: PASS after updating expected counts.

### Task 3: Render + Playwright Count Updates

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-saved-artifacts-in-graph-timeline.md`

- [x] **Step 1: Update Playwright graph/timeline assertions**

Expected memory count becomes 8. Node/edge counts should match the generated graph model.

- [x] **Step 2: Add L28 to product plan**

Record saved artifacts in graph/timeline as `prototype-ui`; move next loop to live LLM/provider or backend persistence gate.

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
git add src/lib/appShellEvidenceLayout.ts src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-saved-artifacts-in-graph-timeline.md artifacts/web-second-brain-product-surface
git commit -m "feat: show saved artifacts in graph timeline"
```
