# Selected Memory AI Action Center Feature Batch

## Phase / Epic / Goal

- Phase: app/web diary intake to private second brain
- Epic: grounded AI action clarity
- Goal: when a memory is selected, show one Korean-first action center that tracks source memory, related past-memory count, latest AI action, citation count, and save-back state.

## Contract

The selected-memory surface must:

- expose a stable `data-selected-ai-action-center="grounded-memory-actions"` panel
- show Ask, Decision Replay, Weekly Report, and Session action states in one place
- update when graph selection changes
- update when related-memory Ask/Decision/Weekly actions run
- show when the grounded result is saved as a future memory

## Verification

- layout tests for markup and script wiring
- Playwright evidence for action state and save-back state
- standard typecheck, tests, build, service-flow, Playwright, diff check
