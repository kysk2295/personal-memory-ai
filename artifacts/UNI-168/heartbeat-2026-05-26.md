# UNI-168 Resume Delta

## Scope
Fix `TS18048` in `src/lib/graphEvidence.ts` when `input.replay` is optional.

## Change made
- Updated `traceForHighlightId` in `src/lib/graphEvidence.ts`.
- Added local narrowing for optional replay metadata:
  - `const replayDecisionId = input.replay?.currentDecision.id;`
  - `const replayQueryId = input.currentQuery?.id ?? replayDecisionId;`
- Replaced unsafe direct accesses of `input.replay.currentDecision.id` in comparison and trace fallback
  with replay-guarded values (`replayDecisionId` / `replayQueryId`).

## Rationale
- Keep behavior unchanged (decision-query matching and fallback trace labeling).
- Ensure strict-nullability checks no longer flag optional replay dereference in graph evidence trace resolution.

## Disposition
- `done`
