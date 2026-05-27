# Privacy Export Delete UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose user-facing local export/delete controls and guardrails so privacy is a real product surface, not only a promise.

**Architecture:** Add a small privacy control domain model that describes export payload, selected-memory delete, hard-delete confirmation, and honest transport/auth status. Render it through a dedicated `PrivacyControlPanel` in the product rail and keep API execution in `personalMemoryApi`.

**Tech Stack:** TypeScript, Vitest, string-rendered TSX modules, existing `MemoryRecord` and app shell layout.

---

## Files

- Create: `src/lib/privacyControls.ts`
- Test: `src/lib/privacyControls.test.ts`
- Create: `src/components/PrivacyControlPanel.tsx`
- Modify: `src/lib/appShellEvidenceLayout.ts`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/App.tsx`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Privacy Control State

- [x] **Step 1: Write failing test**

Test that `buildPrivacyControlState` exposes private scope, local prototype status, export endpoint metadata, selected delete action, and hard-delete confirmation phrase.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/privacyControls.test.ts`

Expected: FAIL because `src/lib/privacyControls` does not exist.

- [x] **Step 3: Implement minimal state model**

Create `src/lib/privacyControls.ts`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/privacyControls.test.ts`

Expected: PASS.

## Task 2: Hard Delete Guardrail

- [x] **Step 1: Write failing test**

Test that hard delete remains disabled until the exact confirmation phrase is provided, while batch delete can operate on selected memory ids.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/privacyControls.test.ts`

Expected: FAIL until guardrail helper exists.

- [x] **Step 3: Implement guardrail helper**

Add `evaluateHardDeleteConfirmation`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/privacyControls.test.ts`

Expected: PASS.

## Task 3: Render Privacy Panel

- [x] **Step 1: Write failing render assertions**

Assert `renderAppShellHtml()` contains `aria-label="Private vault export and delete controls"`, export endpoint metadata, selected delete ids, hard-delete confirmation phrase, and honest auth/API status.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: FAIL until the panel is rendered.

- [x] **Step 3: Add component and wire layout**

Create `PrivacyControlPanel`, add `privacyControls` to layout, and render it in `App.tsx`.

- [x] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/privacyControls.test.ts src/lib/appShellEvidenceLayout.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 4: Screenshot and Product Plan

- [x] **Step 1: Capture screenshot evidence**

Save `artifacts/web-second-brain-product-surface/privacy-export-delete-surface.png` from the local server.

- [x] **Step 2: Mark L12 complete**

Update `docs/product/product-execution-plan-2026-05-27.md` so Privacy Export/Delete UX is `done-foundation`, L12 is completed, and L13 becomes next.

- [ ] **Step 3: Commit locally**

Run:

```bash
git add src/lib/privacyControls.ts src/lib/privacyControls.test.ts src/components/PrivacyControlPanel.tsx src/lib/appShellEvidenceLayout.ts src/lib/appShellEvidenceLayout.test.ts src/App.tsx docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-privacy-export-delete-ux.md artifacts/web-second-brain-product-surface/privacy-export-delete-surface.png
git commit -m "feat: render privacy export delete controls"
```
