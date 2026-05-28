# Flow Focus Switcher

## Goal

Reduce first-screen confusion by giving the user an obvious Korean-first mode switch for the core workflow: record/import diary, inspect second brain, and review AI result/saveback.

## Contract

- Add a `data-flow-focus-switcher="core-workflow"` control with three modes: `capture`, `graph`, and `ai`.
- The shell exposes `data-workflow-focus`, and each mode updates a visible label/summary.
- Capture mode highlights diary intake; graph mode highlights graph/related memory inspection; AI mode highlights session/result/saveback.
- Clicking focus buttons updates shell state and section focus markers without replacing existing graph/session behavior.
- Playwright verifies the switcher transitions and no old English instructional copy is introduced.

## Verification

- RED/GREEN app shell layout test for markup/script wiring.
- Playwright assertions for capture -> graph -> ai focus transitions.
- Standard gates: typecheck, tests, build, service-flow, Playwright, commit, push/deploy.
