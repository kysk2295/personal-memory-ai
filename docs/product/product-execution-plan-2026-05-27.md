# Personal Memory AI — Product Execution Plan

Status: active local execution plan  
Owner: Ko Yunseo  
Updated: 2026-05-27, Cytoscape data-driven graph pass
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
| Capture | Mobile/PWA capture UI | `done-foundation` | `/capture/` renders a mobile-first local/private quick diary capture surface. |
| Capture | Voice capture | `later` | In PRD direction, not MVP-critical. |
| Capture | Emotion/project/decision hints | `done-foundation` | Data contract exists; full UI still planned. |
| Import | Notion/Obsidian/Markdown preview | `done-foundation` | Preview/dedupe contract exists. |
| Import | Apply/undo import state model | `done-foundation` | Batch state model tracks preview, applied, skipped, graph evidence, and undone states. |
| Import | File upload/import UI | `planned` | Needed before real personal use. |
| Memory Store | Fixture user isolation | `done-foundation` | Tests cover user-scoped records. |
| Memory Store | PostgreSQL repository | `done-foundation` | Code exists; staging smoke still planned. |
| Memory Store | pgvector semantic search | `done-foundation` | Store method plus redacted staging smoke contract exist; live staging execution remains gated on secrets/deploy target. |
| Web | Graph-first second brain | `prototype-ui` | `MemoryRecord` data now builds a Cytoscape graph with 5 memory nodes, 34 total graph nodes, and 40 data-derived edges; fallback SVG is hidden after the graph library is ready. |
| Web | Evidence drawer | `prototype-ui` | Source/date/raw excerpt/why-connected visible. |
| Web | Individual memory detail page | `planned` | Selected-memory detail inspector exists; full review/edit page remains planned. |
| Web | Search/timeline views | `prototype-ui` | Sidebar memory search filters nodes and selects matching detail; timeline still planned. |
| Web | Memory search/detail inspector | `prototype-ui` | Search input dims unmatched nodes, result click selects inspector detail and citation chip. |
| Ask | Ask My Past Self deterministic contract | `done-foundation` | Citation/insufficient evidence tested. |
| Ask | LLM answer generation | `done-foundation` | Provider adapter routes outputs through the citation guard; live provider config/secrets still planned. |
| Ask | Follow-up conversation | `planned` | Requires session/report memory. |
| Decision | Decision Replay deterministic contract | `done-foundation` | Past outcome citations tested. |
| Decision | Decision result save-back | `planned` | Current decisions should become future memories. |
| Reports | Weekly Pattern Report foundation | `done-foundation` | Weekly report panel and pattern citation panel are visible in the web surface. |
| Reports | Weekly report engine | `done-foundation` | Date-window report generation aggregates emotions, decisions, outcomes, projects, and pattern citations. |
| Reports | Saved weekly/monthly reports | `planned` | Needs storage and report detail UI. |
| Reports | Scheduler/reminders | `planned` | After report engine and app/PWA capture. |
| Agent | Personal Memory Agent orchestrator | `done-foundation` | Loads store records and returns ask/replay/graph evidence. |
| Agent | Semantic retrieval/reranking | `done-foundation` | Deterministic retrieval contract ranks user-scoped memories; pgvector path remains a backend task. |
| Agent | Citation-constrained generation guard | `done-foundation` | LLM-shaped outputs are rejected unless grounded in supplied citation ids. |
| Agent | LLM provider adapter | `done-foundation` | Provider-agnostic adapter wraps model outputs in the citation guard before advice can surface. |
| Agent | User feedback learning loop | `planned` | Needed for agent personalization. |
| Privacy | Private-by-default scope | `done-foundation` | Data model and UI labels exist. |
| Privacy | Export/delete local UX | `done-foundation` | Owner-only local export, selected delete, and hard-delete confirmation panel are rendered. |
| Privacy | Auth/private vault boundary | `done-foundation` | Local session owner boundary scopes API calls to one private vault. |
| Privacy | Production auth provider | `planned` | Required before multi-user beta. |
| Backend/API | Capture/import endpoints | `done-foundation` | User-scoped API dispatcher handles capture, import preview, and import apply. |
| Backend/API | Ask/replay/report endpoints | `done-foundation` | User-scoped API dispatcher handles ask, replay, weekly report, export, and delete boundaries. |
| Backend/API | Local HTTP transport | `done-foundation` | `npm start` serves static UI and private-vault `/api/*` JSON routes locally. |
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

## 6. Active Next Loops

Next local loop: timeline/detail review pages or saved advice/report artifacts. Production auth, live LLM keys, and deployment wiring stay gated until secrets/deploy target are explicitly available.

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

## 8. MVP Time Estimate

Assuming focused local development without major dependency or deployment blockers:

| Target | Remaining effort |
|---|---:|
| Local prototype with real weekly report engine and retrieval contract | completed locally |
| Usable one-person local MVP with import/capture/ask/replay/report | 1-2 weeks |
| Private beta with API, DB, LLM, export/delete, and basic auth | 6-10 weeks |
| Product-grade app + web + agent + backend | 4-6 months |

Critical path for the next "나를 아는 AI" jump:

1. Persist saved advice/report artifacts so useful answers become future memory.
2. Add memory detail/search views so the second brain is inspectable like a real vault.
3. Wire a live LLM provider through the citation-guarded adapter when secrets/config are available.
4. Run staging PostgreSQL/pgvector/auth smoke against a chosen deployment target.

## 9. Product Quality Rules

- The graph is evidence UI, not the product by itself.
- Every AI answer must cite memories or say insufficient evidence.
- Existing records/imports are P0 because they create the first "it knows me" moment.
- App and web remain separate product surfaces.
- Cloud storage must be framed as user-controlled, not default centralized ownership.
- Screenshots are required for frontend completion claims.
