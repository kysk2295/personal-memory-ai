# API Endpoints Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add user-scoped API boundary handlers for capture, import preview/apply, ask, replay, weekly report, export, and delete.

**Architecture:** Add a pure TypeScript request dispatcher under `personalMemoryApi.ts`. It will not expose network transport yet; it defines the backend boundary that `server.mjs` or a future framework route can call.

**Tech Stack:** TypeScript, Vitest, existing `MemoryStore`, capture/import/agent/report domain services.

---

## Files

- Create: `src/lib/personalMemoryApi.ts`
- Test: `src/lib/personalMemoryApi.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Capture and Import Endpoints

- [ ] **Step 1: Write failing test**

Test `/api/capture`, `/api/import/preview`, and `/api/import/apply` using one user-scoped store.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/personalMemoryApi.test.ts`

Expected: FAIL because `src/lib/personalMemoryApi` does not exist.

- [ ] **Step 3: Implement capture/import handlers**

Add `handlePersonalMemoryApiRequest`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/personalMemoryApi.test.ts`

Expected: PASS.

## Task 2: Ask, Replay, Report Endpoints

- [ ] **Step 1: Write failing test**

Test `/api/ask`, `/api/replay`, and `/api/report/weekly` and confirm another user's memory does not leak.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/personalMemoryApi.test.ts`

Expected: FAIL until the read/reasoning handlers are implemented.

- [ ] **Step 3: Implement reasoning handlers**

Call existing agent and weekly report services.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/personalMemoryApi.test.ts`

Expected: PASS.

## Task 3: Export and Delete Endpoints

- [ ] **Step 1: Write failing test**

Test `/api/export` and `/api/delete` with user-scoped data only.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/personalMemoryApi.test.ts`

Expected: FAIL until export/delete handlers are implemented.

- [ ] **Step 3: Implement privacy handlers**

Call `store.exportUserData`, `store.deleteByIds`, and `store.hardDeleteUserData`.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 4: Product Plan Status Update

- [ ] **Step 1: Mark L11 complete in product execution plan**

Update `docs/product/product-execution-plan-2026-05-27.md` so API Endpoints are `done-foundation`, L11 is completed, and L12 becomes next.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-api-endpoints.md
git commit -m "feat: add personal memory api boundary"
```
