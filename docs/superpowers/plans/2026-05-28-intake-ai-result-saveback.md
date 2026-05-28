# L104 Intake AI Result Saveback

## Goal

After the first-screen intake Ask, Decision Replay, or Weekly action runs, the user should be able to save that result back as a future memory from the same intake panel.

## Scope

- Add a disabled-by-default `결과를 기억으로 저장` action beside the intake AI actions.
- Enable it after Ask/Decision/Weekly returns an answered state.
- Route saveback to the existing saved-artifact buttons so persistence and citation metadata stay unchanged.
- Reflect save state in the intake result panel with Korean copy and stable data attributes.

## Verification

- Add RED expectations to `appShellEvidenceLayout.test.ts`.
- Extend Playwright evidence to run an intake AI action and save it from the intake panel.
- Run the full verification gate before commit/deploy.
