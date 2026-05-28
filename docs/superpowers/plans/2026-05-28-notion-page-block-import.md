# Notion Page Block Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Notion child block text to direct Notion import preview candidates.

**Architecture:** Keep `queryNotionDatabaseImportCandidates` as the single connector entry point. After querying the data source, fetch first-page child blocks per page id, extract supported rich-text blocks into plain lines, and pass those lines into the existing candidate builder without changing API routes or token handling.

**Tech Stack:** TypeScript, Vitest, Notion REST shape stubs, existing import preview candidate contract.

---

### Task 1: Notion Block Content Fidelity

**Files:**
- Modify: `src/lib/notionImport.test.ts`
- Modify: `src/lib/notionImport.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-053-notion-page-block-import.md`

- [x] **Step 1: Write the failing test**

Add a Vitest case in `src/lib/notionImport.test.ts` that stubs a data-source query and a `GET /v1/blocks/<page-id>/children` response. Assert that the candidate raw text contains the page title, property text, and block text, and that the serialized candidate does not contain the token.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/notionImport.test.ts`

Expected: FAIL because `queryNotionDatabaseImportCandidates` does not fetch block children yet.

- [x] **Step 3: Write minimal implementation**

In `src/lib/notionImport.ts`, add block response types and helpers that extract plain text from common Notion block types. Fetch child blocks for each page id with `GET https://api.notion.com/v1/blocks/<page-id>/children?page_size=50`, swallow per-page child fetch failures, and append extracted block lines to `rawText`.

- [x] **Step 4: Run focused test to verify it passes**

Run: `npm test -- src/lib/notionImport.test.ts`

Expected: PASS for all Notion connector tests.

- [x] **Step 5: Run full Reins verification**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Expected: all commands pass.

- [x] **Step 6: Record evidence and commit**

Update this task contract and the product execution plan with L53 evidence. Commit only allowed files:

```bash
git add src/lib/notionImport.ts src/lib/notionImport.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-notion-page-block-import.md TASKS/PMI-053-notion-page-block-import.md
git commit -m "feat: import notion page block text"
```

## Evidence

- RED: `npm test -- src/lib/notionImport.test.ts` failed on missing `/v1/blocks/page-1/children?page_size=50` fetch.
- GREEN: `npm test -- src/lib/notionImport.test.ts` passed (`1` file, `4` tests).
- Full gates passed:
  - `npm run typecheck`
  - `npm test` (`40` files, `152` tests)
  - `npm run build`
