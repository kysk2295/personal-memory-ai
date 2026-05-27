# Feedback Correction UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible web affordance for saving user corrections as private feedback memories.

**Architecture:** Render a compact feedback panel in the product rail, close to Ask/Privacy/Reports, and post to the existing `/api/feedback` endpoint when served over HTTP. Static previews keep a local submitted state so Playwright can verify the interaction without secrets or a server.

**Tech Stack:** TypeScript, static HTML rendering, Vitest, Playwright.

---

### Task 1: RED UI Contract Tests

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `scripts/verify-playwright-evidence.ts`

- [x] **Step 1: Add HTML contract assertions**

Assert rendered HTML contains:

- `data-feedback-panel="user-correction"`
- `data-feedback-endpoint="/api/feedback"`
- `data-feedback-state="ready"`
- target memory id `mem_freeze_vs_feature_addition`
- a feedback correction textarea and submit button

- [x] **Step 2: Add Playwright interaction assertion**

Assert clicking the feedback button changes:

- button/panel state to `submitted`
- shell `data-last-feedback-memory-target`
- shell `data-interaction-state="feedback-submitted"`

- [x] **Step 3: Run RED**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: FAIL because the feedback panel is not rendered yet.

### Task 2: Render Feedback Panel

**Files:**
- Create: `src/components/UserFeedbackPanel.tsx`
- Modify: `src/App.tsx`

- [x] **Step 1: Add feedback panel component**

Render:

- textarea with correction copy
- submit button
- endpoint/method/target metadata
- static-ready state attributes

- [x] **Step 2: Add panel to product rail**

Place it near Ask/Privacy so it reads as part of the agent learning loop.

- [x] **Step 3: Add click handler**

On click:

- read textarea value
- when `location.protocol !== 'file:'`, POST to `/api/feedback`
- otherwise set submitted state locally
- set shell `data-last-feedback-memory-target`
- set shell `data-interaction-state="feedback-submitted"`
- on failure, set `data-feedback-state="error"`

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
npm run build
npm run evidence:playwright
```

Expected: PASS after updating Playwright verified list.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-feedback-correction-ui.md`

- [x] **Step 1: Update product plan**

Add L32 as feedback correction UI.

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
git add src/App.tsx src/components/UserFeedbackPanel.tsx src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-feedback-correction-ui.md artifacts/web-second-brain-product-surface
git commit -m "feat: add feedback correction ui"
```
