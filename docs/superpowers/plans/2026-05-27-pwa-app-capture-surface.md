# PWA App Capture Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a mobile-first app capture surface that lets a user write a quick diary entry and shows how the saved capture becomes a private MemoryRecord in the web second brain.

**Architecture:** Keep the app capture surface separate from the web graph workspace. Add a small renderable capture state model, a mobile PWA document, static build output under `/capture/`, and product-plan status updates.

**Tech Stack:** TypeScript, Vitest, static HTML/CSS, existing `fastDiaryCapture` and `/api/capture` contract, Playwright screenshot evidence.

---

## Files

- Create: `src/lib/appCaptureSurface.ts`
- Test: `src/lib/appCaptureSurface.test.ts`
- Create: `src/AppCapture.tsx`
- Test/Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `scripts/render-static.ts`
- Modify: `server.mjs`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Add artifact: `artifacts/web-second-brain-product-surface/pwa-app-capture-surface.png`

## Task 1: Capture Surface State

- [x] **Step 1: Write failing test**

Assert the app capture state exposes mobile-first mode, local/private status, quick-save `/api/capture` metadata, a saved MemoryRecord preview, and a target web graph node id.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appCaptureSurface.test.ts`

Expected: FAIL because `src/lib/appCaptureSurface.ts` does not exist.

- [x] **Step 3: Implement minimal state model**

Create `src/lib/appCaptureSurface.ts` using `captureFastDiaryMemory`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/appCaptureSurface.test.ts`

Expected: PASS.

## Task 2: Mobile PWA Document

- [x] **Step 1: Write failing render/build assertions**

Assert `renderAppCaptureDocument()` includes the mobile capture aria label, `/api/capture`, private/local status, generated memory id, and graph target.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appCaptureSurface.test.ts`

Expected: FAIL until renderer exists.

- [x] **Step 3: Implement capture renderer**

Create `src/AppCapture.tsx`.

- [x] **Step 4: Add static build route**

Update `scripts/render-static.ts` to emit `dist/capture/index.html` and `dist/manifest.webmanifest`.

- [x] **Step 5: Run focused tests**

Run: `npx vitest run src/lib/appCaptureSurface.test.ts`

Expected: PASS.

## Task 3: Local Route, Screenshot, and Product Plan

- [x] **Step 1: Support `/capture/` in local server**

Update `server.mjs` to serve directory `index.html` files.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [x] **Step 3: Capture screenshot evidence**

Save `artifacts/web-second-brain-product-surface/pwa-app-capture-surface.png`.

- [x] **Step 4: Mark L13 done-foundation**

Update `docs/product/product-execution-plan-2026-05-27.md` so Mobile/PWA capture UI is `done-foundation`, L13 is completed, and L14 becomes next.

- [ ] **Step 5: Commit locally**

Run:

```bash
git add src/lib/appCaptureSurface.ts src/lib/appCaptureSurface.test.ts src/AppCapture.tsx scripts/render-static.ts server.mjs docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-pwa-app-capture-surface.md artifacts/web-second-brain-product-surface/pwa-app-capture-surface.png
git commit -m "feat: render pwa app capture surface"
```
