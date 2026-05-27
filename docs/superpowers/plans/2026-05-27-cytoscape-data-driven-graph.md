# Cytoscape Data-Driven Graph Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development and benchmark-driven-frontend-iteration.

**Goal:** Replace the hard-coded graph illusion with a data-driven graph model rendered by a real graph library.

**Product sentence:** Personal Memory AI turns private diary/import `MemoryRecord`s into an inspectable second-brain graph where nodes and edges come from actual user data.

**Benchmark anchor:** `https://www.careerhackeralex.com/memory` uses a real graph workspace; Personal Memory AI must keep the graph-first surface while deriving graph content from memory data.

**Library:** Cytoscape.js, vendored into `dist/vendor/cytoscape.min.js` during build.

## Task 1: RED

- [x] Add tests for `buildMemoryGraphModel(records)` producing Cytoscape nodes/edges from actual `MemoryRecord` data.
- [x] Add render tests for Cytoscape graph markers and local vendor script.
- [x] Run focused tests and verify failure.

## Task 2: Graph Model

- [x] Create `src/lib/memoryGraphModel.ts`.
- [x] Generate memory, emotion, topic, project, decision, outcome, and source nodes.
- [x] Generate deterministic typed edges from memories to graph facets.
- [x] Return graph stats from actual elements, not benchmark constants.

## Task 3: Cytoscape Rendering

- [x] Copy Cytoscape bundle into `dist/vendor/` during static build.
- [x] Render a Cytoscape mount and JSON graph payload in the app shell.
- [x] Initialize Cytoscape in the existing browser script.
- [x] Keep existing SVG as fallback only.

## Task 4: Interaction Integration

- [x] Connect Cytoscape node tap to the inspector selection.
- [x] Connect search, filter, and selected-memory state to Cytoscape classes.
- [x] Update Playwright evidence to verify Cytoscape readiness and data-derived stats.

## Task 5: Full Verification + Commit

- [x] Run `npm run typecheck`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run `npm run evidence:playwright`.
- [x] Commit locally.
