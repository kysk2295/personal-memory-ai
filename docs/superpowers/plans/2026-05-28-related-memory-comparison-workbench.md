# Related Memory Comparison Workbench Feature Batch

## Phase / Epic / Goal

- Phase: app/web diary intake to private second brain
- Epic: related past-memory legibility
- Goal: when a diary memory is selected, make the related past memories easy to compare and immediately use for Ask, Decision Replay, Weekly Report, or a full guided AI session.

## Contract

The web second-brain screen must expose a Korean-first comparison workbench that:

- shows the selected/current diary memory
- lists the top related past memories with why each one was recalled
- marks one related memory as active for comparison
- lets the user choose a related memory without losing the current source memory context
- keeps AI actions grounded in the selected source memory plus related memory set
- exposes stable `data-related-memory-workbench` attributes for evidence scripts

## Verification

- layout test for markup and script wiring
- Playwright test for selecting a related memory comparison and preserving source context
- standard typecheck, tests, build, service-flow, Playwright, diff check
