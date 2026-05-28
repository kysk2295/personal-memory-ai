# First-Screen Quick Diary Save

## Product Goal

Let the user write a diary directly on the web first screen and save it like the app quick capture flow, without forcing a preview/import detour.

## Reins Mapping

- PRD: app quick diary capture or web diary import -> private second brain -> related past-memory nodes -> grounded AI actions.
- Phase: Phase 1 usable prototype.
- Epic: first-screen usable diary-to-memory path.
- Feature batch: web first-screen quick save through `/api/capture`, graph rehydration, selected memory handoff, route board/workbench update.

## Verification Gates

- Layout tests prove the first-screen diary draft exposes a direct quick-save action and private capture endpoint markers.
- Script tests prove quick-save posts a fast diary payload, rehydrates the graph, selects the new memory, updates related/AI state, and handles empty/error states.
- Playwright proves a first-screen quick diary save creates a private memory, moves the route board to graph/related readiness, and makes the Korean AI workbench follow the new memory.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
