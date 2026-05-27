# Source Review/Edit Detail Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add owner-scoped source review and memory edit support to the private API/HTTP path and visible timeline detail surface.

**Architecture:** Reuse `MemoryStore.getById` and `MemoryStore.update` so fixture and Postgres backends share the same API behavior. Keep edits narrow: summary/raw text plus optional observed date and tags, then let `/api/app-shell` continue to rebuild graph/timeline after persistence.

**Tech Stack:** TypeScript, Vitest, existing local HTTP transport, static HTML app shell.

---

## File Structure

- Modify `src/lib/personalMemoryApi.ts`: add `/api/memory/detail` and `/api/memory/update` handlers with owner-scoped lookup/update.
- Modify `src/lib/personalMemoryApi.test.ts`: add RED/GREEN API tests for detail/update and cross-user protection.
- Modify `src/lib/localHttpTransport.test.ts`: add RED/GREEN HTTP test for detail/update through private vault auth.
- Modify `src/components/MemoryDetailTimelinePanel.tsx`: render selected source metadata, editable fields, and API endpoint data attributes.
- Modify `src/App.tsx`: add client-side save handler for the review/edit panel and rehydrate graph/timeline after save.
- Modify `src/lib/appShellEvidenceLayout.test.ts`: assert the review/edit surface contract is present.
- Modify `docs/product/product-execution-plan-2026-05-27.md`: mark L42 and next-loop guidance.

### Task 1: API Detail/Update Contract

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/personalMemoryApi.ts`

- [ ] **Step 1: Write the failing API test**

Add a test that seeds `user-a` and `user-b`, calls `GET /api/memory/detail` for `user-a`, calls `POST /api/memory/update`, and verifies `user-b` is unchanged.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"`

Expected: FAIL with `404` because the routes do not exist yet.

- [ ] **Step 3: Implement the API handlers**

Add path literals, request bodies, editable field sanitization, `store.getById`, `store.update`, and explicit `{ error: 'memory_not_found' }` responses.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"`

Expected: PASS.

### Task 2: HTTP Transport Coverage

**Files:**
- Modify: `src/lib/localHttpTransport.test.ts`

- [ ] **Step 1: Write the failing HTTP test**

Add a test that uses trusted-header auth to get and update a memory for `user-a` while `user-b` owns a record with the same target shape.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/lib/localHttpTransport.test.ts -t "reviews and updates memories through HTTP"`

Expected: FAIL before API implementation, PASS after Task 1 if the transport delegates paths correctly.

- [ ] **Step 3: Run GREEN**

Run: `npm test -- src/lib/localHttpTransport.test.ts -t "reviews and updates memories through HTTP"`

Expected: PASS and response text must not contain other-user guard ids.

### Task 3: Detail Surface Contract

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/components/MemoryDetailTimelinePanel.tsx`
- Modify: `src/App.tsx`

- [ ] **Step 1: Write the failing render test**

Assert the shell contains `data-memory-review-panel="source-edit"`, `data-memory-detail-endpoint="/api/memory/detail"`, `data-memory-update-endpoint="/api/memory/update"`, `data-control="memory-edit-summary"`, `data-control="memory-edit-raw-text"`, and `data-control="save-memory-edit"`.

- [ ] **Step 2: Run RED**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders the private diary-to-memory product surface"`

Expected: FAIL because the review/edit attributes are missing.

- [ ] **Step 3: Implement the visible panel and script**

Render selected memory metadata and editable textareas inside `MemoryDetailTimelinePanel`. In `App.tsx`, wire the save button to `POST /api/memory/update` when not on `file:`, then call the existing app-shell rehydration.

- [ ] **Step 4: Run GREEN**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders the private diary-to-memory product surface"`

Expected: PASS.

### Task 4: Product Plan and Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-012-source-review-edit-detail-surface.md`

- [ ] **Step 1: Update product execution plan**

Add L42 as source review/edit detail surface and update Active Next Loops to point at the next local private-vault polish path unless secrets are provided.

- [ ] **Step 2: Run full gates**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [ ] **Step 3: Update contract evidence and commit**

Record RED/GREEN/full verification in `TASKS/PMI-012-source-review-edit-detail-surface.md`, then commit only allowed PMI-012 files.
