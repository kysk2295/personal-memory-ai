# PMI-005 — Decision Replay Outcome Grounding Contract

## Task ID

PMI-005

## Status

ready_for_human_review

## Goal

Ensure Decision Replay recommendations are grounded in cited past outcomes and expose uncertainty when evidence is incomplete.

## Product context

Decision Replay must compare a current decision to similar past decisions, emotions, choices, and outcomes. It must not produce generic advice. The graph is evidence UI, and replay outputs must remain traceable to memory records and past outcomes.

## Allowed files

- `src/lib/decisionReplay.ts`
- `src/lib/decisionReplay.test.ts`
- `src/lib/__fixtures__/personalMemoryRecords.ts`
- `docs/verification/decision-replay-outcome-grounding-report.md`
- `TASKS/PMI-005-decision-replay-outcome-grounding.md`

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

- Replay result cites past decisions and outcomes used for recommendation.
- Replay result exposes uncertainty or insufficient evidence when similar outcomes are weak/missing.
- Tests cover a strong-evidence replay and weak-evidence replay.
- Graph highlight IDs remain traceable to current decision and cited memory records.
- No UI/frontend behavior is changed in this task.

## Required tests

- Add/update unit tests in `src/lib/decisionReplay.test.ts` for weak evidence/uncertainty.
- Existing Decision Replay tests must continue passing.

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
- Replay recommendation is not backed by cited past outcomes.

## Required evidence

- `git diff --name-only` output.
- Typecheck/test/build outputs.
- Short verification report documenting strong vs weak evidence replay behavior.

## Output requirements

- Open PR after gates pass.
- Paperclip status: `ready_for_human_review`, not `complete`.
- No screenshots required because this is backend/domain logic only.
