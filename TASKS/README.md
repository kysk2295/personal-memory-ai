# TASKS — Personal Memory AI Reins Contracts

Do not add tasks directly from PRD. Use this hierarchy:

```text
PRD → Product Master Plan → Phase → Epic → Task Contract → Implementation
```

Product Master Plan:

- `docs/product/product-master-plan-2026-05-26.md`

## Initial structure

### Phase 0 — Workflow and audit foundation

#### Epic E0.2 — Current staging/frontend baseline audit

- `PMI-001-staging-frontend-design-baseline-audit.md`
- Status: `ready_for_rpi`
- Implementation allowed only after explicit user instruction.

### Phase 1 — Frontend product experience baseline

#### Epic E1.2 — First screen information hierarchy

- `PMI-002-first-screen-information-hierarchy-polish.md`
- Status: `blocked_until_PMI-001_review`

#### Epic E1.3 — Evidence drawer trust surface

- `PMI-003-evidence-drawer-trust-surface.md`
- Status: `blocked_until_PMI-001_review`

### Phase 2 — Evidence-grounded AI behavior

#### Epic E2.1 — Ask My Past Self evidence threshold

- `PMI-004-ask-insufficient-evidence-contract.md`
- Status: `ready_for_rpi`

#### Epic E2.2 — Decision Replay outcome grounding

- `PMI-005-decision-replay-outcome-grounding.md`
- Status: `ready_for_rpi`

## RPI rule

RPI worker can run only one task contract with status `ready_for_rpi` and only after explicit approval. Successful work becomes `ready_for_human_review`, never `complete`.

For Personal Memory AI frontend work, one approved task contract may execute as a hybrid cycle containing 2–4 tightly related subtasks under one bounded visual/theme objective, while keeping the same verification and human-review gate.
