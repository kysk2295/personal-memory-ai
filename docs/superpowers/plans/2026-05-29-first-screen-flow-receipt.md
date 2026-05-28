# First Screen Flow Receipt

## Product Goal

Make the deployed prototype easier to understand without explanation: the first screen should show a live Korean receipt for the current service flow from diary capture/import to second-brain graph, related past memories, AI result, and saved future memory.

## Reins Mapping

- PRD: app quick diary capture or web diary import -> private second brain -> related past-memory nodes -> grounded Ask/Decision Replay/Weekly Report.
- Phase: Phase 1 usable prototype.
- Epic: visible service flow clarity.
- Feature batch: first-screen live flow receipt.

## Verification Gates

- Unit evidence proves the first screen renders the flow receipt and update contract.
- Playwright proves quick-save updates the receipt with memory id, related count, and AI-ready next action.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
