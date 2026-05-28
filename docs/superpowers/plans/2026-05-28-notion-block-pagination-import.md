# Notion Block Pagination Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preserve all paginated Notion page block text in direct import preview candidates.

**Architecture:** Keep pagination inside the existing Notion connector so the API/UI contract remains unchanged. Fetch child blocks page-by-page using `next_cursor`, append supported text in order, and fall back to already fetched text if a later child-block request fails.

**Tech Stack:** TypeScript, Vitest, existing Notion REST fetch adapter.

---

### Task 1: Paginated Child-Block Fetch

**Files:**
- Modify: `src/lib/notionImport.test.ts`
- Modify: `src/lib/notionImport.ts`
- Modify: `TASKS/PMI-054-notion-block-pagination-import.md`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [x] **Step 1: Write the failing test**

Add a Vitest case in `src/lib/notionImport.test.ts` proving that a first block response with `has_more: true` and `next_cursor` causes a second child-block request, and that both pages of block text appear in `rawText` without exposing the token.

- [x] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/notionImport.test.ts`

Expected: FAIL because the connector only requests `/children?page_size=50` and does not follow `next_cursor`.

- [x] **Step 3: Implement minimal pagination**

Update `queryNotionPageBlocks` in `src/lib/notionImport.ts` to loop over child-block pages, adding `start_cursor` only after Notion returns `next_cursor`. Keep returned block order stable and catch per-page import failures at the existing caller boundary.

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

Update the task contract to `ready_for_human_review`, append L54 to the Product Execution Plan, then commit only the allowed files:

```bash
git add TASKS/PMI-054-notion-block-pagination-import.md docs/superpowers/plans/2026-05-28-notion-block-pagination-import.md docs/product/product-execution-plan-2026-05-27.md src/lib/notionImport.ts src/lib/notionImport.test.ts
git commit -m "feat: import paginated notion blocks"
```
