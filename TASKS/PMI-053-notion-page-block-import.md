# Task Contract — PMI-053 Notion Page Block Import

## Task ID

`PMI-053`

## Status

`ready_for_human_review`

## Goal

Include first-page Notion child block text in direct Notion database import candidates so real journal/database notes do not lose the body content that lives outside database properties.

## Product context

- Phase: local private-vault real-data import polish after Product Execution Plan L52
- Epic: direct Notion import fidelity
- Product goal: make imported Notion memories evidence-rich enough for later graph, retrieval, and citation surfaces
- Privacy constraint: keep the Notion integration token server-side only, never print or persist it

## Allowed files

- `src/lib/notionImport.ts`
- `src/lib/notionImport.test.ts`
- `docs/product/product-execution-plan-2026-05-27.md`
- `docs/superpowers/plans/2026-05-28-notion-page-block-import.md`
- `TASKS/PMI-053-notion-page-block-import.md`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `queryNotionDatabaseImportCandidates` fetches child block content for each returned Notion page that has an id
- supported text blocks include paragraph, headings, bullets, numbered items, quotes, callouts, to-dos, toggles, and code
- imported candidate `rawText` includes database property text plus page block text without including the Notion token
- pages with failed child-block fetches still import property-based text instead of failing the whole preview
- source refs, observed dates, tags, and provenance remain unchanged

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

- RED focused test failure before implementation
- passing focused Notion import test
- passing full typecheck, test, and build output
- final changed-file list from `git diff --name-only`
- local commit hash for the bounded slice

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote

## Verification result — 2026-05-28

- RED: `npm test -- src/lib/notionImport.test.ts` failed because only the data-source query was called and no `/blocks/page-1/children` request existed.
- Focused GREEN: `npm test -- src/lib/notionImport.test.ts` passed (`1` file, `4` tests).
- `git diff --name-only`: reviewed scoped changes in `src/lib/notionImport.ts` and `src/lib/notionImport.test.ts` before documentation updates.
- `npm run typecheck`: passed.
- `npm test`: passed (`40` files, `152` tests).
- `npm run build`: passed.

## Known risks

- Child block import currently reads the first Notion blocks page (`page_size=50`) and does not follow pagination yet.
- Browser screenshot evidence was not required for this connector-only task.
