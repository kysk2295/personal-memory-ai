# Notion Database Pagination Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve paginated Notion database query results in direct import preview candidates.

**Architecture:** Keep database pagination inside `queryNotionDatabaseImportCandidates`, collecting Notion pages in API order before the existing child-block fetch/build step. Use `start_cursor` on later POST bodies and fall back to already fetched pages if a later query page fails.

**Tech Stack:** TypeScript, Vitest, existing Notion REST fetch adapter.

---

### Task 1: Paginated Database Query

**Files:**
- Modify: `src/lib/notionImport.test.ts`
- Modify: `src/lib/notionImport.ts`
- Modify: `TASKS/PMI-055-notion-database-pagination-import.md`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [x] **Step 1: Write the failing test**

Add a Vitest case in `src/lib/notionImport.test.ts` proving that a first Notion data-source query response with `has_more: true` and `next_cursor` causes a second POST with `start_cursor`, and that both result pages become preview candidates.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/notionImport.test.ts`

Expected: FAIL because the connector only posts one data-source query body.

- [x] **Step 3: Implement minimal pagination**

Update `queryNotionDatabaseImportCandidates` in `src/lib/notionImport.ts` to loop over query response pages, adding `start_cursor` only after Notion returns `next_cursor`. Keep result order stable and keep the existing child-block fetch behavior.

- [x] **Step 4: Run focused test**

Run: `npm test -- src/lib/notionImport.test.ts`

Expected: PASS.

- [x] **Step 5: Run full Reins verification**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [x] **Step 6: Record evidence and commit**

Update the task contract to `ready_for_human_review`, append L55 to the Product Execution Plan, then commit only the allowed files:

```bash
git add TASKS/PMI-055-notion-database-pagination-import.md docs/superpowers/plans/2026-05-28-notion-database-pagination-import.md docs/product/product-execution-plan-2026-05-27.md src/lib/notionImport.ts src/lib/notionImport.test.ts
git commit -m "feat: import paginated notion database pages"
```
