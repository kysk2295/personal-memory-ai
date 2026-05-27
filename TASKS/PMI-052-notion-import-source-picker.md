# Task Contract — PMI-052 Notion Import Source Picker

## Task ID

`PMI-052`

## Status

`ready_for_human_review`

## Goal

Finish the direct Notion import source picker so the web import panel can list accessible Notion databases/data sources before previewing a selected source.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L51
- Epic: real-data import tightening
- Product goal: reduce manual Notion database-id friction while preserving server-side token privacy and the existing import preview/apply/undo gate
- Privacy constraint: Notion integration token remains server-side and must never appear in API responses, UI state, logs, or tests

## Allowed files

- `TASKS/PMI-052-notion-import-source-picker.md`
- `docs/superpowers/plans/2026-05-28-notion-import-source-picker.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/notionImport.ts`
- `src/lib/notionImport.test.ts`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/components/PatternPanel.tsx`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any secret store, keychain, OAuth code, token, or credential source
- any file outside the allowed list

## Acceptance criteria

- `queryNotionImportSources` calls Notion search and returns only database/data source choices.
- Source-list results include id, title, object type, and optional URL without exposing the token.
- `GET /api/import/notion/sources` is owner-scoped and returns explicit configuration errors when the Notion token is missing.
- Local HTTP transport can call source listing without leaking the token.
- Import panel exposes a source-list endpoint, list button, source list container, and client script state for selecting a source id into the existing preview field.

## Required tests

- `src/lib/notionImport.test.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/lib/appShellEvidenceLayout.test.ts`

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

## Stop conditions

- any verification command fails
- Notion token appears in response bodies, rendered HTML, or test output
- source listing requires new dependencies or package metadata changes
- secret/config access becomes necessary beyond env presence

## Required evidence

- failing focused test output before implementation
- passing focused test output after implementation
- final changed-file list from `git diff --name-only`
- local commit hash for the bounded slice

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote

## Verification result — 2026-05-28

- RED: `npx vitest run src/lib/notionImport.test.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts -t "Notion|notion"` failed because `queryNotionImportSources` was missing, `/api/import/notion/sources` returned 404, and the rendered import panel lacked source-list controls.
- Focused GREEN passed after implementation:
  - `npx vitest run src/lib/notionImport.test.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts -t "Notion|notion"` passed: 4 files, 9 tests.
- Final verification passed:
  - `npm run typecheck`
  - `npm test` passed: 40 files, 151 tests.
  - `npm run build`
- Final changed files from `git diff --name-only` included four generated screenshot artifact changes that were not part of this contract and were left uncommitted.

## Known risks

- Live Notion source listing still requires a valid server-side Notion token and user-approved workspace/database access.
- Staging PostgreSQL/pgvector/auth/LLM smoke remains secret-gated and was not run.
- Browser screenshot evidence remains blocked by the local sandbox/server/browser limitations seen in prior runs; this slice is covered by DOM/render and API tests.
