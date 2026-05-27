# Task Contract — PMI-015 Memory Provenance Export Affordance

## Task ID

`PMI-015`

## Status

`ready_for_human_review`

## Goal

Expose an owner-scoped provenance export for a selected memory detail timeline entry, including source fields, review history, and related memory context.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L44
- Epic: source-backed review history and provenance export
- Product goal: make corrected memories portable and auditable without implying unsupported production deployment
- Privacy constraint: local owner-scoped export only; no secret access, remote push, or cross-user leakage

## Allowed files

- `TASKS/PMI-015-memory-provenance-export-affordance.md`
- `docs/superpowers/plans/2026-05-28-memory-provenance-export-affordance.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/memoryProvenanceExport.ts`
- `src/lib/memoryProvenanceExport.test.ts`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/lib/memoryDetailTimeline.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `src/components/MemoryDetailTimelinePanel.tsx`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- A selected memory can be converted into a deterministic provenance export bundle.
- The export bundle includes memory id, source type/ref, observed date, raw text, summary, tags, review history, related memory ids, and export metadata.
- Review ledger records never appear as related normal memory records.
- `GET /api/memory/provenance-export` returns only the active owner user's selected memory export.
- HTTP transport can call the endpoint with trusted-header auth without leaking another user's records.
- The memory detail timeline UI exposes the provenance export endpoint, filename, and button affordance.

## Required tests

- `src/lib/memoryProvenanceExport.test.ts`
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
- provenance export leaks another user's memory or review ledger
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

- RED: `npm test -- src/lib/memoryProvenanceExport.test.ts` failed because `src/lib/memoryProvenanceExport.ts` did not exist.
- RED: `npm test -- src/lib/personalMemoryApi.test.ts -t "provenance export"` failed with 404 for `/api/memory/provenance-export`.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"` failed because the provenance export endpoint/filename/control were absent from the detail panel.
- Focused GREEN checks passed after implementation:
  - `npm test -- src/lib/memoryProvenanceExport.test.ts`
  - `npm test -- src/lib/personalMemoryApi.test.ts -t "provenance export"`
  - `npm test -- src/lib/localHttpTransport.test.ts -t "provenance"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"`
- Reins gate failure: `npm run typecheck` failed with `src/lib/memoryProvenanceExport.test.ts(54,12): error TS18047: 'exported' is possibly 'null'.`
- Continuation fix: added an explicit non-null assertion guard in `src/lib/memoryProvenanceExport.test.ts` before reading `relatedMemoryIds`.
- Final changed files from `git diff --name-only`:
  - `docs/product/product-execution-plan-2026-05-27.md`
  - `src/components/MemoryDetailTimelinePanel.tsx`
  - `src/lib/appShellEvidenceLayout.test.ts`
  - `src/lib/localHttpTransport.test.ts`
  - `src/lib/personalMemoryApi.test.ts`
  - `src/lib/personalMemoryApi.ts`
- New PMI-015 files included in the local commit:
  - `TASKS/PMI-015-memory-provenance-export-affordance.md`
  - `docs/superpowers/plans/2026-05-28-memory-provenance-export-affordance.md`
  - `src/lib/memoryProvenanceExport.test.ts`
  - `src/lib/memoryProvenanceExport.ts`
- Final verification passed:
  - `npm run typecheck`
  - `npm test` (39 files, 134 tests)
  - `npm run build`
- Feature local commit: `27b1538 feat: add memory provenance export`

## Known risks

- Staging PostgreSQL/pgvector/auth/LLM smoke remains secret-gated and was not run.
