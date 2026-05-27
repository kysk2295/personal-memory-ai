# Saved Artifact Persistence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Persist saved Ask, Decision Replay, and Weekly Report artifacts through the local private API/backend path as user-scoped `MemoryRecord`s.

**Architecture:** Keep the visible save buttons pointed at `/api/capture`, but let that endpoint accept either fast diary capture input or a saved artifact payload. Server-backed pages should POST the full saved artifact JSON and store it via `saveArtifactAsMemoryRecord`; static file previews should continue to mark the action saved locally without network writes.

**Tech Stack:** TypeScript, Vitest, static HTML rendering, local HTTP transport, Playwright.

---

### Task 1: RED API Persistence Tests

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/localHttpTransport.test.ts`

- [x] **Step 1: Add personal memory API saved artifact capture test**

Add a test that:

- builds a saved ask artifact
- posts `{ artifact }` to `POST /api/capture`
- expects `201`
- expects `createdMemoryIds` to include `mem_api_artifact_...`
- verifies `store.listByUser('user-a')` contains the saved artifact record
- verifies another user's records are not returned or mutated

- [x] **Step 2: Add local HTTP saved artifact capture test**

Add a test that:

- creates `createLocalPersonalMemoryHttpHandler`
- posts the same artifact JSON to `/api/capture`
- exports the local user's vault
- verifies the saved artifact appears only in that private vault

- [x] **Step 3: Run RED**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts
```

Expected: FAIL because `/api/capture` currently treats artifact JSON as fast diary capture input.

### Task 2: Backend Capture Union

**Files:**
- Modify: `src/lib/personalMemoryApi.ts`

- [x] **Step 1: Import saved artifact persistence helper**

Import `saveArtifactAsMemoryRecord` and `type SavedMemoryArtifact` from `src/lib/savedMemoryArtifact.ts`.

- [x] **Step 2: Add a saved artifact body guard**

Add a small guard that detects `{ artifact: { id, kind, title, body } }` without broad schema work.

- [x] **Step 3: Persist artifact bodies through `/api/capture`**

Inside the `/api/capture` POST branch:

- if body is a saved artifact body, call `saveArtifactAsMemoryRecord({ store, userId, artifact })`
- return `{ createdMemoryIds: [record.id], record }`
- otherwise preserve the existing fast diary capture path

- [x] **Step 4: Run focused API tests**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts
```

Expected: PASS.

### Task 3: Frontend Save POST Contract

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `scripts/verify-playwright-evidence.ts`

- [x] **Step 1: Render saved artifact JSON payload**

Render a script tag:

```html
<script type="application/json" id="saved-artifact-actions">...</script>
```

The JSON must contain each action id, endpoint, method, and full artifact payload.

- [x] **Step 2: Make save buttons POST when served over HTTP**

On click:

- find the artifact by id from `#saved-artifact-actions`
- when `location.protocol !== 'file:'`, `fetch(endpoint, { method, headers, body: JSON.stringify({ artifact }) })`
- set `data-artifact-save-state="saved"` on success
- set shell `data-last-saved-artifact`, `data-last-saved-memory`, and `data-interaction-state="artifact-saved"`
- on static `file:` previews, keep the current local-only saved behavior
- on failed HTTP persistence, set `data-artifact-save-state="error"` and `data-interaction-state="artifact-save-error"`

- [x] **Step 3: Update rendering and Playwright assertions**

Assert the document contains:

- `id="saved-artifact-actions"`
- `"endpoint":"/api/capture"`
- `"artifact":{"id":"artifact_`
- Playwright still verifies the save action transition.

- [x] **Step 4: Run focused shell and evidence checks**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
npm run build
npm run evidence:playwright
```

Expected: PASS.

### Task 4: Product Plan, Full Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-saved-artifact-persistence.md`

- [x] **Step 1: Update product plan**

Add L29 as saved artifact persistence. Move the next loop to live LLM provider wiring or staging smoke, depending on available secrets.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/App.tsx src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-saved-artifact-persistence.md artifacts/web-second-brain-product-surface
git commit -m "feat: persist saved artifacts through capture api"
```
