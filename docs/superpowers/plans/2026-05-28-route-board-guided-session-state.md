# Route Board Guided Session State

## Product Goal

Make the first-screen route board visibly follow the full loop after a diary is saved/imported: selected memory -> related past memories -> guided AI session -> save-ready result.

## Reins Mapping

- PRD: current diary and related past memories should appear together, then grounded Ask/Decision/Weekly results should help the user's concern.
- Phase: Phase 1 usable prototype.
- Epic: first-screen usable diary-to-memory path.
- Feature batch: route board and Korean workbench state synchronization for guided AI session completion.

## Verification Gates

- Layout tests prove guided session state updates the use-now route board to `ai-workbench`, `answered`, and `ready`.
- Playwright proves an applied diary can run the guided AI session and the first-screen route board reflects the completed AI/save-ready state.
- Full verification: typecheck, tests, build, service-flow evidence, and Playwright evidence.
