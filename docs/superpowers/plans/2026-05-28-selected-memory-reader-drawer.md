# Selected Memory Reader Drawer

## Goal

Make node click feel like opening a private diary memory, not only selecting a graph node. The web second brain should show the selected memory's title/source/date/body and related-memory path directly in the evidence rail.

## Contract

- Add a right-rail `data-selected-memory-reader="graph-node-body"` surface above the AI session panel.
- Initial state reflects `mem_freeze_vs_feature_addition` with source/date/body and related count.
- Graph/search/timeline selection updates reader selected id, title, source, body, related count, and last action.
- Reader actions focus related comparison, seed Ask, and expose guided AI session wiring without replacing the selected memory.
- Playwright verifies node selection updates the reader and reader Ask bridges into the existing grounded flow; the existing guided session evidence continues to cover session execution.

## Verification

- RED/GREEN app shell layout test for markup/script wiring.
- Playwright assertions for selected node -> reader body -> reader action -> AI session.
- Standard gates: typecheck, tests, build, service-flow, Playwright, commit, push/deploy.
