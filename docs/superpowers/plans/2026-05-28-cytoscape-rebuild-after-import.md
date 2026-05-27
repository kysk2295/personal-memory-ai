# Cytoscape Rebuild After Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the live Cytoscape graph from owner-scoped app shell rehydration data after imports persist.

**Architecture:** Extend `/api/app-shell` to include the data-derived Cytoscape graph model. After import apply, the browser replaces Cytoscape elements with the rehydrated graph model and updates graph count markers.

**Tech Stack:** TypeScript, Vitest, Cytoscape, existing memory graph model.

---

### Task 1: RED Graph Payload Tests

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [x] **Step 1: Add graph payload and rebuild script assertions**

Assert `/api/app-shell` returns `memoryGraph` and the browser script contains Cytoscape rebuild hooks.

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/appShellEvidenceLayout.test.ts
```

Expected: FAIL until graph payload and rebuild hooks exist.

### Task 2: Implement Graph Rebuild

**Files:**
- Modify: `src/lib/personalMemoryApi.ts`
- Modify: `src/App.tsx`
- Modify: `scripts/verify-playwright-evidence.ts`

- [x] **Step 1: Return `memoryGraph` from `/api/app-shell`**

Build graph from rehydrated layout records with `buildMemoryGraphModel`.

- [x] **Step 2: Replace Cytoscape elements after rehydration**

Use `cytoscapeGraph.elements().remove()`, `cytoscapeGraph.add(memoryGraph.elements)`, rerun layout, and update graph count attributes.

- [x] **Step 3: Run focused tests**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/appShellEvidenceLayout.test.ts
```

Expected: PASS.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-cytoscape-rebuild-after-import.md`

- [x] **Step 1: Update product plan**

Add L40 as Cytoscape graph rebuild after import.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts src/App.tsx src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-cytoscape-rebuild-after-import.md
git commit -m "feat: rebuild graph after import rehydration"
```
