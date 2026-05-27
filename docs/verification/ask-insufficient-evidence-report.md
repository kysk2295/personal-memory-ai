# PMI-004 — Ask My Past Self Insufficient Evidence Verification Report

Status: verified locally
Task contract: `TASKS/PMI-004-ask-insufficient-evidence-contract.md`

## Scope

Implemented bounded domain-logic hardening for `Ask My Past Self` so recommendation output now requires:
- at least 2 cited memories
- at least 2 distinct source types

If either threshold is not met, the result stays in `insufficient_evidence`, preserves citations/highlight ids, and emits an explicit no-generic-advice message instead of a normal recommendation.

## Files changed for PMI-004

- `src/lib/askMyPastSelf.ts`
- `src/lib/askMyPastSelf.test.ts`
- `src/lib/__fixtures__/personalMemoryRecords.ts`
- `docs/verification/ask-insufficient-evidence-report.md`

## Note on repo state

`git diff --name-only` also showed pre-existing unrelated frontend working-tree changes:
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`

Those files were not edited as part of PMI-004.

## Verification commands and results

### `git diff --name-only`

```text
src/App.tsx
src/lib/__fixtures__/personalMemoryRecords.ts
src/lib/appShellEvidenceLayout.test.ts
src/lib/askMyPastSelf.test.ts
src/lib/askMyPastSelf.ts
```

### `npm run typecheck`

```text
> typecheck
> tsc --noEmit -p tsconfig.json
```

Result: pass

### `npm test`

```text
> test
> vitest run

✓ src/lib/askMyPastSelf.test.ts (4 tests)
✓ all test files passed (31 tests total)
```

Result: pass

### `npm run build`

```text
> build
> tsx scripts/render-static.ts
```

Result: pass

## Behavioral evidence

### Sufficient evidence path

- Existing multi-citation, multi-source example still returns `sufficient_evidence`
- Existing recommendation is preserved:
  - `이번에는 기능을 더 넣기보다 freeze하고 사용자 피드백을 먼저 받으세요.`

### Insufficient evidence path — weak citations

- Single-citation case returns `insufficient_evidence`
- Output includes explicit threshold text:
  - `필요 최소치: citation 2개 / source 2개`
- Output explicitly states:
  - `No generic advice was generated.`

### Insufficient evidence path — repeated citations from one source only

- Added new fixture with 2 repeated citations from only `markdown`
- Pattern detector alone can still label the pattern as repeated
- `askMyPastSelf` now hardens that into `insufficient_evidence` because source diversity is too weak
- Output includes:
  - `현재 source 수: 1`

## Remaining follow-up

- Branch/PR creation should isolate PMI-004 from the separate uncommitted frontend benchmark files before final review handoff.
- If no additional conflicts appear, Paperclip target state for this slice is `ready_for_human_review` after branch/PR packaging.
