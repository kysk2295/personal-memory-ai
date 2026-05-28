# One-Click Notion Diary Import

## Product Goal

Make the first screen match the intended workflow: the user can bring in the `습관리스트` diary database with one clear action, then continue into private graph, related past memories, and the AI workbench.

## Reins Mapping

- PRD: app quick diary capture or web diary import -> private second brain -> related past-memory nodes -> grounded AI actions.
- Phase: Phase 1 usable prototype.
- Epic: first-screen usable diary-to-memory path.
- Feature batch: one-click Notion diary DB import orchestration with clear Korean gate states.

## Verification Gates

- Layout tests prove the first-screen Notion diary import exposes a single primary action for `습관리스트`.
- Script tests prove the action can search sources, auto-select diary sources, preview, apply, rehydrate, and surface token/source/rate-limit gates.
- Playwright proves the first-screen one-click action reaches either imported graph handoff or a concrete Korean Notion gate state.
- Full verification: typecheck, tests, build, service-flow evidence, and Playwright evidence.
