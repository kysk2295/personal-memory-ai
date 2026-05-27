# Private Vault Boundary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local authenticated-session boundary so API calls resolve to the session owner's private vault and cannot use caller-supplied user ids.

**Architecture:** Keep provider/OAuth integration out of this local loop. Add a pure private vault module plus a thin API wrapper around `handlePersonalMemoryApiRequest` that accepts a session, resolves the owner user id, and denies mismatched vault access.

**Tech Stack:** TypeScript, Vitest, existing `personalMemoryApi` and `MemoryStore`.

---

## Files

- Create: `src/lib/privateVault.ts`
- Test: `src/lib/privateVault.test.ts`
- Modify: `src/lib/personalMemoryApi.ts`
- Test: `src/lib/personalMemoryApi.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Owner-only Session Boundary

- [x] **Step 1: Write failing test**

Assert a private vault session resolves only its owner user id, denies a different requested user id, and never exposes secret/provider tokens.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/privateVault.test.ts`

Expected: FAIL because `src/lib/privateVault.ts` does not exist.

- [x] **Step 3: Implement private vault boundary**

Create `src/lib/privateVault.ts`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/privateVault.test.ts`

Expected: PASS.

## Task 2: API Session Wrapper

- [x] **Step 1: Write failing API wrapper test**

Assert `handlePrivateVaultMemoryApiRequest` exports only the session owner's records even when request body tries to supply another user id.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/personalMemoryApi.test.ts src/lib/privateVault.test.ts`

Expected: FAIL until wrapper exists.

- [x] **Step 3: Implement API wrapper**

Modify `src/lib/personalMemoryApi.ts`.

- [x] **Step 4: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 3: Product Plan and Commit

- [x] **Step 1: Mark L15 done-foundation**

Update `docs/product/product-execution-plan-2026-05-27.md` so auth/private vault boundary is `done-foundation` and production auth provider remains planned.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/privateVault.ts src/lib/privateVault.test.ts src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-private-vault-boundary.md
git commit -m "feat: add private vault session boundary"
```
