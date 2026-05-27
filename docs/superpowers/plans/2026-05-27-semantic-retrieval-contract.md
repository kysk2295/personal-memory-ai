# Semantic Retrieval Contract Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a retrieval boundary that ranks user-scoped memories for Ask, Decision Replay, and Weekly Report, while remaining deterministic locally and replaceable with pgvector later.

**Architecture:** Add `memoryRetrieval.ts` with pure record ranking and store-backed retrieval. Local tests use lexical scoring; future production can route the same contract through `MemoryStore.semanticSearch`.

**Tech Stack:** TypeScript, Vitest, existing `MemoryStore`, `MemoryRecord`, `askMyPastSelf`, `replayDecision`, `generateWeeklyReport`.

---

## Files

- Create: `src/lib/memoryRetrieval.ts`
- Test: `src/lib/memoryRetrieval.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Ranked Retrieval

- [ ] **Step 1: Write failing test**

Test that `retrieveRelevantMemoriesFromRecords` ranks memories by query relevance, returns matched terms, and excludes zero-score memories.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/memoryRetrieval.test.ts`

Expected: FAIL because `src/lib/memoryRetrieval` does not exist.

- [ ] **Step 3: Implement deterministic lexical ranking**

Create `src/lib/memoryRetrieval.ts` with `retrieveRelevantMemoriesFromRecords`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/memoryRetrieval.test.ts`

Expected: PASS.

## Task 2: Store Boundary and User Scope

- [ ] **Step 1: Write failing test**

Test that `retrieveRelevantMemories` loads only one user's records from `MemoryStore`, excludes another user's matching private memory, and returns explicit insufficient evidence when nothing matches.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/memoryRetrieval.test.ts`

Expected: FAIL until the async store-backed function is implemented.

- [ ] **Step 3: Implement store-backed retrieval**

Add `retrieveRelevantMemories({ store, userId, query, limit })`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/memoryRetrieval.test.ts`

Expected: PASS.

## Task 3: Consumer Compatibility

- [ ] **Step 1: Write failing test**

Test that retrieved memories can be passed into pattern detection, Ask My Past Self, Decision Replay, and Weekly Report without leaking unrelated records.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/memoryRetrieval.test.ts`

Expected: FAIL until retrieval result shape exposes `memories`.

- [ ] **Step 3: Expose retrieved memories**

Return `memories` and `retrievedMemoryIds` from retrieval result.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/memoryRetrieval.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 4: Product Plan Status Update

- [ ] **Step 1: Mark L9 complete in product execution plan**

Update `docs/product/product-execution-plan-2026-05-27.md` so Semantic Retrieval Contract is `done-foundation`, L9 is moved from active loops to completed loops, and L10 becomes next.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/memoryRetrieval.ts src/lib/memoryRetrieval.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-semantic-retrieval-contract.md
git commit -m "feat: add semantic retrieval contract"
```
