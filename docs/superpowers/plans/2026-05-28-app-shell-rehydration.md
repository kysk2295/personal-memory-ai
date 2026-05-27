# App Shell Rehydration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an owner-scoped app shell rehydration path so the web second brain can reload graph/timeline data after imports persist.

**Architecture:** Expose a private-vault `/api/app-shell` endpoint that rebuilds the app shell layout from the current `MemoryStore`. After import apply, the browser calls this endpoint and records the rehydrated memory/graph counts so the Cytoscape graph can be rebuilt from persisted private memories in the next UI pass.

**Tech Stack:** TypeScript, Vitest, existing app shell data builder, existing private-vault HTTP transport.

---

### Task 1: RED App Shell API Tests

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/localHttpTransport.test.ts`

- [x] **Step 1: Add rehydration endpoint tests**

Assert `GET /api/app-shell` returns owner-scoped layout data, includes imported records after apply, and never leaks another user's memories.

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts
```

Expected: FAIL with 404 until `/api/app-shell` exists.

### Task 2: Implement Rehydration Endpoint

**Files:**
- Modify: `src/lib/personalMemoryApi.ts`
- Modify: `src/App.tsx`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `scripts/verify-playwright-evidence.ts`

- [x] **Step 1: Add `/api/app-shell`**

Use `buildAppShellEvidenceLayoutFromMemoryStore({ store, userId })` and return safe layout data from the private owner store.

- [x] **Step 2: Add browser rehydration call after import apply**

After apply succeeds, fetch `/api/app-shell`, set `data-graph-rehydrate-state`, `data-rehydrated-memory-node-count`, and `data-rehydrated-graph-node-count`.

- [x] **Step 3: Run focused tests**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts
```

Expected: PASS.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-app-shell-rehydration.md`

- [x] **Step 1: Update product plan**

Add L39 as app shell rehydration API.

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
git add src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/App.tsx src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-app-shell-rehydration.md
git commit -m "feat: add app shell rehydration api"
```
