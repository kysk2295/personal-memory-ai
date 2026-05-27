# Personal Memory AI — Product Execution Plan

Status: active local execution plan  
Owner: Ko Yunseo  
Updated: 2026-05-28, Cytoscape graph rebuild pass
Supersedes for local Codex work: `docs/product/product-master-plan-2026-05-26.md`

## 1. Product Definition

Personal Memory AI is a private memory system that turns diary entries, imported notes, and decisions into a personal second brain. The final product goal is an AI that can help with the user's worries and decisions because it can cite the user's past memories, patterns, and outcomes.

The product is not a public shared-memory network. "Sharing memory" means a new diary entry and relevant past memories are shown together inside one user's private context.

### Reference Architecture Assumptions

This plan treats LLM Wiki and Career Hacker Alex's Second Brain Architecture as product architecture references, not just visual references.

Architecture concepts to keep:

- canonical memory atoms/thoughts with stable claims, source citations, confidentiality, freshness, and meaning version
- immutable raw source archive before atomization
- reversible atomize/dedup/checkpoint/apply ingestion loop
- append-only typed edge ledger separate from frontmatter
- vector search and graph traversal kept as different retrieval axes
- multi-axis retrieval router: semantic, keyword, graph, and temporal signals
- citation/refusal gates before any answer reaches the user
- private corpus boundary by default, with explicit export/delete and no public sharing assumption

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
| Capture | Mobile/PWA capture UI | `done-foundation` | `/capture/` renders a mobile-first local/private quick diary capture surface. |
| Capture | Voice capture | `later` | In PRD direction, not MVP-critical. |
| Capture | Emotion/project/decision hints | `done-foundation` | Data contract exists; full UI still planned. |
| Import | Notion/Obsidian/Markdown preview | `done-foundation` | Preview/dedupe contract exists. |
| Import | Apply/undo import state model | `done-foundation` | Batch state model tracks preview, applied, skipped, graph evidence, and undone states. |
| Import | File upload/import UI | `prototype-ui` | Local Markdown/Text/JSON upload and paste surface can build preview candidates, call owner-scoped preview/apply APIs, and show applied memories in graph/timeline feedback without reload. |
| Memory Store | Fixture user isolation | `done-foundation` | Tests cover user-scoped records. |
| Memory Store | PostgreSQL repository | `done-foundation` | Runtime factory can select Postgres via `MEMORY_BACKEND_MODE=postgres` and `DATABASE_URL`; live credentials remain a deployment gate. |
| Memory Store | pgvector semantic search | `done-foundation` | Store method, migration, optional auto-migrate, and safe runtime health metadata exist; live staging execution remains gated on secrets/deploy target. |
| Knowledge Layer | LLM Wiki compiler | `done-foundation` | Local compiler turns `MemoryRecord`s into canonical memory atoms plus source/concept/decision/pattern nodes with citations, freshness, and retain/recall/reflect markers. |
| Knowledge Layer | Typed edge ledger | `done-foundation` | `memoryKnowledgeLedger` emits typed, confidence-weighted edges for citations, facets, sources, outcomes, and compiled patterns with stale-edge checks. |
| Knowledge Layer | Raw archive and checkpoint loop | `done-foundation` | Immutable raw diary/import archive entries, canonical thoughts, and an atomize/dedup/apply checkpoint exist as a deterministic local ledger. |
| Web | Graph-first second brain | `prototype-ui` | `MemoryRecord` data builds a Cytoscape graph with fixture memory nodes plus saved artifact memories; owner-scoped app shell rehydration can rebuild Cytoscape elements after imports persist. |
| Web | Evidence drawer | `prototype-ui` | Source/date/raw excerpt/why-connected visible. |
| Web | Individual memory detail page | `prototype-ui` | Selected-memory inspector and timeline detail surface expose source/date/raw excerpts; full review/edit route remains planned. |
| Web | Search/timeline views | `prototype-ui` | Sidebar search filters nodes and timeline entries show dated private memories, including saved Ask/Decision/Weekly artifacts, with active selection sync. |
| Web | Memory search/detail inspector | `prototype-ui` | Search input dims unmatched nodes, result click selects inspector detail and citation chip. |
| Ask | Ask My Past Self deterministic contract | `done-foundation` | Citation/insufficient evidence tested. |
| Ask | LLM answer generation | `done-foundation` | Provider adapter routes outputs through the citation guard; live provider config/secrets still planned. |
| Ask | Saved advice artifacts | `prototype-ui` | Ask answers can become private saved artifacts and future `MemoryRecord`s; Save answer feeds the graph/timeline display model and posts artifact payloads through `/api/capture` when served over HTTP. |
| Ask | Follow-up conversation | `planned` | Requires session/report memory. |
| Decision | Decision Replay deterministic contract | `done-foundation` | Past outcome citations tested. |
| Decision | Decision result save-back | `prototype-ui` | Decision replay results can become private saved artifacts and future decision memories; Save replay feeds the graph/timeline display model and posts artifact payloads through `/api/capture` when served over HTTP. |
| Reports | Weekly Pattern Report foundation | `done-foundation` | Weekly report panel and pattern citation panel are visible in the web surface. |
| Reports | Weekly report engine | `done-foundation` | Date-window report generation aggregates emotions, decisions, outcomes, projects, and pattern citations. |
| Reports | Saved weekly/monthly reports | `prototype-ui` | Weekly reports can become saved artifacts and future pattern memories; Save report feeds the graph/timeline display model and posts artifact payloads through `/api/capture` when served over HTTP. |
| Reports | Scheduler/reminders | `done-foundation` | Deterministic weekly schedule evaluation returns due windows, duplicate suppression, and in-app notification payloads through the private-vault API. |
| Agent | Personal Memory Agent orchestrator | `done-foundation` | Loads user-scoped retrieved memories and returns ask/replay/graph evidence with retrieval metadata. |
| Agent | Semantic retrieval/reranking | `done-foundation` | Deterministic retrieval contract ranks user-scoped memories; pgvector path remains a backend task. |
| Agent | Multi-axis retrieval router | `done-foundation` | Deterministic router fuses keyword, semantic, knowledge-ledger graph traversal, temporal freshness, and user feedback corrections; legacy retrieval delegates to it. |
| Agent | Korean/user-intent retrieval bridge | `done-foundation` | Korean product-intent questions expand into retrieval terms before the agent filters memory context. |
| Agent | Citation-constrained generation guard | `done-foundation` | LLM-shaped outputs are rejected unless grounded in supplied citation ids. |
| Agent | LLM provider adapter | `done-foundation` | Provider-agnostic adapter wraps model outputs in the citation guard before advice can surface. Gemini REST provider can now call `generateContent` through the L30 smoke harness when `GEMINI_API_KEY` + `PMI_LLM_MODEL` are present. |
| Agent | User feedback learning loop | `prototype-ui` | User corrections can become private `mem_api_feedback_*` memories through `/api/feedback`; the web rail now exposes a visible correction panel that submits feedback when served over HTTP. |
| Privacy | Private-by-default scope | `done-foundation` | Data model and UI labels exist. |
| Privacy | Export/delete local UX | `done-foundation` | Owner-only local export, selected delete, and hard-delete confirmation panel are rendered. |
| Privacy | Auth/private vault boundary | `done-foundation` | Local session owner boundary scopes API calls to one private vault. |
| Privacy | Production auth provider | `done-foundation` | Runtime can select local or trusted-header private vault auth and resolve owner-only sessions per request; OAuth/hosted identity remains a deployment integration task. |
| Backend/API | Capture/import endpoints | `done-foundation` | User-scoped API dispatcher handles fast diary capture, saved artifact capture, import preview, and import apply. |
| Backend/API | Ask/replay/report endpoints | `done-foundation` | User-scoped API dispatcher handles ask, replay, weekly report, feedback memory, export, and delete boundaries. |
| Backend/API | Local HTTP transport | `done-foundation` | `npm start` serves static UI and private-vault `/api/*` JSON routes locally, with optional trusted-header auth for deployed owner scoping. |
| Backend/API | Runtime backend selection | `done-foundation` | `server.ts` now uses the memory runtime to select fixture/Postgres, seed fixture data only in fixture mode, and expose safe health metadata. |
| Backend/API | Staging readiness | `done-foundation` | Redacted env presence and pgvector staging smoke plan exist without secret leakage. |
| Release | Visual evidence gates | `done-foundation` | Playwright verifies Cytoscape readiness, data-derived graph stats, search/filter/selection interactions, and captures benchmark/local screenshots; staging review still planned. |
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
- L10: citation-constrained generation guard.
- L11: personal memory API boundary.
- L12: privacy export/delete UX.
- L13: PWA/app capture surface.
- L14: staging backend readiness.
- L15: auth/private vault boundary.
- L16: local HTTP API transport.
- L17: citation-guarded LLM provider adapter.
- L18: benchmark graph density and Playwright interaction verification.
- L19: memory search and detail interaction verification.
- L20: data-driven Cytoscape memory graph renderer.
- L21: Postgres/pgvector runtime backend selection.
- L22: canonical memory knowledge ledger.
- L23: multi-axis memory retrieval router.
- L24: saved advice/report memory artifacts.
- L25: memory detail timeline surface.
- L26: agent retrieval query bridge.
- L27: saved artifact UI actions.
- L28: saved artifacts in graph/timeline.
- L29: saved artifact persistence through capture API.
- L30: Gemini-first LLM provider smoke harness.
- L31: user feedback/correction memory.
- L32: feedback correction UI.
- L33: feedback retrieval priority.
- L34: Gemini provider adapter.
- L35: private vault auth provider runtime.
- L36: weekly report schedule evaluation.
- L37: local file upload/import UI.
- L38: applied import graph/timeline feedback.
- L39: app shell rehydration API.
- L40: Cytoscape graph rebuild after import.

## 6. Active Next Loops

Next local loop: add durable import undo through API/HTTP so uploaded memories can be rolled back from the private graph, or run staging PostgreSQL/pgvector/auth smoke harness when deployment secrets are available. Live LLM keys, hosted identity configuration, and deployment wiring stay gated until secrets/deploy target are explicitly available.

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

### L10 — Citation-Constrained Generation Guard

Goal: add the LLM boundary for Ask/Replay/Report while forcing citation grounding before any provider integration.

Acceptance:

- prompt payload contains only supplied cited memory evidence
- output schema requires answer and citation ids
- missing, unknown, or text-unreferenced citations cause fallback to insufficient evidence
- generic uncited output is rejected

Implemented:

- `src/lib/citationConstrainedGeneration.ts`
- `src/lib/citationConstrainedGeneration.test.ts`

### L11 — Personal Memory API Boundary

Goal: expose capture, import, ask, replay, report, export, and delete through user-scoped API boundaries.

Acceptance:

- no secrets are logged or returned
- user id boundary is explicit
- capture/import/ask/replay/report/export/delete call existing domain services
- tests cover user-scoped success paths and cross-user non-leakage

Implemented:

- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`

### L12 — Privacy Export/Delete UX

Goal: expose user-facing local export/delete behavior beyond labels.

Acceptance:

- export returns user memory payload
- delete removes user data
- UI shows private/local/auth status honestly
- tests cover selected delete and hard-delete guardrails

Implemented:

- `src/lib/privacyControls.ts`
- `src/lib/privacyControls.test.ts`
- `src/components/PrivacyControlPanel.tsx`
- `layout.privacyControls`
- `artifacts/web-second-brain-product-surface/privacy-export-delete-surface.png`

### L13 — PWA/App Capture Surface

Goal: make capture usable from mobile without requiring the full web graph.

Acceptance:

- mobile-first capture screen
- quick save action points to `/api/capture`
- local/private status is visible
- saved capture preview includes the generated MemoryRecord id and target graph node

Implemented:

- `src/lib/appCaptureSurface.ts`
- `src/lib/appCaptureSurface.test.ts`
- `src/AppCapture.tsx`
- `/capture/` static route
- `dist/manifest.webmanifest` generation
- `artifacts/web-second-brain-product-surface/pwa-app-capture-surface.png`

### L14 — Staging Backend Readiness

Goal: verify PostgreSQL/pgvector staging without leaking secrets or mutating production data.

Acceptance:

- env presence report uses present/missing only
- pgvector smoke covers extension, insert, search, delete
- per-user isolation is demonstrated in staging-only smoke

Implemented:

- `src/lib/stagingReadiness.ts`
- `src/lib/stagingReadiness.test.ts`
- redacted env presence report contract
- staging-only pgvector smoke plan

### L15 — Auth / Private Vault

Goal: ensure each user's second brain is accessible only to that user.

Acceptance:

- authenticated user identity boundary
- private vault/user id mapping
- no cross-user memory access
- export/delete scoped to one user

Implemented:

- `src/lib/privateVault.ts`
- `src/lib/privateVault.test.ts`
- `handlePrivateVaultMemoryApiRequest`
- private vault API test proving caller-supplied user ids do not override session owner

### L16 — Local HTTP API Transport

Goal: expose the private-vault API boundary through the local server.

Acceptance:

- `POST /api/capture` accepts JSON and creates private local-user memory
- `GET /api/export` returns only the session owner's records
- invalid JSON returns a safe JSON error
- `npm start` serves both static pages and API routes

Implemented:

- `src/lib/localHttpTransport.ts`
- `src/lib/localHttpTransport.test.ts`
- `server.ts`
- `npm start` uses `tsx server.ts`

### L17 — LLM Provider Adapter

Goal: make provider-backed generation possible without letting uncited generic model output become personal advice.

Acceptance:

- provider prompts receive only supplied memory evidence
- grounded provider output passes through with provider/model metadata
- generic uncited provider output is rejected as insufficient evidence
- no external API or secret is required for the local foundation

Implemented:

- `src/lib/llmProviderAdapter.ts`
- `src/lib/llmProviderAdapter.test.ts`

### L18 — Benchmark Graph Density and Interactions

Goal: move the web first screen from a static graph-like surface toward a real second-brain workspace benchmarked against `https://www.careerhackeralex.com/memory`.

Acceptance:

- graph scale reads as 225 nodes / 1010 edges
- deterministic SVG graph renders 225 ambient nodes and 1010 ambient edges
- spacing, label visibility, semantic filter, memory node selection, and rearrange controls mutate DOM state
- Playwright captures benchmark, local graph density, and local interaction screenshots

Implemented:

- `src/components/MemoryGraph.tsx`
- `src/App.tsx`
- `scripts/verify-playwright-evidence.ts`
- `npm run evidence:playwright`
- `artifacts/web-second-brain-product-surface/benchmark-careerhacker-memory-playwright.png`
- `artifacts/web-second-brain-product-surface/local-graph-density-playwright.png`
- `artifacts/web-second-brain-product-surface/local-graph-interactions-playwright.png`

### L19 — Memory Search and Detail Interaction

Goal: make the graph workspace searchable and inspectable so it behaves like a second brain, not a static graph image.

Acceptance:

- sidebar search filters memory nodes by query
- unmatched memory nodes are visually dimmed
- result count updates from all memories to matching memories
- clicking a search result selects the corresponding memory inspector detail and citation chip
- Playwright verifies the search/detail flow and captures screenshot evidence

Implemented:

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/components/EvidenceDrawer.tsx`
- `scripts/verify-playwright-evidence.ts`
- `artifacts/web-second-brain-product-surface/local-memory-search-detail-playwright.png`

### L20 — Data-Driven Cytoscape Memory Graph

Goal: make the graph library render actual private memory data instead of a decorative benchmark-density SVG layer.

Acceptance:

- every `MemoryRecord` becomes a memory node
- emotion, topic, project, decision, outcome, and source facets become connected graph nodes
- graph stats come from real generated elements
- Cytoscape is vendored locally and becomes the active renderer after load
- search, filters, label hiding, node selection, and inspector focus update Cytoscape state
- fallback SVG remains only as a no-library fallback and is hidden once Cytoscape is ready

Implemented:

- `src/lib/memoryGraphModel.ts`
- `src/lib/memoryGraphModel.test.ts`
- Cytoscape render mount and graph payload in `src/App.tsx`
- Cytoscape vendor copy in `scripts/render-static.ts`
- Playwright Cytoscape assertions in `scripts/verify-playwright-evidence.ts`
- updated graph screenshots under `artifacts/web-second-brain-product-surface/`

### L21 — Postgres / Pgvector Runtime Backend Selection

Goal: make the local HTTP server choose fixture or PostgreSQL/pgvector storage at runtime without leaking secrets.

Acceptance:

- fixture mode remains the default local mode
- fixture mode seeds local demo memories for the private local owner
- Postgres mode requires `DATABASE_URL`
- Postgres mode creates a `pg` pool and wraps it in `PostgresMemoryStore`
- pgvector migration SQL can run when `POSTGRES_AUTO_MIGRATE=true`
- `/health/live` exposes only safe backend metadata: backend mode, migration status, and database URL presence
- server shutdown closes the Postgres pool

Implemented:

- `src/lib/memoryStoreRuntime.ts`
- `src/lib/memoryStoreRuntime.test.ts`
- `src/lib/localServerHealth.ts`
- `src/lib/localServerHealth.test.ts`
- `server.ts`
- `pg` runtime dependency and `@types/pg` development dependency

### L22 — Canonical Memory Knowledge Ledger

Goal: promote compiled memory atoms into a private, deterministic knowledge ledger that can back graph traversal and multi-axis retrieval.

Acceptance:

- immutable raw archive entries preserve diary/import text and source refs
- canonical thoughts keep stable atom ids, claims, citations, freshness, confidentiality, and meaning version
- typed edges cover raw citations, topics, emotions, projects, decisions, outcomes, sources, and architecture-level patterns
- stale edge status follows the freshness of supporting memory atoms
- checkpoint summarizes atomize/dedup/apply readiness without mutating source records

Implemented:

- `src/lib/memoryKnowledgeLedger.ts`
- `src/lib/memoryKnowledgeLedger.test.ts`
- `docs/superpowers/plans/2026-05-27-knowledge-ledger.md`

### L23 — Multi-Axis Memory Retrieval Router

Goal: fuse semantic, keyword, graph traversal, and temporal signals before memories are handed to advice/report workflows.

Acceptance:

- retrieval is deterministic regardless of input record order
- each result exposes per-axis scores, matched terms, explanations, and supporting ledger edge ids
- graph traversal can pull in memories linked through shared typed ledger targets even when query text does not directly match them
- store-backed retrieval remains user-scoped and refuses unrelated queries with explicit insufficient evidence
- the existing `memoryRetrieval` contract remains stable for Ask, Decision Replay, and Weekly Report callers

Implemented:

- `src/lib/multiAxisMemoryRetrieval.ts`
- `src/lib/multiAxisMemoryRetrieval.test.ts`
- `src/lib/memoryRetrieval.ts`
- `docs/superpowers/plans/2026-05-27-multi-axis-retrieval.md`

### L24 — Saved Advice and Report Memory Artifacts

Goal: let useful AI answers, decision replays, and weekly reports become private saved artifacts that can later be recalled as future memories.

Acceptance:

- Ask artifacts preserve question, answer, recommendation, evidence label, confidence, citations, and graph highlights
- Decision replay artifacts preserve the current decision, recommendation, uncertainty, choices, outcomes, and citations
- Weekly report artifacts preserve window, included memories, pattern titles, aggregate summaries, and report metadata
- artifacts convert into private `MemoryRecord`s with `personal-memory-ai://saved-artifacts/...` source refs
- saving through `MemoryStore` remains user-scoped

Implemented:

- `src/lib/savedMemoryArtifact.ts`
- `src/lib/savedMemoryArtifact.test.ts`
- `docs/superpowers/plans/2026-05-27-saved-memory-artifacts.md`

### L25 — Memory Detail Timeline Surface

Goal: make private memories inspectable as dated source-backed timeline entries synchronized with graph/search selection.

Acceptance:

- timeline model sorts memories newest-first and keeps source/date/privacy/raw excerpt metadata
- related memories are derived from shared emotions, topics, projects, decisions, and sources
- app shell exposes `memoryTimeline` and renders five data-derived timeline entries
- graph/search selection updates the active timeline item
- Playwright verifies timeline count and search-to-timeline selection

Implemented:

- `src/lib/memoryDetailTimeline.ts`
- `src/lib/memoryDetailTimeline.test.ts`
- `src/components/MemoryDetailTimelinePanel.tsx`
- `src/lib/appShellEvidenceLayout.ts`
- `src/App.tsx`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-27-memory-detail-timeline.md`

### L26 — Agent Retrieval Query Bridge

Goal: make the personal memory agent use multi-axis retrieval even when the user asks in Korean or product-intent language that does not directly match stored memory text.

Acceptance:

- Korean feature-addition questions expand into retrieval terms such as feature addition, scope expansion, launch, anxiety, delay, and freeze
- current decision prompt, emotions, choices, and topic tags are included in the retrieval query
- the agent filters same-user memories through multi-axis retrieval before pattern detection, Ask, Replay, and graph evidence
- unrelated same-user memories are not loaded into the agent context
- insufficient retrieval remains explicit and prevents generic advice

Implemented:

- `src/lib/memoryQueryBridge.ts`
- `src/lib/memoryQueryBridge.test.ts`
- `src/lib/personalMemoryAgent.ts`
- `src/lib/personalMemoryAgent.test.ts`
- `docs/superpowers/plans/2026-05-27-agent-retrieval-query-bridge.md`

### L27 — Saved Artifact UI Actions

Goal: expose save actions for cited Ask, Decision Replay, and Weekly Report artifacts in the web second-brain surface.

Acceptance:

- Ask, Decision Replay, and Weekly Report each expose a deterministic save action
- each save action points to a private saved artifact and future `MemoryRecord` source ref
- the local UI can mark an artifact as saved without requiring a live backend write
- Playwright verifies the Ask save action state transition

Implemented:

- `src/lib/savedArtifactActions.ts`
- `src/lib/savedArtifactActions.test.ts`
- `src/components/SavedArtifactActionButton.tsx`
- `src/components/AskMyPastSelfPanel.tsx`
- `src/components/DecisionReplayPanel.tsx`
- `src/components/WeeklyReportPanel.tsx`
- `src/App.tsx`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-saved-artifact-ui-actions.md`

### L28 — Saved Artifacts in Graph/Timeline

Goal: make saved Ask, Decision Replay, and Weekly Report outputs appear as private future memories in the second-brain graph and timeline.

Acceptance:

- app shell keeps Ask/Replay/Weekly reasoning grounded in original diary/import memories to avoid circular self-citation
- saved artifact actions are converted into `MemoryRecord`s for display
- graph, primary nodes, compiled wiki, privacy controls, and memory timeline use the augmented 8-memory display model
- Cytoscape and Playwright evidence verify 8 memory nodes, 44 graph nodes, 56 edges, and 8 timeline entries

Implemented:

- `src/lib/appShellEvidenceLayout.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-saved-artifacts-in-graph-timeline.md`

### L29 — Saved Artifact Persistence Through Capture API

Goal: persist saved Ask, Decision Replay, and Weekly Report artifacts through the local private backend path as user-scoped memories.

Acceptance:

- `/api/capture` accepts either fast diary capture input or `{ artifact }` saved artifact payloads
- saved artifacts are stored via `saveArtifactAsMemoryRecord`
- local HTTP transport keeps saved artifacts inside the private vault session owner
- web save buttons include a saved artifact manifest and POST to `/api/capture` when served over HTTP
- static file previews retain the local saved state without requiring a server

Implemented:

- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-saved-artifact-persistence.md`

### L30 — Gemini-First LLM Provider Smoke Harness

Goal: make live model wiring verifiable without leaking keys or letting uncited output become personal advice.

Acceptance:

- missing `GEMINI_API_KEY` and `PMI_LLM_MODEL` reports blocked readiness and skipped smoke
- present Gemini env reports ready readiness while redacting secret values
- smoke runner calls the existing citation-guarded provider adapter only when config is ready and a provider is attached
- uncited provider output is still rejected as insufficient evidence
- Postgres runtime remains separate and unchanged; it continues to use `MEMORY_BACKEND_MODE=postgres` and `DATABASE_URL`

Implemented:

- `src/lib/llmProviderRuntime.ts`
- `src/lib/llmProviderRuntime.test.ts`
- `docs/superpowers/plans/2026-05-28-llm-provider-smoke-harness.md`

### L31 — User Feedback/Correction Memory

Goal: let user corrections become private memories so the agent can learn from mistakes and preference edits.

Acceptance:

- correction text becomes a private `MemoryRecord`
- feedback ids use `mem_api_feedback_*`
- source refs use `personal-memory-ai://feedback/...`
- target memory ids and artifact ids are preserved in raw text
- `/api/feedback` persists feedback memories inside the request user's private scope

Implemented:

- `src/lib/userFeedbackMemory.ts`
- `src/lib/userFeedbackMemory.test.ts`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `docs/superpowers/plans/2026-05-28-user-feedback-memory.md`

### L32 — Feedback Correction UI

Goal: make the agent learning loop visible by letting the user submit corrections from the web second-brain rail.

Acceptance:

- web shell renders a correction feedback panel
- panel targets `/api/feedback`
- panel carries target memory/artifact metadata
- static preview can mark feedback submitted locally
- HTTP-served app posts correction payloads to the feedback API
- Playwright verifies the feedback interaction state

Implemented:

- `src/components/UserFeedbackPanel.tsx`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-feedback-correction-ui.md`

### L33 — Feedback Retrieval Priority

Goal: make saved user correction memories influence future retrieval ranking.

Acceptance:

- multi-axis retrieval includes a `feedback` score axis
- feedback/correction memories are detected from source refs and tags
- matching correction memories can rank ahead of ordinary memories
- retrieval reasons explain feedback correction matches
- existing memory retrieval and personal agent tests remain green

Implemented:

- `src/lib/multiAxisMemoryRetrieval.ts`
- `src/lib/multiAxisMemoryRetrieval.test.ts`
- `docs/superpowers/plans/2026-05-28-feedback-retrieval-priority.md`

### L34 — Gemini Provider Adapter

Goal: attach a real Gemini REST provider implementation behind the existing citation-guarded LLM adapter.

Acceptance:

- provider sends Gemini `generateContent` requests with `x-goog-api-key`
- request includes citation instructions, allowed citation ids, and evidence text
- response parser reads JSON from `candidates[].content.parts[].text`
- fenced JSON is supported
- API key values are not returned in provider output
- runtime config can create a Gemini provider only when ready

Implemented:

- `src/lib/geminiProvider.ts`
- `src/lib/geminiProvider.test.ts`
- `src/lib/llmProviderRuntime.ts`
- `src/lib/llmProviderRuntime.test.ts`
- `docs/superpowers/plans/2026-05-28-gemini-provider-adapter.md`

### L35 — Private Vault Auth Provider Runtime

Goal: add production-auth scaffolding for private vault ownership without changing the local-only default.

Acceptance:

- default auth runtime keeps local owner-only private vault behavior
- trusted-header auth runtime resolves a per-request owner from configured headers
- missing trusted owner headers return `auth_required`
- runtime health metadata reports provider readiness without exposing request values or secrets
- local HTTP transport can use either a fixed session or auth runtime

Implemented:

- `src/lib/authProviderRuntime.ts`
- `src/lib/authProviderRuntime.test.ts`
- `src/lib/privateVault.ts`
- `src/lib/privateVault.test.ts`
- `src/lib/localHttpTransport.ts`
- `src/lib/localHttpTransport.test.ts`
- `server.ts`
- `docs/superpowers/plans/2026-05-28-auth-provider-runtime.md`

### L36 — Weekly Report Schedule Evaluation

Goal: add a local recurring weekly report schedule contract that can later be driven by cron, push, email, or app notifications.

Acceptance:

- default owner schedule runs Monday 09:00 in Asia/Seoul
- due evaluation returns the previous Monday-Sunday report window
- already-generated report ids suppress duplicate due runs
- private-vault API evaluates schedules with owner-scoped memories only
- due responses include an in-app notification payload

Implemented:

- `src/lib/weeklyReportSchedule.ts`
- `src/lib/weeklyReportSchedule.test.ts`
- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `docs/superpowers/plans/2026-05-28-weekly-report-schedule.md`

### L37 — Local File Upload / Import UI

Goal: add a real local file/text import entry point that turns Markdown, JSON, and Obsidian-style exports into private import preview candidates.

Acceptance:

- Markdown/Text files and pasted text become local import candidates
- JSON object/array exports can preserve source metadata when present
- empty files are blocked without creating candidates
- web shell exposes owner-only upload, preview, and apply controls
- preview/apply calls use existing private-vault import APIs when served over HTTP
- Playwright verifies preview and apply interaction states

Implemented:

- `src/lib/importUploadDraft.ts`
- `src/lib/importUploadDraft.test.ts`
- `src/components/PatternPanel.tsx`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-import-upload-ui.md`

### L38 — Applied Import Graph / Timeline Feedback

Goal: show newly applied import memories immediately in the second-brain surface after `/api/import/apply`.

Acceptance:

- import panel exposes an applied-memory feedback target
- apply responses render created memory ids and graph evidence summaries
- applied imports append visible timeline rows without a full reload
- shell state records created memory ids and graph refresh pending status
- Playwright verifies applied feedback and timeline append

Implemented:

- `src/components/PatternPanel.tsx`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-import-apply-feedback.md`

### L39 — App Shell Rehydration API

Goal: add an owner-scoped app shell rehydration path so the web second brain can reload graph/timeline data after imports persist.

Acceptance:

- `GET /api/app-shell` returns app shell data rebuilt from the private owner store
- HTTP auth keeps rehydration owner-scoped
- another user's memories do not leak into app shell payloads
- browser calls app shell rehydration after import apply
- shell exposes rehydrated memory, graph, and timeline counts for graph rebuild

Implemented:

- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-app-shell-rehydration.md`

### L40 — Cytoscape Graph Rebuild After Import

Goal: rebuild the live Cytoscape graph from owner-scoped app shell rehydration data after imports persist.

Acceptance:

- `/api/app-shell` returns a data-derived Cytoscape `memoryGraph`
- memoryGraph is owner-scoped and built from current private memories
- browser replaces Cytoscape elements after import apply rehydration
- graph count markers update to the rehydrated graph stats
- Playwright verifies graph rebuild includes newly imported memories

Implemented:

- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/superpowers/plans/2026-05-28-cytoscape-rebuild-after-import.md`

## 8. MVP Time Estimate

Assuming focused local development without major dependency or deployment blockers:

| Target | Remaining effort |
|---|---:|
| Local prototype with real weekly report engine and retrieval contract | completed locally |
| Usable one-person local MVP with import/capture/ask/replay/report | 1-2 weeks |
| Private beta with API, DB, LLM, export/delete, and basic auth | 6-10 weeks |
| Product-grade app + web + agent + backend | 4-6 months |

Critical path for the next "나를 아는 AI" jump:

1. Add durable import undo through API/HTTP so uploaded memories can be rolled back from the private graph.
2. Run staging PostgreSQL/pgvector/auth smoke against the already wired Postgres/auth runtimes when deployment secrets are available.
3. Connect hosted identity/OAuth on the deployment target.

## 9. Product Quality Rules

- The graph is evidence UI, not the product by itself.
- Every AI answer must cite memories or say insufficient evidence.
- Existing records/imports are P0 because they create the first "it knows me" moment.
- App and web remain separate product surfaces.
- Cloud storage must be framed as user-controlled, not default centralized ownership.
- Screenshots are required for frontend completion claims.
