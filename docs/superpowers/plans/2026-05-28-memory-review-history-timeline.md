# Memory Review History Timeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans or inline TDD to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist memory edit review ledger entries as owner-scoped history and render that history in the source review timeline.

**Architecture:** Encode review ledger entries as private `MemoryRecord`s with a reserved `personal-memory-ai://memory-review-ledger/` source prefix so the existing fixture/Postgres memory stores can persist them without schema changes. Filter those records out of normal graph/timeline memory nodes, but expose them through detail/history API responses and timeline review metadata.

**Tech Stack:** TypeScript, Vitest, local private API dispatcher, existing `MemoryStore` abstraction.

---

### Task 1: Review Ledger Record Contract

**Files:**
- Modify: `src/lib/memoryReviewLedger.test.ts`
- Modify: `src/lib/memoryReviewLedger.ts`

- [x] **Step 1: Write failing tests**

Add tests for converting a review ledger entry into a private ledger `MemoryRecord`, detecting ledger records, and listing entries for a specific memory while excluding other users/memories.

- [x] **Step 2: Implement ledger record helpers**

Add `buildMemoryReviewLedgerRecord`, `isMemoryReviewLedgerRecord`, `memoryReviewLedgerRecordToEntry`, and `listMemoryReviewLedgerEntries`.

- [x] **Step 3: Verify focused tests**

Run: `npm test -- src/lib/memoryReviewLedger.test.ts`

### Task 2: API Persistence And History Endpoint

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/localHttpTransport.test.ts`
- Modify: `src/lib/personalMemoryApi.ts`

- [x] **Step 1: Write failing tests**

Assert `/api/memory/update` creates an owner-scoped ledger record, `/api/memory/detail` returns `reviewHistory`, and `/api/memory/review-history` filters to the active owner and selected memory through API/HTTP.

- [x] **Step 2: Implement API behavior**

Persist the ledger record after an update and add the new history route.

- [x] **Step 3: Verify focused tests**

Run focused API and HTTP transport tests.

### Task 3: Timeline Surface

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/lib/memoryDetailTimeline.ts`
- Modify: `src/components/MemoryDetailTimelinePanel.tsx`

- [x] **Step 1: Write failing tests**

Assert ledger records are not counted as normal timeline memories and that the review panel exposes review history endpoint/count/revision metadata.

- [x] **Step 2: Implement timeline filtering and rendering**

Attach review history metadata to timeline entries and render a compact source-review history list/empty state.

- [x] **Step 3: Verify focused UI contract test**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts`

### Task 4: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-014-memory-review-history-timeline.md`
- Modify: `docs/superpowers/plans/2026-05-28-memory-review-history-timeline.md`

- [x] **Step 1: Update product plan**

Add L44 as completed only after verification.

- [x] **Step 2: Run Reins gates**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

- [ ] **Step 3: Commit locally**

Commit only PMI-014 allowed files. Do not push.
