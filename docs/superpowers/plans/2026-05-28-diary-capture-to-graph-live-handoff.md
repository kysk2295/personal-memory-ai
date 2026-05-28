# Diary Capture To Graph Live Handoff Feature Batch

## Phase / Epic / Goal

- Phase: app/web diary intake to private second brain
- Epic: first usable service flow
- Goal: make app quick diary, web paste diary, and Notion diary DB imports visibly converge into the same graph handoff path: memory node, related past memories, grounded AI action, and save-back.

## Contract

The web second-brain surface must expose a Korean-first live handoff map that:

- names the three entry routes: app quick diary, web diary paste, Notion diary DB
- shows the active route and current handoff stage
- keeps source scope diary-only for Notion/database import
- updates after preview/apply/session/save actions
- points to the selected memory, related-memory count, AI action readiness, and save-back status
- exposes stable `data-diary-graph-handoff-map` attributes for browser evidence

## Verification

- layout tests for the new handoff map markup and script wiring
- Playwright evidence for paste/import handoff state updates
- standard typecheck, tests, build, service-flow, Playwright, diff check
