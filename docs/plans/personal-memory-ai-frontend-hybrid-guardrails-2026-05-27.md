# Personal Memory AI Frontend Hybrid Guardrails

Status: active after user correction (2026-05-27)
Owner: Ko Yunseo
Operator: Hermes

## Why this exists

Small tasks alone did not prevent drift. The failure mode was not only task size; it was autonomous reinterpretation of the PRD and benchmark during execution.

This guardrail overrides that behavior for frontend work.

## Non-negotiable source of truth

1. PRD: `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
2. Product plan: `docs/product/product-master-plan-2026-05-26.md`
3. Exact benchmark site provided by user:
   - `https://www.careerhackeralex.com/memory`
4. Existing task contracts under `TASKS/`

If any implementation idea conflicts with these, stop and ask Ko Yunseo.

## Core correction

Do not reinterpret:
- benchmark as only a vague inspiration
- graph as decorative hero art
- frontend polish as permission to redesign product meaning
- task decomposition as permission to rewrite product direction

The benchmark is real and binding for frontend comparison work.
The PRD remains the product source of truth.
The job is to move the product toward PRD fidelity using the benchmark as a concrete frontend reference.

## Allowed behavior for each frontend cycle

Each frontend cycle may batch 2–4 subtasks, but must stay inside one bounded theme.

Examples of valid batch themes:
- first-screen hierarchy + hero typography + CTA rhythm
- graph framing + evidence drawer polish + annotation restraint
- lower-half density reduction + section spacing + status cleanup

Invalid batch themes:
- full redesign
- changing product narrative
- inventing new capabilities
- replacing evidence UI with a prettier but less grounded concept

## Required pre-implementation check for every cycle

Before editing code, explicitly write down:
1. which PRD lines this cycle serves
2. which benchmark qualities are being borrowed
3. what must remain unchanged
4. what screenshot evidence will prove success

If this cannot be stated in 4 bullets, the cycle is too vague and must be reduced.

## Must-remain-true product constraints

- Graph is evidence UI, not the product itself.
- Ask / Decision Replay / Pattern must remain visible product pillars.
- Evidence/citation grounding must not be visually buried.
- Internal implementation status must not dominate user-facing UI.
- No claim of completion without real browser/staging evidence.

## Review cadence

Use hybrid mode:
- batch 2–4 tightly related subtasks
- then stop for review with screenshot evidence
- do not continue into the next design theme automatically

## Required user-facing report format after each cycle

1. PRD target served
2. benchmark detail borrowed
3. exact files changed
4. what visually changed
5. what intentionally did not change
6. screenshot artifact(s)
7. what still remains behind benchmark/PRD

## Anti-drift stop conditions

Stop immediately if any of the following happens:
- Hermes starts describing a broader design philosophy than the PRD states
- Hermes cannot point to the benchmark page being compared
- the change makes the site feel more like a generic dashboard/demo
- the change weakens evidence-first product understanding
- the change cannot be verified with before/after screenshots

## Execution default from now on

Frontend work proceeds in hybrid mode:
- Reins safety gates stay on
- 2–4 related subtasks per cycle
- one visual theme per cycle
- mandatory benchmark + PRD anchoring before edits
- mandatory screenshot evidence after edits
