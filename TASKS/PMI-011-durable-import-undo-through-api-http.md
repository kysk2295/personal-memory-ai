# Task Contract — PMI-011 Durable Import Undo Through API/HTTP

## Task ID

`PMI-011`

## Status

`ready_for_human_review`

## Goal

Expose durable import undo through the private API/HTTP path so uploaded memories can be rolled back from the owner-scoped graph after an import apply.

## Product context

- Phase: next local execution loop after Product Execution Plan L40
- Epic: durable import undo through API/HTTP
- Product goal: keep local import reversible after records are persisted, preserving trust in the private memory graph
- Privacy constraint: no secret exposure, no cross-user leakage, no remote push

## Allowed files

- `TASKS/PMI-011-durable-import-undo-through-api-http.md`
- `docs/superpowers/plans/2026-05-28-durable-import-undo-api-http.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `src/App.tsx`
- `src/components/PatternPanel.tsx`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `POST /api/import/undo` accepts an owner-scoped list of applied memory ids.
- undo deletes only records owned by the active private vault user.
- HTTP transport can call the undo endpoint without leaking another user's records.
- local import UI exposes an undo endpoint and undo control after apply.
- undo updates local UI state and rehydrates the graph/timeline when served over HTTP.
- static `file:` previews keep local behavior without requiring a server.

## Required tests

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
- undo leaks or mutates another user's records
- a required edit would touch a forbidden file
- secret/config access becomes necessary

## Required evidence

- failing test output before implementation
- passing test output after implementation
- final changed-file list from `git diff --name-only`
- local commit hash for the bounded slice

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote

## Verification result — 2026-05-28

- RED: `npm test -- src/lib/personalMemoryApi.test.ts -t "undoes applied imports through the private API"` failed with `404` before implementation.
- RED: `npm test -- src/lib/localHttpTransport.test.ts -t "undoes applied imports through HTTP"` failed with `404` before implementation.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders the private diary-to-memory product surface"` failed on missing `data-import-undo-endpoint`.
- GREEN focused tests passed after implementation:
  - `npm test -- src/lib/personalMemoryApi.test.ts -t "undoes applied imports through the private API"`
  - `npm test -- src/lib/localHttpTransport.test.ts -t "undoes applied imports through HTTP"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders the private diary-to-memory product surface"`
- `git diff --name-only`: showed PMI-011 files plus unrelated dirty `scripts/verify-playwright-evidence.ts`; generated screenshot artifact churn from `npm run build` was restored and not included.
- `npm run typecheck`: passed.
- `npm test`: passed (`37` files, `122` tests).
- `npm run build`: passed.

## Known risks

- Browser/Playwright evidence was not required for PMI-011 and was not run.
- The working tree still contains unrelated uncommitted task contracts `PMI-009`/`PMI-010` and an unrelated modified `scripts/verify-playwright-evidence.ts`; they were excluded from this bounded commit.
