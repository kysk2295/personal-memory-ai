# Task Contract — PMI-016 Provenance Export Download Wiring

## Task ID

`PMI-016`

## Status

`ready_for_human_review`

## Goal

Wire the selected-memory provenance export into a real owner-scoped downloadable JSON artifact path.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L45
- Epic: source-backed review history and provenance export
- Product goal: make corrected memories portable and auditable through a concrete app/API download path
- Privacy constraint: local owner-scoped export only; no secret access, remote push, or cross-user leakage

## Allowed files

- `TASKS/PMI-016-provenance-export-download-wiring.md`
- `docs/superpowers/plans/2026-05-28-provenance-export-download-wiring.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.ts`
- `src/lib/localHttpTransport.test.ts`
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

- `GET /api/memory/provenance-download` returns the selected memory provenance bundle as the response body, not only a nested metadata object.
- The API response includes deterministic download headers with `Content-Disposition: attachment` and the export filename.
- Local HTTP transport preserves those headers for trusted-header and local-session auth.
- The download remains owner-scoped and never leaks another user's memory or review ledger records.
- The memory detail timeline UI exposes a dedicated provenance download endpoint, filename, and download button metadata.

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
- provenance download leaks another user's memory or review ledger
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

- RED: `npm test -- src/lib/personalMemoryApi.test.ts -t "provenance download"` failed with 404 because `/api/memory/provenance-download` did not exist.
- RED: `npm test -- src/lib/localHttpTransport.test.ts -t "downloads selected memory provenance"` failed with 404 because the HTTP path did not exist.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"` failed because the timeline panel lacked download endpoint/control metadata.
- Focused GREEN checks passed after implementation:
  - `npm test -- src/lib/personalMemoryApi.test.ts -t "provenance download"`
  - `npm test -- src/lib/localHttpTransport.test.ts -t "downloads selected memory provenance"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"`
- Final changed files from `git diff --name-only`:
  - `docs/product/product-execution-plan-2026-05-27.md`
  - `src/components/MemoryDetailTimelinePanel.tsx`
  - `src/lib/appShellEvidenceLayout.test.ts`
  - `src/lib/localHttpTransport.test.ts`
  - `src/lib/localHttpTransport.ts`
  - `src/lib/personalMemoryApi.test.ts`
  - `src/lib/personalMemoryApi.ts`
- New PMI-016 files included in the local commit:
  - `TASKS/PMI-016-provenance-export-download-wiring.md`
  - `docs/superpowers/plans/2026-05-28-provenance-export-download-wiring.md`
- Final verification passed:
  - `npm run typecheck`
  - `npm test` (39 files, 136 tests)
  - `npm run build`

## Known risks

- Staging PostgreSQL/pgvector/auth/LLM smoke remains secret-gated and was not run.
