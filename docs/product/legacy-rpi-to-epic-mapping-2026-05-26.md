# Legacy RPI Plan → Product Master Plan / Epic Mapping

Status: planning-only mapping  
Source legacy plan: `docs/rpi/forward-rpi-plan.md`  
Target plan: `docs/product/product-master-plan-2026-05-26.md`  
Last updated: 2026-05-26

## Summary

The old Forward RPI Plan is not discarded as product scope. It is converted into Product Master Plan Phases and Epics.

What changed:

- Old plan allowed automatic continuation with `review_gate=none`.
- New Reins workflow forbids autonomous continuation.
- Old plan grouped work as broad RPI phases/tasks.
- New plan maps that scope into Phase → Epic → small Task Contract.

## Mapping

### Old Phase A — Finish local product loop

#### A1. Web second-brain first screen

Mapped to:

- Phase 1 — Frontend product experience baseline
- E1.1 Benchmark comparison against CareerHacker Alex memory page
- E1.2 First screen information hierarchy
- E1.5 Browser screenshot evidence and Ko Yunseo UX review

Existing task contracts:

- `TASKS/PMI-001-staging-frontend-design-baseline-audit.md`
- `TASKS/PMI-002-first-screen-information-hierarchy-polish.md`

Coverage status:

- Covered at Epic level.
- PMI-002 is blocked until PMI-001 review.

#### A2. Ask My Past Self visual flow

Mapped to:

- Phase 1 — Frontend product experience baseline
- E1.4 Ask/Decision/Pattern action card hierarchy
- Phase 2 — Evidence-grounded AI behavior
- E2.1 Ask My Past Self sufficient/insufficient evidence contract
- E2.4 Graph highlight IDs tied to cited memory records

Existing task contracts:

- `TASKS/PMI-004-ask-insufficient-evidence-contract.md`

Coverage status:

- Evidence contract covered by PMI-004.
- Visual flow polish needs a future frontend task under E1.4 after PMI-001/PMI-002 review.

#### A3. Decision Replay visual flow

Mapped to:

- Phase 1 — Frontend product experience baseline
- E1.4 Ask/Decision/Pattern action card hierarchy
- Phase 2 — Evidence-grounded AI behavior
- E2.2 Decision Replay outcome grounding and uncertainty
- E2.4 Graph highlight IDs tied to cited memory records

Existing task contracts:

- `TASKS/PMI-005-decision-replay-outcome-grounding.md`

Coverage status:

- Evidence/outcome contract covered by PMI-005.
- Visual flow polish needs a future frontend task under E1.4 after PMI-001 review.

#### A4. Weekly pattern report and capture loop

Mapped to:

- Phase 2 — Evidence-grounded AI behavior
- E2.3 Weekly Pattern Report evidence thresholds
- Phase 3 — Capture/import to memory graph loop
- E3.1 Fast diary capture MemoryRecord contract
- E3.2 Import preview duplicate/source/date contract
- E3.3 MemoryRecord to graph evidence mapping
- E3.4 User-facing capture/import states without fake completeness

Existing task contracts:

- No dedicated Task Contract yet.

Coverage status:

- Covered at Epic level.
- Needs future Reins Contracts before implementation.

#### A5. Local verification package

Mapped to:

- Phase 0 — Workflow and audit foundation
- E0.2 Current staging/frontend baseline audit
- E0.3 Existing implementation inventory and risk labeling
- Phase 5 — Review, PR, and release control
- E5.1 PR template and evidence report format
- E5.2 Paperclip audit record format

Existing task contracts:

- `TASKS/PMI-001-staging-frontend-design-baseline-audit.md`

Coverage status:

- Covered at Epic level.
- Needs future PR/evidence template contracts under Phase 5.

## Old Phase B — Railway staging readiness

#### B1. Inspect deploy shape without secrets

Mapped to:

- Phase 4 — Durable backend and pgvector staging
- E4.1 PostgreSQL/pgvector staging smoke plan
- E4.5 API readiness blockers and redacted env presence reporting

Existing task contracts:

- No dedicated Task Contract yet.

Coverage status:

- Covered at Epic level.
- Needs future Reins Contract before execution.

#### B2. Railway CLI/project verification

Mapped to:

- Phase 4 — Durable backend and pgvector staging
- E4.1 PostgreSQL/pgvector staging smoke plan
- E4.5 API readiness blockers and redacted env presence reporting

Existing task contracts:

- No dedicated Task Contract yet.

Coverage status:

- Covered at Epic level.
- Needs future Reins Contract before execution.

#### B3. Staging deploy

Mapped to:

- Phase 4 — Durable backend and pgvector staging
- E4.1 PostgreSQL/pgvector staging smoke plan
- E4.2 MemoryRecord persistence repository
- E4.3 Semantic search with per-user isolation

Existing task contracts:

- No dedicated Task Contract yet.

Coverage status:

- Covered at Epic level.
- Actual deployment/Railway config changes require explicit Task Contract permission.

#### B4. Staging smoke tests

Mapped to:

- Phase 4 — Durable backend and pgvector staging
- E4.1 PostgreSQL/pgvector staging smoke plan
- E4.3 Semantic search with per-user isolation
- E4.4 Export and hard-delete smoke
- E4.5 API readiness blockers and redacted env presence reporting

Existing task contracts:

- No dedicated Task Contract yet.

Coverage status:

- Covered at Epic level.
- Needs future Reins Contracts for DB/vector/API smoke.

## Old Phase C — Private beta hardening

Mapped to:

- Phase 4 — Durable backend and pgvector staging
- E4.4 Export and hard-delete smoke
- E4.5 API readiness blockers and redacted env presence reporting
- Phase 5 — Review, PR, and release control
- E5.3 Human approval gate
- E5.4 Staging-to-production release checklist

Missing / intentionally not yet expanded:

- Auth/user boundary.
- Error/loading/empty states.
- Mobile capture handoff.
- Private beta release checklist details.

Coverage status:

- Partially covered at Epic level.
- Needs future Phases/Epics or expanded Epics after Phase 0/1 review.

## Important removed behavior

The following old operating rule is intentionally removed:

```text
Continue automatically with review_gate=none
```

New rule:

```text
Run only one selected ready_for_rpi Task Contract.
Stop on failure.
Successful verification becomes ready_for_human_review, not complete.
Wait for Ko Yunseo review.
```

## Gap list

Old RPI scope not yet represented as concrete Task Contracts:

- Weekly Pattern Report evidence threshold task.
- Ask visual flow frontend task.
- Decision Replay visual flow frontend task.
- Capture loop MemoryRecord task.
- Import preview graph integration task.
- PostgreSQL/pgvector staging smoke task.
- Semantic search per-user isolation task.
- Export/hard-delete smoke task.
- PR/evidence template task.
- Staging-to-production release checklist task.
- Auth/user-boundary task.
- Error/loading/empty-state task.
- Mobile/PWA capture handoff task.

These are not lost. They remain at Phase/Epic level until decomposed into small Reins Contracts.
