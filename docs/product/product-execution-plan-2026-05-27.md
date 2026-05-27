# Personal Memory AI — Product Execution Plan

Status: active local execution plan  
Owner: Ko Yunseo  
Updated: 2026-05-27, expanded roadmap pass
Supersedes for local Codex work: `docs/product/product-master-plan-2026-05-26.md`

## 1. Product Definition

Personal Memory AI is a private memory system that turns diary entries, imported notes, and decisions into a personal second brain. The final product goal is an AI that can help with the user's worries and decisions because it can cite the user's past memories, patterns, and outcomes.

The product is not a public shared-memory network. "Sharing memory" means a new diary entry and relevant past memories are shown together inside one user's private context.

## 2. Product Surfaces

### App Capture

Purpose: low-friction diary and memory capture.

Required capabilities:

- quick text entry
- timestamp and source metadata
- optional emotion, project, people, and decision hints
- conversion into `MemoryRecord`
- private-by-default scope
- offline/local-first capture direction
- sync boundary into the web second-brain memory store

### Web Second Brain

Purpose: rich private memory exploration and evidence-backed reasoning.

Required capabilities:

- graph-first memory workspace
- Ask My Past Self
- Decision Replay
- Weekly Pattern Report
- Evidence Drawer
- import preview and undo
- export/delete commitments
- saved weekly/monthly reports
- timeline and search views
- source/detail pages for individual memories

### Personal Memory Agent

Purpose: answer questions and reason through decisions using only cited user memories.

Required capabilities:

- load user-scoped memories
- detect repeated patterns
- answer with citations or insufficient evidence
- replay decisions against past outcomes
- return graph/evidence payload for UI highlighting
- never produce generic advice as if it were memory-grounded
- retrieval/reranking over relevant memories
- LLM generation constrained by citations
- feedback loop from user corrections
- saved advice/report artifacts

### Durable Private Backend

Purpose: production storage and retrieval foundation.

Required capabilities:

- PostgreSQL memory persistence
- pgvector semantic retrieval
- per-user isolation
- export
- hard delete
- staging smoke without secret leakage
- API endpoints for capture, import, ask, replay, reports, export, delete
- auth/private vault boundary

## 3. Complete Feature Inventory

Status values:

- `done-foundation`: implemented as local deterministic foundation.
- `prototype-ui`: visible in static/local web surface.
- `planned`: required, not implemented.
- `later`: product-scale work after MVP.

| Area | Feature | Status | Notes |
|---|---|---|---|
| Capture | Fast diary to `MemoryRecord` | `done-foundation` | `fastDiaryCapture` and ingestion loop exist. |
| Capture | Mobile/PWA capture UI | `planned` | Current web shows prototype only, not real app capture. |
| Capture | Voice capture | `later` | In PRD direction, not MVP-critical. |
| Capture | Emotion/project/decision hints | `done-foundation` | Data contract exists; full UI still planned. |
| Import | Notion/Obsidian/Markdown preview | `done-foundation` | Preview/dedupe contract exists. |
| Import | Apply/undo import state model | `done-foundation` | Batch state model tracks preview, applied, skipped, graph evidence, and undone states. |
| Import | File upload/import UI | `planned` | Needed before real personal use. |
| Memory Store | Fixture user isolation | `done-foundation` | Tests cover user-scoped records. |
| Memory Store | PostgreSQL repository | `done-foundation` | Code exists; staging smoke still planned. |
| Memory Store | pgvector semantic search | `planned` | Store method exists; retrieval boundary not complete. |
| Web | Graph-first second brain | `prototype-ui` | Static graph/evidence surface exists. |
| Web | Evidence drawer | `prototype-ui` | Source/date/raw excerpt/why-connected visible. |
| Web | Individual memory detail page | `planned` | Needed for real review/edit workflows. |
| Web | Search/timeline views | `planned` | Needed for second-brain usefulness. |
| Ask | Ask My Past Self deterministic contract | `done-foundation` | Citation/insufficient evidence tested. |
| Ask | LLM answer generation | `planned` | Must be constrained by citations. |
| Ask | Follow-up conversation | `planned` | Requires session/report memory. |
| Decision | Decision Replay deterministic contract | `done-foundation` | Past outcome citations tested. |
| Decision | Decision result save-back | `planned` | Current decisions should become future memories. |
| Reports | Weekly Pattern Report foundation | `done-foundation` | Weekly report panel and pattern citation panel are visible in the web surface. |
| Reports | Weekly report engine | `done-foundation` | Date-window report generation aggregates emotions, decisions, outcomes, projects, and pattern citations. |
| Reports | Saved weekly/monthly reports | `planned` | Needs storage and report detail UI. |
| Reports | Scheduler/reminders | `planned` | After report engine and app/PWA capture. |
| Agent | Personal Memory Agent orchestrator | `done-foundation` | Loads store records and returns ask/replay/graph evidence. |
| Agent | Semantic retrieval/reranking | `done-foundation` | Deterministic retrieval contract ranks user-scoped memories; pgvector path remains a backend task. |
| Agent | User feedback learning loop | `planned` | Needed for agent personalization. |
| Privacy | Private-by-default scope | `done-foundation` | Data model and UI labels exist. |
| Privacy | Export/delete local UX | `planned` | Store functions exist; user-facing flow incomplete. |
| Privacy | Auth/private vault | `planned` | Required before multi-user beta. |
| Backend/API | Capture/import endpoints | `planned` | Needed after local domain contracts. |
| Backend/API | Ask/replay/report endpoints | `planned` | Needed before usable web/app integration. |
| Backend/API | Staging readiness | `planned` | Must not leak secrets. |
| Release | Visual evidence gates | `done-foundation` | Local screenshots exist; staging review still planned. |
| Release | PR/release checklist | `planned` | Needed before remote/main workflow. |

## 4. Execution Loop

Every internal loop follows this sequence:

1. Select one product outcome.
2. Write or update a small local plan under `docs/superpowers/plans/`.
3. Add failing tests first.
4. Implement the smallest code/UI change that passes.
5. Run `npm run typecheck`, `npm test`, and `npm run build`.
6. Capture screenshot evidence for UI loops.
7. Commit locally.
8. Pick the next loop from this plan unless blocked.

No remote push, main merge, production deploy, or secret access is allowed without explicit user instruction.

## 5. Current Completed Local Loops

- L0: product reset around source of truth.
- L1: web second-brain product surface.
- L2: capture/import ingestion loop.
- L3: capture/import product surface.
- L4: personal memory agent orchestrator.
- L5: store-backed app shell data builder.
- L6: import apply/undo UI state model.
- L7: weekly report engine.
- L8: weekly report product surface.
- L9: semantic retrieval contract.

## 6. Active Next Loops

### L10 — LLM Citation-Constrained Generation

Goal: add the LLM boundary for Ask/Replay/Report while forcing citation grounding.

Acceptance:

- prompt input contains only retrieved/cited memory evidence
- output schema requires citations
- missing citations cause fallback to insufficient evidence
- tests cover invalid/generic answer rejection

Estimated effort: 2-4 days.

### L11 — API Endpoints

Goal: expose capture, import, ask, replay, report, export, and delete through user-scoped API boundaries.

Acceptance:

- no secrets logged
- user id boundary is explicit
- endpoints call existing domain services
- tests cover success and insufficient evidence paths

Estimated effort: 2-4 days.

### L12 — Privacy Export/Delete UX

Goal: expose user-facing local export/delete behavior beyond labels.

Acceptance:

- export returns user memory payload
- delete removes user data
- UI shows private/local/skeleton status honestly
- tests cover batch delete and hard-delete guardrails

Estimated effort: 0.5-1 day.

### L13 — PWA/App Capture Surface

Goal: make capture usable from mobile without requiring the full web graph.

Acceptance:

- mobile-first capture screen
- quick save
- local/private status
- saved capture appears in store-backed second-brain graph

Estimated effort: 3-7 days.

### L14 — Staging Backend Readiness

Goal: verify PostgreSQL/pgvector staging without leaking secrets or mutating production data.

Acceptance:

- env presence report uses present/missing only
- pgvector smoke covers extension, insert, search, delete
- per-user isolation is demonstrated in staging-only smoke

Estimated effort: 1-3 days.

### L15 — Auth / Private Vault

Goal: ensure each user's second brain is accessible only to that user.

Acceptance:

- authenticated user identity boundary
- private vault/user id mapping
- no cross-user memory access
- export/delete scoped to one user

Estimated effort: 1-3 weeks depending on auth provider and deployment target.

## 7. Completed Loop Details

### L4 — Personal Memory Agent Orchestrator

Goal: create a single domain service that loads one user's memories from `MemoryStore`, runs pattern detection, Ask My Past Self, Decision Replay, and graph evidence generation.

Acceptance:

- user-scoped memories only
- sufficient evidence returns cited ask/replay/evidence payloads
- insufficient evidence remains explicit
- no generic advice without citations

Implemented:

- `src/lib/personalMemoryAgent.ts`
- `src/lib/personalMemoryAgent.test.ts`

### L5 — Store-Backed App Shell Data

Goal: move the static web shell toward store-backed data assembly while keeping deterministic local fixtures.

Acceptance:

- app shell can be built from a `MemoryStore`
- fixture fallback remains deterministic
- UI still shows graph, Ask, Evidence, Decision, Pattern, Capture/Import

Implemented:

- `buildAppShellEvidenceLayoutFromRecords(records)`
- `buildAppShellEvidenceLayoutFromMemoryStore({ store, userId })`

### L6 — Import Apply/Undo UI State Model

Goal: model the state transitions for applying and undoing import batches before adding real client interactivity.

Acceptance:

- preview state tracks importable and default-skipped rows
- applied state tracks created records, skipped rows, graph-visible records, and undo availability
- undone state clears graph-visible records and disables undo
- duplicate rows remain skipped by default through the ingestion loop

Implemented:

- `src/lib/importBatchState.ts`
- `src/lib/importBatchState.test.ts`

### L7 — Weekly Report Engine

Goal: create real weekly report generation from dated `MemoryRecord`s, not just a pattern panel label.

Acceptance:

- report uses an explicit date window
- emotions, decisions, outcomes, and projects are aggregated
- every aggregate and pattern insight cites supporting memory ids
- insufficient weekly evidence is explicit
- report output is renderable by the web surface later

Implemented:

- `src/lib/weeklyReport.ts`
- `src/lib/weeklyReport.test.ts`

### L8 — Weekly Report Product Surface

Goal: expose the weekly report as a first-class web product section/detail surface.

Acceptance:

- visible weekly report panel
- report date window, aggregate citations, pattern citation, and insufficient state render in the web surface
- screenshot evidence is captured locally

Implemented:

- `src/components/WeeklyReportPanel.tsx`
- `layout.weeklyReport`
- `artifacts/web-second-brain-product-surface/weekly-report-surface.png`

### L9 — Semantic Retrieval Contract

Goal: add a retrieval boundary that can later use embeddings/pgvector, while local tests use deterministic query matching.

Acceptance:

- query returns ranked memories
- retrieval is user-scoped
- Ask/Replay/Weekly Report can consume retrieved memories
- insufficient retrieval stays explicit

Implemented:

- `src/lib/memoryRetrieval.ts`
- `src/lib/memoryRetrieval.test.ts`

## 8. MVP Time Estimate

Assuming focused local development without major dependency or deployment blockers:

| Target | Remaining effort |
|---|---:|
| Local prototype with real weekly report engine and retrieval contract | completed locally |
| Usable one-person local MVP with import/capture/ask/replay/report | 1-2 weeks |
| Private beta with API, DB, LLM, export/delete, and basic auth | 6-10 weeks |
| Product-grade app + web + agent + backend | 4-6 months |

Critical path for "나를 아는 AI" feeling:

1. Citation-constrained LLM generation.
2. API endpoints.
3. PWA/app capture surface.
4. Private vault/auth.

## 9. Product Quality Rules

- The graph is evidence UI, not the product by itself.
- Every AI answer must cite memories or say insufficient evidence.
- Existing records/imports are P0 because they create the first "it knows me" moment.
- App and web remain separate product surfaces.
- Cloud storage must be framed as user-controlled, not default centralized ownership.
- Screenshots are required for frontend completion claims.
