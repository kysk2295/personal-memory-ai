# Use-Now Simplified Flow Mode

## Product Goal

Make the first screen feel usable instead of busy: the user should immediately see the core product path as diary capture/import, private graph memory, and the Korean AI workbench.

## Reins Mapping

- PRD: app quick diary capture or web diary import -> private second brain -> related past-memory nodes -> grounded Ask/Decision Replay/Weekly Report.
- Phase: Phase 1 usable prototype.
- Epic: first-screen service-flow clarity.
- Feature batch: use-now simplified mode that keeps secondary proof/evidence panels available but visually subordinate.

## Verification Gates

- Layout test proves the app shell starts in `use-now` mode with a Korean 3-step command strip and collapsed secondary chrome.
- Playwright proves the browser starts in use-now mode, the three steps are present, and switching graph/AI focus keeps the core workbench visible.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
