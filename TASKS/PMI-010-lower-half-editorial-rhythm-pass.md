# PMI-010 — Lower-Half Editorial Rhythm Pass

## Task ID

PMI-010

## Status

ready_for_rpi

## Goal

Apply one more small frontend detail pass after PMI-009, focused specifically on reducing dashboard density in the lower half of the first screen and making the page read more like an editorial product surface.

## Scope

In scope:
- adjust spacing, grouping, and visual hierarchy in the lower half
- reduce noisy/status-heavy feeling where possible without inventing new product capabilities
- make analysis/status surfaces feel more curated than backlog-like
- preserve all existing content correctness and demo evidence structure

Out of scope:
- new features
- data model changes
- backend changes
- merge/deploy
- claiming final frontend completion without human review

## Inputs

- `TASKS/PMI-009-frontend-benchmark-detail-pass.md`
- `docs/design/pmi009-frontend-benchmark-detail-pass-report.md`
- benchmark artifact: `artifacts/design-baseline/pmi009-benchmark-careerhackeralex.png`
- after-change artifact: `artifacts/design-baseline/pmi009-local-after-detail-pass.png`

## Deliverables

- one focused implementation pass
- verification (`npm run typecheck && npm test && npm run build`)
- fresh local browser evidence capture
- short report documenting what changed and what still remains

## Verification gate

Stop if verification fails. Do not claim completion beyond `ready_for_human_review`.
