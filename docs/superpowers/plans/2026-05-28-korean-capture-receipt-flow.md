# Korean Capture Receipt Flow

## Product Goal

Make the app capture prototype feel directly usable in Korean: quick diary fields are Korean-first, and after saving, the user sees a receipt showing the saved memory id, manual hints, and graph/session handoff.

## Reins Mapping

- PRD: app quick diary capture should be low-friction and then flow into the private web second brain.
- Phase: Phase 1 usable prototype.
- Epic: app capture -> web second brain handoff.
- Feature batch: Korean capture form labels and saved-memory receipt.

## Verification Gates

- Capture surface tests prove Korean-first labels and a saved receipt contract exist.
- Playwright proves quick save fills the receipt with saved memory id and manual hints.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
