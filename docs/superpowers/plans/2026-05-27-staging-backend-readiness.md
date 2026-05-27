# Staging Backend Readiness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add safe staging readiness contracts for PostgreSQL/pgvector without exposing secrets or mutating production data.

**Architecture:** Implement pure TypeScript readiness helpers that produce redacted env presence reports and a bounded pgvector smoke plan. The code should be testable locally with fake env/client data and must not require real Railway credentials.

**Tech Stack:** TypeScript, Vitest, existing PostgreSQL/pgvector schema concepts.

---

## Files

- Create: `src/lib/stagingReadiness.ts`
- Test: `src/lib/stagingReadiness.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Redacted Env Presence Report

- [x] **Step 1: Write failing test**

Assert env readiness reports only `present` or `missing` and never includes raw `DATABASE_URL` or API key values.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/stagingReadiness.test.ts`

Expected: FAIL because `src/lib/stagingReadiness.ts` does not exist.

- [x] **Step 3: Implement env report**

Create `src/lib/stagingReadiness.ts`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/stagingReadiness.test.ts`

Expected: PASS.

## Task 2: Pgvector Smoke Plan

- [x] **Step 1: Write failing test**

Assert smoke plan covers extension, insert, semantic search, delete, and cross-user isolation using staging-only test users.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/stagingReadiness.test.ts`

Expected: FAIL until smoke planner exists.

- [x] **Step 3: Implement smoke planner**

Add `buildPgvectorStagingSmokePlan`.

- [x] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/stagingReadiness.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 3: Product Plan and Commit

- [x] **Step 1: Mark L14 done-foundation**

Update `docs/product/product-execution-plan-2026-05-27.md` so staging readiness is `done-foundation`, L14 is completed, and L15 becomes next.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/stagingReadiness.ts src/lib/stagingReadiness.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-staging-backend-readiness.md
git commit -m "feat: add staging backend readiness contract"
```
