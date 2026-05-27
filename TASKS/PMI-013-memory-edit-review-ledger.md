# Task Contract — PMI-013 Memory Edit Review Ledger

## Task ID

`PMI-013`

## Status

`ready_for_human_review`

## Goal

Return an auditable review ledger entry whenever an owner edits a memory, so source-backed corrections are not silent overwrites.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L42
- Epic: memory edit provenance/review history
- Product goal: preserve emotional trust by making edits explicit, scoped, and reviewable
- Privacy constraint: no secret exposure, no cross-user leakage, no remote push

## Allowed files

- `TASKS/PMI-013-memory-edit-review-ledger.md`
- `docs/superpowers/plans/2026-05-28-memory-edit-review-ledger.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/memoryReviewLedger.ts`
- `src/lib/memoryReviewLedger.test.ts`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
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

- edit review ledger entries include memory id, owner id, stable revision id, reviewed timestamp, changed fields, and before/after summaries.
- unchanged updates return an empty changed-fields list and still identify the reviewed memory.
- `/api/memory/update` returns the ledger entry with the updated memory.
- the review/edit UI exposes the last review revision id/state after a successful save.
- no other user's memory content appears in a ledger response.

## Required tests

- `src/lib/memoryReviewLedger.test.ts`
- `src/lib/personalMemoryApi.test.ts`
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
- ledger response leaks another user's records
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

- RED: `npm test -- src/lib/memoryReviewLedger.test.ts` failed before implementation because `./memoryReviewLedger` did not exist.
- RED: `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"` failed because `/api/memory/update` did not return `reviewLedgerEntry`.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders a benchmark-like second-brain graph workspace"` failed on missing `data-memory-review-ledger="pending"`.
- GREEN focused tests passed after implementation:
  - `npm test -- src/lib/memoryReviewLedger.test.ts`
  - `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders a benchmark-like second-brain graph workspace"`
- `git diff --name-only`: showed only tracked PMI-013 files; `git status --short` also shows unrelated untracked PMI-009/PMI-010 task contracts left untouched.
- `npm run typecheck`: passed.
- `npm test`: passed (`38` files, `126` tests).
- `npm run build`: passed.

## Known risks

- Ledger entries are returned by the update response and surfaced in UI state, but they are not yet durably persisted as a separate history table/record.
