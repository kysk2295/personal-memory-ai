# Saved Memory Reentry Open

## Product Goal

Close the end-to-end prototype loop by making `저장 기억 다시 열기` actually reopen the saved future memory in the graph/detail workspace after an AI result is saved.

## Reins Mapping

- PRD: AI advice/report artifacts should become future memories that the agent can cite later.
- Phase: Phase 1 usable prototype.
- Epic: first-screen diary/import -> related memories -> grounded AI -> saved memory reentry.
- Feature batch: saved-memory graph/detail reentry from the use-now route board.

## Verification Gates

- Playwright clicks `저장 기억 다시 열기` after AI saveback and verifies graph focus, active saved memory, and interaction state.
- Layout tests prove the route action delegates to the graph handoff selection path.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
