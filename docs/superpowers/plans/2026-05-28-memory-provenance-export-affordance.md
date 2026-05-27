# Memory Provenance Export Affordance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use inline TDD to implement this plan task-by-task.

**Goal:** Let the memory detail surface export one selected memory with source provenance, review history, and related context while keeping private-vault owner scoping.

**Architecture:** Add a small provenance export builder over `MemoryRecord[]`, reuse review ledger filtering and timeline related-memory logic, then expose it through the private API and static detail panel metadata.

**Tech Stack:** TypeScript, Vitest, local private API dispatcher, existing `MemoryStore` abstraction.

---

### Task 1: Provenance Export Builder

**Files:**
- Add: `src/lib/memoryProvenanceExport.test.ts`
- Add: `src/lib/memoryProvenanceExport.ts`
- Modify: `src/lib/memoryDetailTimeline.ts`

- [x] **Step 1: Write failing tests**

Assert a memory export includes source fields, tags, review history, related memory ids, deterministic filename, and excludes review ledger records from related memory context.

- [x] **Step 2: Implement export builder**

Add `buildMemoryProvenanceExport` and a narrow exported helper for computing one timeline entry.

- [x] **Step 3: Verify focused tests**

Run: `npm test -- src/lib/memoryProvenanceExport.test.ts`

### Task 2: API And HTTP Endpoint

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/localHttpTransport.test.ts`
- Modify: `src/lib/personalMemoryApi.ts`

- [x] **Step 1: Write failing tests**

Assert `GET /api/memory/provenance-export` returns owner-scoped export data and HTTP trusted-header auth does not leak another user's memory.

- [x] **Step 2: Implement endpoint**

Add the API path and handler using the provenance export builder.

- [x] **Step 3: Verify focused tests**

Run focused API and HTTP tests.

### Task 3: Timeline Export Affordance

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/components/MemoryDetailTimelinePanel.tsx`

- [x] **Step 1: Write failing tests**

Assert the detail panel exposes the provenance export endpoint, filename, and export button control.

- [x] **Step 2: Render affordance**

Add endpoint/filename data attributes and a button beside the save control.

- [x] **Step 3: Verify focused UI contract test**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"`

### Task 4: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-015-memory-provenance-export-affordance.md`
- Modify: `docs/superpowers/plans/2026-05-28-memory-provenance-export-affordance.md`

- [x] **Step 1: Update product plan**

Add L45 after verification.

- [x] **Step 2: Run Reins gates**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

- [x] **Step 3: Commit locally**

Commit only PMI-015 allowed files. Do not push.
