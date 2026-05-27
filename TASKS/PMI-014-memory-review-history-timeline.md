# Task Contract — PMI-014 Memory Review History Timeline

## Task ID

`PMI-014`

## Status

`ready_for_human_review`

## Goal

Persist memory edit review ledger entries as owner-scoped private history records and expose them in the memory detail timeline surface.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L43
- Epic: durable memory review history and timeline rendering
- Product goal: make source-backed memory corrections auditable over time instead of one-response-only ledger events
- Privacy constraint: no secret exposure, no cross-user leakage, no remote push

## Allowed files

- `TASKS/PMI-014-memory-review-history-timeline.md`
- `docs/superpowers/plans/2026-05-28-memory-review-history-timeline.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/memoryReviewLedger.ts`
- `src/lib/memoryReviewLedger.test.ts`
- `src/lib/memoryDetailTimeline.ts`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `src/lib/appShellEvidenceLayout.ts`
- `src/components/MemoryDetailTimelinePanel.tsx`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `/api/memory/update` persists each review ledger entry as a private owner-scoped ledger record.
- review ledger records can be listed for one memory without returning another user's ledger events.
- `GET /api/memory/detail` includes the selected memory's review history.
- `GET /api/memory/review-history` returns only review entries for the active private vault user and selected memory.
- memory review ledger records do not appear as normal graph/timeline memory nodes.
- the memory detail timeline UI exposes the review history endpoint, count, latest revision id, and rendered review entries/empty state.

## Required tests

- `src/lib/memoryReviewLedger.test.ts`
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
- review history leaks or mutates another user's records
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

- RED: `npm test -- src/lib/memoryReviewLedger.test.ts` failed before implementation because `buildMemoryReviewLedgerRecord` did not exist.
- RED: `npm test -- src/lib/personalMemoryApi.test.ts -t "review"` failed before implementation because review history was not persisted or returned.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "review ledger"` failed before implementation because timeline review metadata was missing.
- GREEN focused tests passed after implementation:
  - `npm test -- src/lib/memoryReviewLedger.test.ts`
  - `npm test -- src/lib/personalMemoryApi.test.ts -t "review"`
  - `npm test -- src/lib/localHttpTransport.test.ts -t "reviews and updates"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "review ledger"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"`
- `git diff --name-only`: showed PMI-014 implementation files; `git status --short` also shows unrelated untracked PMI-009/PMI-010 task contracts left untouched.
- `npm run typecheck`: failed with `src/lib/memoryReviewLedger.ts(149,32): error TS18047: 'item.entry' is possibly 'null'.`
- Recovery: split the review-history filter predicate null check in `src/lib/memoryReviewLedger.ts` so TypeScript can narrow `item.entry` before reading `memoryId`.
- Allowed-file review: added `src/lib/appShellEvidenceLayout.ts` to the contract because it is the implementation companion to the already-listed timeline metadata test and is required for the accepted UI contract.
- Final `git diff --name-only`:
  - `TASKS/PMI-014-memory-review-history-timeline.md`
  - `docs/product/product-execution-plan-2026-05-27.md`
  - `docs/superpowers/plans/2026-05-28-memory-review-history-timeline.md`
  - `src/components/MemoryDetailTimelinePanel.tsx`
  - `src/lib/appShellEvidenceLayout.test.ts`
  - `src/lib/appShellEvidenceLayout.ts`
  - `src/lib/localHttpTransport.test.ts`
  - `src/lib/memoryDetailTimeline.ts`
  - `src/lib/memoryReviewLedger.test.ts`
  - `src/lib/memoryReviewLedger.ts`
  - `src/lib/personalMemoryApi.test.ts`
  - `src/lib/personalMemoryApi.ts`
- Final verification:
  - `npm run typecheck` passed.
  - `npm test` passed: 38 files, 130 tests.
  - `npm run build` passed.

## Known risks

- Staging PostgreSQL/pgvector/auth/LLM smoke remains secret-gated and was not run.
- No remote push was performed.
