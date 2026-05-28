# Task Contract — PMI-055 Notion Database Pagination Import

## Task ID

`PMI-055`

## Status

`ready_for_human_review`

## Goal

Import preview candidates from paginated Notion database/data-source query responses instead of only the first result page.

## Product context

- Phase: local private-vault real-data import polish after Product Execution Plan L54
- Epic: direct Notion import fidelity
- Product goal: preserve real journal/database coverage so imported memories are not silently limited by Notion API pagination
- Privacy constraint: keep the Notion integration token server-side only, never print or persist it

## Allowed files

- `src/lib/notionImport.ts`
- `src/lib/notionImport.test.ts`
- `docs/product/product-execution-plan-2026-05-27.md`
- `docs/superpowers/plans/2026-05-28-notion-database-pagination-import.md`
- `TASKS/PMI-055-notion-database-pagination-import.md`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `queryNotionDatabaseImportCandidates` follows Notion data-source query `has_more` / `next_cursor` pagination.
- paginated database pages are converted to import preview candidates in API order.
- child-block fetching still runs for every fetched page id.
- a later database-page query failure keeps already fetched pages instead of failing the entire preview.
- Notion token appears only in request headers and never in candidates, docs, or test output.

## Required tests

- `src/lib/notionImport.test.ts`

## Verification commands

```bash
git diff --name-only
npm test -- src/lib/notionImport.test.ts
npm run typecheck
npm test
npm run build
```

## Stop conditions

- any verification command fails
- implementation would require Notion credentials or secret inspection
- a required edit would touch a forbidden file
- Notion token appears in import candidates, test output, or docs

## Required evidence

- RED focused test failure before implementation: `npm test -- src/lib/notionImport.test.ts` failed because the second data-source query body with `start_cursor` was not posted.
- passing focused Notion import test: `npm test -- src/lib/notionImport.test.ts` passed with 8 tests.
- passing full typecheck, test, and build output: `npm run typecheck`, `npm test` (40 files, 156 tests), and `npm run build` all exited 0.
- final changed-file list from `git diff --name-only` plus new allowed files:
  - `docs/product/product-execution-plan-2026-05-27.md`
  - `src/lib/notionImport.test.ts`
  - `src/lib/notionImport.ts`
  - `TASKS/PMI-055-notion-database-pagination-import.md`
  - `docs/superpowers/plans/2026-05-28-notion-database-pagination-import.md`
- local commit hash for the bounded slice: `0425333`.

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote
