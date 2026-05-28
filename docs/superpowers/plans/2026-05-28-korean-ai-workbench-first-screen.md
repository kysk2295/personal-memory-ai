# Korean AI Workbench First Screen

## Product Goal

Make the service flow legible enough for tonight's prototype: after a diary is captured/imported or a graph memory is selected, the user sees one Korean-first workbench for Ask, Decision Replay, Weekly Report, and saveback.

## Reins Mapping

- PRD: app quick diary capture or web diary import -> private second brain -> related past-memory nodes -> grounded Ask/Decision Replay/Weekly Report.
- Phase: Phase 1 usable prototype.
- Epic: first-screen service-flow clarity.
- Feature batch: Korean AI workbench that follows selected/applied memory state.

## Verification Gates

- Layout test proves the workbench exists, is Korean-first, exposes selected memory/related/action/save state, and has action controls.
- Playwright proves applying a diary updates the workbench memory/related/next action, and running Ask marks the action as answered and save as ready.
- Full local verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
