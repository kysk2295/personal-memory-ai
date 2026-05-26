# PMI-004 — Ask My Past Self Insufficient Evidence Contract

## Task ID

PMI-004

## Status

ready_for_rpi

## Goal

Strengthen Ask My Past Self so it returns explicit insufficient evidence instead of generic advice when matching memories/citations are weak.

## Product context

Personal Memory AI requires citation-based reasoning. Ask My Past Self must remain grounded in real memories. If evidence quality is weak, the product must say insufficient evidence instead of hallucinating or giving generic advice.

## Allowed files

- `src/lib/askMyPastSelf.ts`
- `src/lib/askMyPastSelf.test.ts`
- `src/lib/__fixtures__/personalMemoryRecords.ts`
- `docs/verification/ask-insufficient-evidence-report.md`
- `TASKS/PMI-004-ask-insufficient-evidence-contract.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `server.mjs`
- `src/App.tsx`
- `src/components/**`
- `db/**`
- `.env`
- `.env.*`
- auth/payment/secret management files

## Acceptance criteria

- A low/no-match question returns an explicit insufficient evidence status.
- Low/no-match output contains no generic recommendation.
- Sufficient-evidence questions still return citations and graph highlight IDs.
- Tests cover both sufficient and insufficient evidence paths.
- No UI/frontend behavior is changed in this task.

## Required tests

- Add/update unit tests in `src/lib/askMyPastSelf.test.ts` for insufficient evidence.
- Existing Ask tests must continue passing.

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

## Stop conditions

- Any forbidden file changes.
- Any verification command fails.
- Implementation touches UI or frontend components.
- The insufficient-evidence response still includes generic advice.

## Required evidence

- `git diff --name-only` output.
- Typecheck/test/build outputs.
- Short verification report documenting sufficient vs insufficient behavior.

## Output requirements

- Open PR after gates pass.
- Paperclip status: `ready_for_human_review`, not `complete`.
- No screenshots required because this is backend/domain logic only.
