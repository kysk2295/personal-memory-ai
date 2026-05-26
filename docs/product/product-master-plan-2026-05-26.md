# Personal Memory AI — Product Master Plan

Status: planning-only, no implementation authorized by this document  
Owner: Ko Yunseo  
Workflow: Reins Engineering  
Last updated: 2026-05-26

## 0. Required development sequence

The active workflow is:

```text
PRD → Product Plan → Phase → Epic → Task Contract → Implementation → Verification → PR → Human Review
```

RPI workers may only run after a specific `TASKS/*.md` Task Contract exists and has status `ready_for_rpi`.

This document is the Product Plan layer. It must exist before new Task Contracts are created or executed.

## 1. Source PRD context

Current PRD/context file:

- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`

Core product promise:

> 나보다 나를 더 잘 아는 개인 기억 AI

Product model:

- App: fast diary / memory capture surface.
- Web: second-brain graph and analysis workspace.
- Backend: PostgreSQL + pgvector durable memory and semantic retrieval layer.

Graph principle:

- The graph is evidence UI, not the product by itself.
- Ask, Decision Replay, Pattern Report, and evidence drawer must remain grounded in real memory citations.

## 2. Benchmark / reference URL

Benchmark explicitly required for frontend design work:

- `https://www.careerhackeralex.com/memory`

Current PRD status:

- The Korean PRD mentions “Careerhacker Alex류 사이트” as a reference direction.
- It did **not** explicitly include the full benchmark URL before this Product Master Plan.
- This Product Master Plan now makes the benchmark URL explicit and binding for relevant frontend/design Phases and Epics.

Benchmark is not proof of product quality by itself. It is a comparison input for visual hierarchy, landing rhythm, graph/demo presentation, card depth, spacing, typography, and evidence-first storytelling.

## 3. Current deployed/staging addresses

Current web staging URL:

- `https://web-production-bcaf6.up.railway.app`

Current API URL:

- `https://api-production-b11d.up.railway.app`

Observed status as of 2026-05-26:

- Web `/health/live`: returns OK from CLI smoke.
- Web root HTML contains `Memory brain graph`, `Ask My Past Self`, `Decision Replay`, and `Every action points back` from CLI smoke.
- Browser evidence remains a blocker: PMI-001 found that browser snapshots/DOM could show content while screenshot captures were blank. PMI-006 is the dedicated rendering reliability gate before any frontend polish or completion claim.
- API `/health/live`: previously observed OK.
- API `/health/ready`: previously observed not-ready due to KMS/encryption staging config. This is not a frontend completion blocker but is a backend readiness blocker.

## 4. Current implementation inventory — honest labels

These labels are planning estimates only. They are not completion proof.

### Implemented / generated, needs verification

- Domain/data files exist under `src/lib/**` for MemoryRecord, pattern detection, Ask My Past Self, Decision Replay, graph evidence, import preview, fast diary capture, memory store, and PostgreSQL store.
- Unit tests exist under `src/lib/**/*.test.ts`.
- Static web rendering files exist: `src/App.tsx`, `src/components/**`, `server.mjs`, `Dockerfile`, `railway.json`.
- Railway web staging URL exists and responds to CLI health smoke.

### Partial / not product-complete

- Web first screen exists but currently reads like a developer demo, not a polished product experience.
- Ask My Past Self appears citation-oriented, but insufficient-evidence behavior still needs contract-level verification.
- Decision Replay appears outcome-oriented, but weak-evidence/uncertainty behavior still needs contract-level verification.
- Evidence drawer exists as a concept but needs trust-surface copy/structure audit and polish.
- PostgreSQL/pgvector store exists as code, but live staging persistence/search/delete smoke is not verified here.

### Not done / blocked

- Human-reviewed frontend design parity against `https://www.careerhackeralex.com/memory`.
- Production-grade browser evidence for frontend completion.
- PRs for individual Reins tasks.
- Human approval for any task completion.
- Production deployment approval.
- API `/health/ready` readiness.
- Real user auth/payment/secret-management work.

## 5. Phase structure

### Phase 0 — Workflow and audit foundation

Goal: make the project safe to continue under Reins Engineering.

Epics:

- E0.1 Reins operating policy and repository guardrails.
- E0.2 Current staging/frontend baseline audit.
- E0.3 Existing implementation inventory and risk labeling.

Exit criteria:

- `AGENTS.md` defines the active workflow.
- Product Master Plan exists.
- Current staging/frontend status is captured with real browser evidence.
- No RPI worker runs before Task Contracts.

### Phase 1 — Frontend product experience baseline

Goal: turn the current web surface from developer demo into an emotionally trustworthy, evidence-first product screen.

Epics:

- E1.1 Benchmark comparison against CareerHacker Alex memory page.
- E1.2 First screen information hierarchy.
- E1.3 Evidence drawer trust surface.
- E1.4 Ask/Decision/Pattern action card hierarchy.
- E1.5 Browser screenshot evidence and Ko Yunseo UX review.

Exit criteria:

- Staging URL opens in a real browser.
- Screenshots are attached to reports.
- Ko Yunseo reviews and approves frontend direction.
- No frontend task is marked complete; only `ready_for_human_review` before approval.

### Phase 2 — Evidence-grounded AI behavior

Goal: ensure Ask and Decision Replay never hallucinate and always cite real memory evidence or declare insufficient evidence.

Epics:

- E2.1 Ask My Past Self sufficient/insufficient evidence contract.
- E2.2 Decision Replay outcome grounding and uncertainty.
- E2.3 Weekly Pattern Report evidence thresholds.
- E2.4 Graph highlight IDs tied to cited memory records.

Exit criteria:

- Unit tests cover sufficient and insufficient evidence paths.
- Generic advice without citations is impossible under tests.
- Build/typecheck/test pass.

### Phase 3 — Capture/import to memory graph loop

Goal: make the app/web loop credible: capture/import creates MemoryRecords that appear as graph/evidence nodes.

Epics:

- E3.1 Fast diary capture MemoryRecord contract.
- E3.2 Import preview duplicate/source/date contract.
- E3.3 MemoryRecord to graph evidence mapping.
- E3.4 User-facing capture/import states without fake completeness.

Exit criteria:

- Capture/import flows have tested MemoryRecord outputs.
- UI states are clear about sample/partial behavior.
- Browser evidence exists for frontend surfaces.

### Phase 4 — Durable backend and pgvector staging

Goal: connect durable memory persistence and semantic retrieval without exposing secrets or mutating production data.

Epics:

- E4.1 PostgreSQL/pgvector staging smoke plan.
- E4.2 MemoryRecord persistence repository.
- E4.3 Semantic search with per-user isolation.
- E4.4 Export and hard-delete smoke.
- E4.5 API readiness blockers and redacted env presence reporting.

Exit criteria:

- Staging-only DB smoke passes.
- Secret values are never printed.
- No production DB mutation.

### Phase 5 — Review, PR, and release control

Goal: make every increment reviewable, reversible, and approved by Ko Yunseo.

Epics:

- E5.1 PR template and evidence report format.
- E5.2 Paperclip audit record format.
- E5.3 Human approval gate.
- E5.4 Staging-to-production release checklist.

Exit criteria:

- Every task ends at `ready_for_human_review`.
- PR links and evidence are attached.
- Main merge and production deployment require explicit Ko Yunseo approval.

## 6. Initial Epic → Task Contract structure

Existing initial contracts should be treated as contracts under this Product Plan, not direct PRD decomposition.

### Phase 0 / E0.2 — Current staging/frontend baseline audit and rendering reliability

- `TASKS/PMI-001-staging-frontend-design-baseline-audit.md`
- Status: `ready_for_human_review`
- Purpose: capture current staging evidence, list what is implemented vs not, identify design/product gaps.

- `TASKS/PMI-006-browser-visual-rendering-reliability-gate.md`
- Status: `failed_verification`
- Purpose: classify the blank-screenshot vs visible-DOM discrepancy and stop if no visible browser screenshot can be produced.

- `TASKS/PMI-007-render-path-diagnostic.md`
- Status: `ready_for_human_review`
- Purpose: isolate the narrowest render path/component/markup trigger behind the blank visible-pixel screenshots.

- `TASKS/PMI-008-staging-host-render-context-audit.md`
- Status: `ready_for_rpi`
- Purpose: audit Railway staging host response/render context to isolate why identical HTML still produces blank remote screenshots.

### Phase 1 / E1.2 — First screen information hierarchy

- `TASKS/PMI-002-first-screen-information-hierarchy-polish.md`
- Status: `blocked_until_PMI-001_review`
- Purpose: improve first viewport hierarchy after audit.

### Phase 1 / E1.3 — Evidence drawer trust surface

- `TASKS/PMI-003-evidence-drawer-trust-surface.md`
- Status: `blocked_until_PMI-001_review`
- Purpose: make evidence drawer a trust surface after audit.

### Phase 2 / E2.1 — Ask My Past Self evidence threshold

- `TASKS/PMI-004-ask-insufficient-evidence-contract.md`
- Status: `ready_for_rpi`
- Purpose: prevent generic advice under weak evidence.

### Phase 2 / E2.2 — Decision Replay outcome grounding

- `TASKS/PMI-005-decision-replay-outcome-grounding.md`
- Status: `ready_for_rpi`
- Purpose: ensure replay recommendations cite past outcomes and expose uncertainty.

## 7. Execution policy from this plan

- Do not implement from PRD directly.
- Do not implement from Phase/Epic directly.
- Only implement from one selected Task Contract.
- RPI worker may execute only one `ready_for_rpi` task at a time.
- Any verification failure stops progression.
- Successful verification produces `ready_for_human_review`, not `complete`.
