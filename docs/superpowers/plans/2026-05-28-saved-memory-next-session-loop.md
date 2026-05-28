# Saved Memory Next Session Loop

## Product Goal

After an AI result is saved as a future memory and reopened, the user should be able to run the next guided AI session from that saved memory, proving saved advice becomes usable past-memory evidence.

## Reins Mapping

- PRD: AI results should be saved back into the private second brain and reused in later reasoning.
- Phase: Phase 1 usable prototype.
- Epic: closed diary/import -> related memory -> AI result -> saved memory -> next AI session loop.
- Feature batch: route-board AI execution from reopened saved future memory.

## Verification Gates

- Playwright clicks saved-memory reentry, then `AI 작업대 실행`, and verifies the guided session source is the saved future memory.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
