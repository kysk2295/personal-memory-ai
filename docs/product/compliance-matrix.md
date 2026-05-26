# Personal Memory AI Product Compliance Matrix

This matrix prevents the RPI loop from drifting into only backend libraries or only a graph demo. The app must ship the previously planned product surfaces as well as the evidence pipeline.

Status vocabulary: `implemented`, `partial`, `skeleton`, `fake/sample`, `planned`, `blocked`.

## Non-negotiable product intent

- North star: **나보다 나를 더 잘 아는 개인 기억 AI**.
- Existing records are P0: Notion/Obsidian/Markdown imports must create the first “it knows me” moment.
- Graph role: evidence UI, not a decorative product by itself.
- AI advice must cite memories and expose graph evidence.
- User must be able to review RPI constraints and outputs between cycles.
- Frontend completion reports must include screenshots/images or visual evidence, not only text/test claims.
- When frontend work is reported to Ko Yunseo, include the actual image attachment/path (`MEDIA:/absolute/path/to.png`) so he can visually inspect it; do not only summarize that a screenshot exists.

## App vs Web distinction for this product

Ko Yunseo corrected the product split: `app` and `web` are separate surfaces with different jobs.

- `app` means the fast capture surface: the user quickly saves memories as diary entries in the moment. It should optimize for low-friction daily capture, mobile-first entry, timestamp/source metadata, optional emotion/decision hints, and conversion into `MemoryRecord` data.
- `web` means the second-brain surface: the user opens a richer workspace to see the accumulated memories as a brain-like graph, inspect patterns, ask questions, replay decisions, and review evidence.
- The app is not just a responsive version of the web graph. Its core job is quick diary/memory capture.
- The web is not just a marketing site. Its core job is second-brain visualization/analysis over memories captured/imported from app, Notion, Obsidian, Markdown, and other sources.
- First shippable implementation may simulate the app capture flow in the current web repo if native tooling is not present, but it must be explicitly labeled as `app capture contract/prototype`, not confused with the web second-brain workspace.
- A static landing page, disconnected dashboard, or graph-only demo is insufficient.

## Compliance Matrix

### 0. Persistent memory backend: PostgreSQL + pgvector

- Status: `planned for Railway staging`, `not required for local fixture-only prototype`
- Requirement: Previously planned Railway PostgreSQL/pgvector remains in scope for durable memory storage and vector retrieval.
- Must include at staging/backend phase:
  - durable `MemoryRecord` persistence
  - embeddings stored in pgvector with declared dimensions
  - semantic search over memories
  - graph evidence lookup from persisted citations
  - per-user isolation
  - export and hard-delete checks
  - migration status and pgvector extension smoke
- Must not include:
  - printing `DATABASE_URL`, DB password, Railway variables, or API keys
  - claiming production persistence while still using only local fixtures
- Completion evidence:
  - Railway Postgres env presence check with `present/missing` only
  - pgvector smoke: extension/vector type/insert/search/delete
  - API/web smoke showing captured/imported memory can be retrieved into the second-brain graph

### 1. Product surfaces: app capture + web second-brain

- Status: `planned`
- Requirement: Two-surface product split, not one generic web app.
- App/mobile capture surface must include:
  - fast diary/memory entry
  - timestamp/source metadata
  - optional emotion/decision/project hints
  - conversion into `MemoryRecord`
  - local/prototype/native status label
- Web second-brain surface must include:
  - graph workspace
  - Ask My Past Self input/output area
  - pattern panel
  - import preview surface
  - Decision Replay surface
  - evidence drawer
  - status labels for fake/sample/planned/blocked parts
- Completion evidence:
  - capture flow screenshot or prototype evidence
  - web second-brain local browser screenshot
  - build/test result

### 2. Existing-data import onboarding

- Status: `partial`
- Requirement: User can import existing memories from export files.
- Current implemented foundation:
  - `MemoryRecord`
  - Markdown/Obsidian importer
  - Notion Markdown/CSV importer
  - import batch/dedupe foundation
- App work still required:
  - import preview UI
  - source/date/duplicate/extraction status display
  - apply/undo flow
  - graph update after import
- Completion evidence:
  - screenshot of import preview
  - fixture showing imported records become graph/evidence data

### 3. Web first screen: daily diary second-brain graph / CareerHackerAlex-inspired frontend detail

- Status: `planned`
- Requirement: The web second-brain first screen should feel like the user's memory brain. Daily diary entries from the app/imports are the primary nodes, connected by recurring emotions, decisions, projects, outcomes, and sources.
- First-screen default state:
  - central memory-brain graph, not an empty dashboard
  - each daily journal/imported entry can appear as a memory node
  - nodes cluster by time, emotion, project, decision pattern, and outcome
  - visually resembles a connected brain / personal memory map
  - clicking a diary/memory node opens source/date/raw excerpt/summary in the evidence drawer
  - Ask My Past Self and pattern panels sit around the graph, but the graph remains the first impression
- Must include:
  - dark graph-first layout
  - diary/memory nodes as first-class nodes
  - emotion nodes
  - decision nodes
  - outcome nodes
  - project/source nodes
  - highlighted evidence paths
  - clear selected state
  - right-side evidence drawer
- Must not include:
  - pure decorative graph with no citations
  - unlabeled fake graph data
  - a first screen that hides the memory graph behind forms/cards only
- Completion evidence:
  - screenshot of initial loaded memory-brain graph
  - screenshot before/after evidence highlight

### 4. Pattern detector and pattern panel

- Status: `partial`
- Requirement: Detect repeated user patterns from `MemoryRecord[]` and show them in the app.
- Current implemented foundation:
  - deterministic `MemoryRecord[]` pattern detector for anxiety -> scope expansion -> launch delay
  - confidence, supporting memory ids, emotions, decisions, outcomes, and explanation
  - insufficient-evidence label when support is below threshold
- Must include:
  - pattern list/panel in UI
  - confidence/support count
  - click-to-highlight evidence graph
- Completion evidence:
  - tests
  - screenshot of pattern panel + highlighted graph

### 5. Ask My Past Self

- Status: `partial`
- Contract status: `implemented` in `src/lib/askMyPastSelf.ts`
- App surface status: `planned`
- Requirement: User asks current questions and receives memory-cited answers.
- Contract question:
  - `이번에도 기능을 더 넣어야 할까?`
- Must include:
  - evidence bullets
  - recommendation
  - citation memory ids
  - confidence
  - graphHighlightIds
  - insufficient-evidence fallback
- App work:
  - visible ask bar/input
  - answer card
  - citation list
  - click citation → evidence drawer/node
- Completion evidence:
  - screenshot of answer with citations and graph highlight

### 6. Decision Replay

- Status: `planned`
- Requirement: Compare a current decision with similar past decisions.
- Contract input:
  - `MVP에 기능을 더 넣을지, 지금 배포할지`
- Must include:
  - current decision
  - similar past decisions
  - emotions
  - past choices
  - outcomes
  - citations
  - repeated pattern
  - recommendation/uncertainty
  - graph highlights
- App work:
  - Decision Replay UI section/modal/panel
  - evidence drawer integration
- Completion evidence:
  - screenshot of Decision Replay result and graph highlights

### 7. Weekly Pattern Report / retention loop

- Status: `planned`
- Requirement: App should surface periodic/reviewable pattern insights, not only on-demand ask.
- Must include:
  - weekly pattern summary over records
  - repeated emotions/decisions/outcomes
  - evidence citations
  - action suggestion or uncertainty
- Completion evidence:
  - sample report output
  - UI screenshot or documented app surface

### 8. Capture / new memory entry

- Status: `planned`
- Requirement: App is not only import; user can add/capture new memories.
- Must include:
  - quick memory entry
  - date/source metadata
  - conversion to `MemoryRecord`
  - graph/evidence update
- Completion evidence:
  - screenshot of capture and resulting graph/evidence update

### 9. Privacy/export/delete guardrails

- Status: `planned`
- Requirement: Personal memory app must visibly respect user data boundaries.
- Must include at local foundation level:
  - private-by-default memory scope
  - import batch remove/undo
  - no secrets in logs
  - status labels for local-only/skeleton/blocked production parts
- Later production work:
  - auth
  - DB/user storage
  - delete/export UX
- Completion evidence:
  - tests for batch remove/undo
  - UI labels for local/skeleton states

### 10. Verification and visual evidence

- Status: `planned`
- Requirement: No “frontend done” report without visual proof.
- Must include:
  - typecheck/tests/build
  - local browser run
  - screenshots for import preview, ask answer, graph highlight, Decision Replay
  - Paperclip checkpoint with paths/results

## RPI execution rule

The next RPI cycles must not stop after backend-only foundation. The backlog must continue into app UI wiring and screenshot evidence. If a cycle implements only a library, its review must say which app surface will consume it next.
