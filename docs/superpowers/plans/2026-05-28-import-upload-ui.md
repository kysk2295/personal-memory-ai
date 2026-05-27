# Import Upload UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real local file/text import entry point that turns Markdown/JSON/Obsidian exports into private import preview candidates.

**Architecture:** Add a pure upload draft parser that converts selected local files into `ImportPreviewCandidate` records, then expose it in the web shell as an owner-only import surface that can preview and apply through the existing private-vault API. Keep OAuth out of this loop; this is local user-controlled import.

**Tech Stack:** TypeScript, Vitest, static web shell, browser `FileReader`, existing `/api/import/preview` and `/api/import/apply` endpoints.

---

### Task 1: RED Upload Draft Parser Tests

**Files:**
- Create: `src/lib/importUploadDraft.test.ts`

- [x] **Step 1: Add parser tests**

Assert Markdown and JSON records become deterministic `ImportPreviewCandidate[]`, empty files are blocked, and provenance keeps file name/path without needing OAuth.

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/importUploadDraft.test.ts
```

Expected: FAIL because `importUploadDraft.ts` does not exist.

### Task 2: Upload Draft Parser Implementation

**Files:**
- Create: `src/lib/importUploadDraft.ts`

- [x] **Step 1: Implement parser**

Implement `buildImportUploadDraft({ batchId, createdAt, files })` with Markdown/plain text and JSON array/object support.

- [x] **Step 2: Run focused parser tests**

Run:

```bash
npx vitest run src/lib/importUploadDraft.test.ts src/lib/importPreview.test.ts
```

Expected: PASS.

### Task 3: Web Upload Surface

**Files:**
- Modify: `src/components/PatternPanel.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `scripts/verify-playwright-evidence.ts`

- [x] **Step 1: Add UI contract tests**

Assert the app shell includes an import uploader, text paste area, preview/apply buttons, status markers, and API endpoint attributes.

- [x] **Step 2: Run RED UI tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: FAIL until UI markup/script is added.

- [x] **Step 3: Implement upload UI and browser interactions**

Add the import uploader surface and lightweight browser script that:

- reads selected files
- builds local candidate summaries
- calls `/api/import/preview` when served over HTTP
- updates preview/apply state markers
- calls `/api/import/apply` with the last preview

- [x] **Step 4: Run focused UI tests**

Run:

```bash
npx vitest run src/lib/appShellEvidenceLayout.test.ts
```

Expected: PASS.

### Task 4: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-import-upload-ui.md`

- [x] **Step 1: Update product plan**

Add L37 as local file upload/import UI and mark file upload/import UI as `prototype-ui`.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/importUploadDraft.ts src/lib/importUploadDraft.test.ts src/components/PatternPanel.tsx src/App.tsx src/lib/appShellEvidenceLayout.test.ts scripts/verify-playwright-evidence.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-import-upload-ui.md
git commit -m "feat: add local import upload surface"
```
