# Task Contract — PMI-017 Review History Comparison UX

## Task ID

`PMI-017`

## Status

`ready_for_human_review`

## Goal

Expose review-history before/after comparison metadata in the memory detail timeline and render it as a clearer source review UX.

## Product context

- Phase: local private-vault polish path after Product Execution Plan L46
- Epic: source-backed review history and provenance export
- Product goal: make memory corrections auditable and emotionally trustworthy by showing what changed without pretending AI inferred unsupported details
- Privacy constraint: local owner-scoped review history only; no secret access, remote push, or cross-user leakage

## Allowed files

- `TASKS/PMI-017-review-history-comparison-ux.md`
- `docs/superpowers/plans/2026-05-28-review-history-comparison-ux.md`
- `docs/product/product-execution-plan-2026-05-27.md`
- `src/lib/memoryDetailTimeline.ts`
- `src/lib/memoryDetailTimeline.test.ts`
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

- Each timeline entry with review history exposes deterministic `reviewComparisons`.
- Each comparison includes revision id, reviewed date, changed field labels, source ref, before summary, after summary, and a plain-language delta label.
- The UI renders review comparison cards with before/after summary slots and changed-field chips.
- Empty review history remains explicit and calm.
- Review ledger records still do not appear as normal memory timeline entries.

## Required tests

- `src/lib/memoryDetailTimeline.test.ts`
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
- review history leaks another user's ledger or memory records
- a required edit would touch a forbidden file
- secret/config access becomes necessary

## Required evidence

- failing test output before implementation
- passing test output after implementation
- browser/screenshot evidence for the local frontend render if feasible
- final changed-file list from `git diff --name-only`
- local commit hash for the bounded slice

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote

## Verification result — 2026-05-28

- RED: `npm test -- src/lib/memoryDetailTimeline.test.ts -t "review comparison"` failed because timeline entries did not expose `reviewComparisons`.
- RED: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "review ledger"` failed because comparison-card markers were absent.
- Focused GREEN checks passed after implementation:
  - `npm test -- src/lib/memoryDetailTimeline.test.ts -t "review comparison"`
  - `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "review ledger"`
- Final changed files from `git diff --name-only`:
  - `docs/product/product-execution-plan-2026-05-27.md`
  - `src/components/MemoryDetailTimelinePanel.tsx`
  - `src/lib/appShellEvidenceLayout.test.ts`
  - `src/lib/memoryDetailTimeline.test.ts`
  - `src/lib/memoryDetailTimeline.ts`
- New PMI-017 files included in the local commit:
  - `TASKS/PMI-017-review-history-comparison-ux.md`
  - `docs/superpowers/plans/2026-05-28-review-history-comparison-ux.md`
- Final verification passed:
  - `npm run typecheck`
  - `npm test` (39 files, 137 tests)
  - `npm run build`
- Browser evidence attempted:
  - `PORT=4177 npm start` was blocked by local `tsx` IPC pipe permissions.
  - `python3 -m http.server 4177 --bind 127.0.0.1` was blocked by socket bind permissions.
  - Playwright Chromium `file://dist/index.html` render was blocked by browser launch `SIGTRAP`/`kill EPERM`.
  - Playwright WebKit/Firefox were unavailable because their browser binaries are not installed.

## Known risks

- Staging PostgreSQL/pgvector/auth/LLM smoke remains secret-gated and was not run.
- Browser screenshot evidence is blocked by the current sandbox's server/browser launch permissions; DOM/render behavior is covered by Vitest string-render tests.
