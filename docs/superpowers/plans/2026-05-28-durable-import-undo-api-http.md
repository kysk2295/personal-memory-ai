# Durable Import Undo API/HTTP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an owner-scoped `/api/import/undo` path and wire the local import UI to rollback persisted upload memories.

**Architecture:** Reuse the existing `undoAppliedMemoryRecords` domain function and `MemoryStore.deleteByIds` boundary. The API adds one narrow route, the HTTP transport inherits it through the existing dispatcher, and the static app shell exposes endpoint metadata plus client-side state transitions.

**Tech Stack:** TypeScript, Vitest, static HTML rendering in `src/App.tsx`, private-vault API dispatcher.

---

### Task 1: API Undo Route

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/personalMemoryApi.ts`

- [ ] **Step 1: Write the failing test**

Add a test proving `/api/import/undo` deletes only the active user's applied ids and leaves another user with the same id untouched.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/personalMemoryApi.test.ts -t "undoes applied imports through the private API"`
Expected: FAIL because `/api/import/undo` returns `404`.

- [ ] **Step 3: Write minimal implementation**

Add `'/api/import/undo'` to `PersonalMemoryApiPath`, define an `ImportUndoBody`, import `undoAppliedMemoryRecords`, and dispatch `POST /api/import/undo`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/personalMemoryApi.test.ts -t "undoes applied imports through the private API"`
Expected: PASS.

### Task 2: HTTP Transport Coverage

**Files:**
- Modify: `src/lib/localHttpTransport.test.ts`

- [ ] **Step 1: Write the failing test**

Add a transport-level test applying an import, calling `/api/import/undo`, exporting, and asserting the imported record is gone while another user's guard record remains hidden.

- [ ] **Step 2: Run test to verify it fails before API implementation**

Run before Task 1 implementation when possible: `npm test -- src/lib/localHttpTransport.test.ts -t "undoes applied imports through HTTP"`
Expected: FAIL because the endpoint is missing.

- [ ] **Step 3: Verify after Task 1 implementation**

Run: `npm test -- src/lib/localHttpTransport.test.ts -t "undoes applied imports through HTTP"`
Expected: PASS.

### Task 3: UI Endpoint and State Wiring

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/components/PatternPanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing render test**

Assert the rendered shell contains `data-import-undo-endpoint="/api/import/undo"`, `data-control="undo-local-import"`, and client script snippets for fetching the undo endpoint and setting `data-import-upload-state` to `undone`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders the browser interaction contract"`
Expected: FAIL on the missing undo endpoint/control snippets.

- [ ] **Step 3: Write minimal UI implementation**

Add the undo endpoint/control to the import panel, store the latest undo action from apply response, call `/api/import/undo`, update `data-import-undone-count`, clear applied feedback, and rehydrate the graph over HTTP.

- [ ] **Step 4: Run focused tests**

Run:
`npm test -- src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts`
Expected: PASS.

### Task 4: Verification and Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-011-durable-import-undo-through-api-http.md`

- [ ] **Step 1: Run full gates**

Run:
`git diff --name-only`
`npm run typecheck`
`npm test`
`npm run build`

- [ ] **Step 2: Update plan/task status**

Record verification evidence and mark PMI-011 `ready_for_human_review` if all gates pass.

- [ ] **Step 3: Commit**

Run:
`git add TASKS/PMI-011-durable-import-undo-through-api-http.md docs/superpowers/plans/2026-05-28-durable-import-undo-api-http.md docs/product/product-execution-plan-2026-05-27.md src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts src/App.tsx src/components/PatternPanel.tsx`
`git commit -m "feat: add durable import undo api"`
