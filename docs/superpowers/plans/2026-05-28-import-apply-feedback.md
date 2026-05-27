# Import Apply Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Show newly applied import memories immediately in the second-brain surface after `/api/import/apply`.

**Architecture:** Keep persisted imports in the existing private-vault API, then add a browser-side applied-import feedback projection that renders created memory ids and graph evidence records into the import panel and timeline without requiring a full app reload.

**Tech Stack:** TypeScript, Vitest, static web shell, existing import apply API response.

---

### Task 1: RED UI Contract Tests

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [x] **Step 1: Add applied import feedback UI assertions**

Assert the shell includes an applied import feedback target, created count attributes, and script hooks that render applied memories into the timeline.

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: FAIL until markup/script hooks exist.

### Task 2: Implement Applied Import Feedback

**Files:**
- Modify: `src/components/PatternPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `scripts/verify-playwright-evidence.ts`

- [x] **Step 1: Add feedback markup**

Add `data-import-applied-feedback`, `data-import-applied-count`, and `data-import-applied-memory-list`.

- [x] **Step 2: Add browser projection**

After import apply succeeds, render created memory ids and `graphEvidenceRecords` into the feedback list, append a timeline entry, and mark shell attributes for evidence.

- [x] **Step 3: Run focused UI tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: PASS.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-import-apply-feedback.md`

- [x] **Step 1: Update product plan**

Add L38 as import apply graph/timeline feedback.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/components/PatternPanel.tsx src/App.tsx src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-import-apply-feedback.md
git commit -m "feat: show applied import feedback"
```
