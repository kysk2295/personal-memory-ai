# Memory Session Outcome Board

## Goal

Make the one-click AI session feel like a complete worry-solving workflow: selected diary memory -> related past memories -> Ask/Decision/Weekly execution -> cited result -> saved future memory.

## Contract

- Add a right-rail session outcome board inside the memory session panel.
- The board exposes selected source memory, related-memory count, Ask/Decision/Weekly step states, citation count, save state, and saved memory id.
- Running a guided session updates the board from idle/running to completed with all three action states completed.
- Saving the session updates the board to saved and shows the future memory id.
- Playwright verifies node selection -> session run -> outcome board completed -> saveback recorded.

## Verification

- RED/GREEN app shell layout test for markup/script wiring.
- Playwright assertions for outcome board state after guided session and saveback.
- Standard gates: typecheck, tests, build, service-flow, Playwright, commit, push/deploy.
