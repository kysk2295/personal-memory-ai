# Use-Now Live Route Board

## Product Goal

Make the first screen feel like a usable product path, not a label strip: diary capture/import should visibly flow into graph memory, related past-memory nodes, Korean AI actions, and saveback readiness.

## Reins Mapping

- PRD: quick diary or diary import -> private second brain -> related past-memory nodes -> grounded Ask/Decision Replay/Weekly Report -> saved future memory.
- Phase: Phase 1 usable prototype.
- Epic: first-screen service-flow clarity and direct action.
- Feature batch: live route board inside the use-now command strip.

## Verification Gates

- Layout tests prove the route board exists with Korean labels, live state markers, and direct action buttons.
- Client script tests prove the route board updates from workflow focus, import handoff, AI workbench actions, and saveback.
- Playwright proves use-now actions can focus graph and AI workbench, and the route board state updates after diary import/apply and AI action.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
