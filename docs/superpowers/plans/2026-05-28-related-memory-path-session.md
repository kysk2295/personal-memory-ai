# Related Memory Path Session Batch

## Goal

Make the core PMAI loop legible on the first screen: select one diary memory in the graph, see why older memories are connected, then run Ask / Decision Replay / Weekly Report / full AI session from that same context.

## Scope

- Add a Korean selected-memory path panel over the graph.
- Server-render the initial selected memory and related memories from `memoryTimeline`.
- Keep the panel synced when Cytoscape graph selection changes.
- Wire panel actions into existing related-memory Ask, Replay, Weekly, and guided session flows.
- Verify with unit assertions and browser evidence.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts` catches the static contract.
- `npm run evidence:playwright` catches graph click and UI action behavior.
- Full typecheck/build/evidence gates run before commit.
