# Personal Memory AI — Product Execution Plan

Status: active local execution plan  
Owner: Ko Yunseo  
Updated: 2026-05-27  
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

### Personal Memory Agent

Purpose: answer questions and reason through decisions using only cited user memories.

Required capabilities:

- load user-scoped memories
- detect repeated patterns
- answer with citations or insufficient evidence
- replay decisions against past outcomes
- return graph/evidence payload for UI highlighting
- never produce generic advice as if it were memory-grounded

### Durable Private Backend

Purpose: production storage and retrieval foundation.

Required capabilities:

- PostgreSQL memory persistence
- pgvector semantic retrieval
- per-user isolation
- export
- hard delete
- staging smoke without secret leakage

## 3. Execution Loop

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

## 4. Current Completed Local Loops

- L0: product reset around source of truth.
- L1: web second-brain product surface.
- L2: capture/import ingestion loop.
- L3: capture/import product surface.

## 5. Active Next Loops

### L4 — Personal Memory Agent Orchestrator

Goal: create a single domain service that loads one user's memories from `MemoryStore`, runs pattern detection, Ask My Past Self, Decision Replay, and graph evidence generation.

Acceptance:

- user-scoped memories only
- sufficient evidence returns cited ask/replay/evidence payloads
- insufficient evidence remains explicit
- no generic advice without citations

### L5 — Store-Backed App Shell Data

Goal: move the static web shell toward store-backed data assembly while keeping deterministic local fixtures.

Acceptance:

- app shell can be built from a `MemoryStore`
- fixture fallback remains deterministic
- UI still shows graph, Ask, Evidence, Decision, Pattern, Capture/Import

### L6 — Import Apply/Undo UI State Model

Goal: model the state transitions for applying and undoing import batches before adding real client interactivity.

Acceptance:

- apply creates graph-visible records
- undo removes only applied records
- duplicate rows are skipped by default
- tests cover state transitions

### L7 — Semantic Retrieval Contract

Goal: add a retrieval boundary that can later use embeddings/pgvector, while local tests use deterministic query matching.

Acceptance:

- query returns ranked memories
- retrieval is user-scoped
- Ask/Replay can consume retrieved memories
- insufficient retrieval stays explicit

### L8 — Privacy Export/Delete UX

Goal: expose user-facing local export/delete behavior beyond labels.

Acceptance:

- export returns user memory payload
- delete removes user data
- UI shows private/local/skeleton status honestly

### L9 — Staging Backend Readiness

Goal: verify PostgreSQL/pgvector staging without leaking secrets or mutating production data.

Acceptance:

- env presence report uses present/missing only
- pgvector smoke covers extension, insert, search, delete
- per-user isolation is demonstrated in staging-only smoke

## 6. Product Quality Rules

- The graph is evidence UI, not the product by itself.
- Every AI answer must cite memories or say insufficient evidence.
- Existing records/imports are P0 because they create the first "it knows me" moment.
- App and web remain separate product surfaces.
- Cloud storage must be framed as user-controlled, not default centralized ownership.
- Screenshots are required for frontend completion claims.
