# Task Contract — PMI-012 Source Review/Edit Detail Surface

## Task ID

`PMI-012`

## Status

`ready_for_human_review`

## Goal

Let the owner review a selected memory's source details and submit a scoped summary/raw-text edit through the private API/HTTP path.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L41
- Epic: source review/edit detail surfaces
- Product goal: make individual memories inspectable and correctable without breaking citation trust or owner-only privacy
- Privacy constraint: no secret exposure, no cross-user leakage, no remote push

## Allowed files

- `TASKS/PMI-012-source-review-edit-detail-surface.md`
- `docs/superpowers/plans/2026-05-28-source-review-edit-detail-surface.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `src/components/MemoryDetailTimelinePanel.tsx`
- `src/App.tsx`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `GET /api/memory/detail` returns exactly one owner-scoped memory by id.
- `POST /api/memory/update` updates only editable review fields for the active private vault user.
- update rejects missing/non-owned memory ids with an explicit 404-style response.
- HTTP transport can call detail/update without exposing another user's records.
- the timeline/detail UI exposes the detail endpoint, update endpoint, selected memory id, source metadata, edit fields, and save action.
- static `file:` previews keep the visible review/edit surface without requiring a server.

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
- edit leaks or mutates another user's records
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

- RED: `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"` failed with `404` before implementation.
- RED: `npm test -- src/lib/localHttpTransport.test.ts -t "reviews and updates memories through HTTP"` failed with `404` before implementation.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders a benchmark-like second-brain graph workspace"` failed on missing `data-memory-review-panel="source-edit"`.
- GREEN focused tests passed after implementation:
  - `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"`
  - `npm test -- src/lib/localHttpTransport.test.ts -t "reviews and updates memories through HTTP"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders a benchmark-like second-brain graph workspace"`
- `git diff --name-only`: showed only PMI-012 tracked files; `git status --short` also shows unrelated untracked PMI-009/PMI-010 task contracts left untouched.
- `npm run typecheck`: passed.
- `npm test`: passed (`37` files, `124` tests).
- `npm run build`: passed.

## Known risks

- Browser/Playwright evidence is not part of this contract and was not required.
- Edit history/provenance ledger for changed summaries is still a future local polish loop.
