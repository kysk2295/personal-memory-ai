# Benchmark Graph Density + Playwright Verification Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for the implementation loop and benchmark-driven-frontend-iteration for the visual comparison.

**Goal:** Make the web second-brain first screen read closer to the CareerHacker Alex `/memory` benchmark by increasing visible graph scale, wiring graph controls, and adding repeatable Playwright screenshot verification.

**Product sentence:** Personal Memory AI is a private diary/import second brain where the graph is the evidence interface for cited personal reasoning.

**Benchmark:** `https://www.careerhackeralex.com/memory`

**Visible gaps from current screenshot:**

- Benchmark shows `225` nodes and `1010` edges; local sidebar currently reads like a toy graph with `5` memory nodes and `25` edges.
- Benchmark canvas is densely populated across the viewport; local graph has too much empty center-left space.
- Benchmark verification needs to be repeatable through Playwright, not ad-hoc Chrome CLI screenshots.
- Current controls must mutate the graph workspace, not only exist as static buttons.

**Slice:** Graph density/stat parity plus Playwright-verified graph interactions.

**Must remain unchanged:**

- Private memory/diary product semantics.
- Ask My Past Self citation behavior.
- Evidence drawer/report content.
- No live secrets, deploys, or remote push.

**Screenshot evidence proving success:**

- `artifacts/web-second-brain-product-surface/benchmark-careerhacker-memory-playwright.png`
- `artifacts/web-second-brain-product-surface/local-graph-density-playwright.png`
- `artifacts/web-second-brain-product-surface/local-graph-interactions-playwright.png`

## Task 1: Red Test

- [x] Add expectations that the rendered graph exposes `225` visible nodes, `1010` graph edges, benchmark parity data markers, and interaction state markers.
- [x] Run the focused test and verify failure.

## Task 2: Implement Density + Stats

- [x] Increase deterministic ambient graph nodes and edges.
- [x] Render sidebar graph stats from benchmark-density graph metrics, not only primary fixture memories.
- [x] Preserve citation/evidence node semantics.

## Task 3: Interaction Wiring

- [x] Make spacing controls update graph state.
- [x] Make label visibility toggle update graph state.
- [x] Make filter chips visually inactive matching graph targets.
- [x] Make memory node selection update inspector and active edge state.
- [x] Make rearrange mutate layout mode/version.

## Task 4: Playwright Verification

- [x] Add a repeatable Playwright evidence capture script.
- [x] Add an npm script for it.
- [x] Capture benchmark and local screenshots with Playwright.

## Task 5: Full Verification + Commit

- [x] Run `npm run typecheck`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run Playwright evidence capture.
- [x] Commit locally.
