# Task Contract — PMI-054 Notion Block Pagination Import

## Task ID

`PMI-054`

## Status

`ready_for_human_review`

## Goal

Import all available paginated Notion child-block text for each previewed page instead of only the first block page.

## Product context

- Phase: local private-vault real-data import polish after Product Execution Plan L53
- Epic: direct Notion import fidelity
- Product goal: preserve full journal/source body evidence so later retrieval, graph, and citation surfaces do not reason from truncated notes
- Privacy constraint: keep the Notion integration token server-side only, never print or persist it

## Allowed files

- `src/lib/notionImport.ts`
- `src/lib/notionImport.test.ts`
- `docs/product/product-execution-plan-2026-05-27.md`
- `docs/superpowers/plans/2026-05-28-notion-block-pagination-import.md`
- `TASKS/PMI-054-notion-block-pagination-import.md`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `queryNotionDatabaseImportCandidates` follows Notion child-block `has_more` / `next_cursor` pagination for each page id.
- paginated block text is appended in API order after database property text.
- pagination uses the existing Notion token only in request headers and never includes it in candidates, docs, or test output.
- failed later child-block pages fall back to the blocks already fetched for that Notion page instead of failing the entire import preview.
- source refs, observed dates, tags, and provenance remain unchanged.

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

- RED focused test failure before implementation: `npm test -- src/lib/notionImport.test.ts` failed because the second paginated child-block URL was not requested.
- passing focused Notion import test: `npm test -- src/lib/notionImport.test.ts` passed with 6 tests.
- passing full typecheck, test, and build output: `npm run typecheck`, `npm test` (40 files, 154 tests), and `npm run build` all exited 0.
- final changed-file list from `git diff --name-only` plus new allowed files:
  - `docs/product/product-execution-plan-2026-05-27.md`
  - `src/lib/notionImport.test.ts`
  - `src/lib/notionImport.ts`
  - `TASKS/PMI-054-notion-block-pagination-import.md`
  - `docs/superpowers/plans/2026-05-28-notion-block-pagination-import.md`
- local commit hash for the bounded slice: `0fead18`.

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote
