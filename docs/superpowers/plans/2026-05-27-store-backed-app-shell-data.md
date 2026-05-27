# Store-Backed App Shell Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Allow the web second-brain layout data to be assembled from a user-scoped `MemoryStore`, not only static fixtures.

**Architecture:** Keep the existing synchronous fixture builder for static rendering. Extract shared record-to-layout assembly, then add an async store-backed builder that calls `store.listByUser(userId)`.

**Tech Stack:** TypeScript, Vitest, existing `MemoryStore`, `buildInitialAppShellEvidenceLayout`, and fixture memory records.

---

## Task 1: Failing Store-Backed Layout Test

**Files:**

- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [ ] Add a test for `buildAppShellEvidenceLayoutFromMemoryStore`.
- [ ] Create fixture store records for `user-a` and `user-b`.
- [ ] Assert only `user-a` records become primary nodes, citations, compiled wiki atoms, and graph evidence.
- [ ] Run `npm test -- src/lib/appShellEvidenceLayout.test.ts`.
- [ ] Expected result: fails because the builder does not exist.

## Task 2: Shared Builder Implementation

**Files:**

- Modify: `src/lib/appShellEvidenceLayout.ts`

- [ ] Extract current `buildInitialAppShellEvidenceLayout` body into `buildAppShellEvidenceLayoutFromRecords(records)`.
- [ ] Keep `buildInitialAppShellEvidenceLayout()` returning fixture-backed layout.
- [ ] Add `buildAppShellEvidenceLayoutFromMemoryStore({ store, userId })`.
- [ ] Ensure no user-b record can leak into user-a layout.

## Task 3: Verify

- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.

## Task 4: Commit

- [ ] Commit locally.
- [ ] Commit message: `feat: build app shell data from memory store`
