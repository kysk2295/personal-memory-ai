# Memory Search + Detail Interaction Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans and benchmark-driven-frontend-iteration.

**Goal:** Make the graph workspace searchable and inspectable so it behaves more like a second brain than a static graph image.

**Product sentence:** Personal Memory AI is a private diary/import second brain where a user can find a memory, inspect it, and ask from that cited context.

**Benchmark anchor:** CareerHacker Alex `/memory` keeps graph controls and graph exploration visible in the first screen; Personal Memory AI must add product-specific search/detail interactions without becoming a dashboard.

## Task 1: RED

- [x] Add tests for memory search input, result list, searchable node text, and search interaction script markers.
- [x] Run focused test and verify failure.

## Task 2: Implement Search/Detail Interaction

- [x] Add sidebar memory search control and result list.
- [x] Add searchable text metadata to memory nodes.
- [x] Make search input dim unmatched nodes and update match count.
- [x] Make search result clicks select the corresponding memory in the inspector.

## Task 3: Playwright Verification

- [x] Extend Playwright evidence script to type into search, verify filtered nodes, click a result, and capture search/detail screenshot.

## Task 4: Full Verification + Commit

- [x] Run `npm run typecheck`.
- [x] Run `npm test`.
- [x] Run `npm run build`.
- [x] Run `npm run evidence:playwright`.
- [x] Commit locally.
