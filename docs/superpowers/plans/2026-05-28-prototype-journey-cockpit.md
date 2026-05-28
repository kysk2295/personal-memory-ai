# Prototype Journey Cockpit

## Goal

Make the prototype usable at a glance by adding one Korean-first journey cockpit that always answers:

- where the user is in the diary -> second brain -> related memories -> AI -> save flow
- which memory is currently selected
- how many related past memories are available
- what the next useful action is

This is a user-visible feature batch for Phase 1 intake-to-second-brain. It sits above visual benchmark polish because the user's main complaint is that the core product flow is hard to see.

## Contract

- Render a single `data-prototype-journey-cockpit="diary-memory-ai"` panel near the first-screen flow controls.
- Initial state is Korean-first and points to diary capture/import as the next action.
- The cockpit updates when:
  - a diary/import is applied to the graph
  - a graph memory is selected
  - related-memory AI actions are seeded or answered
  - session saveback completes
- The cockpit exposes stable test attributes for step, selected memory, related count, AI state, save state, and next action.
- Existing duplicate/secondary flow widgets remain intact for now, but the cockpit becomes the primary legibility layer.

## Verification

- RED/GREEN layout tests for markup and script wiring.
- Playwright evidence that the cockpit follows apply -> related -> AI -> save states.
- Standard gates: typecheck, tests, build, service-flow, Playwright, diff check.
