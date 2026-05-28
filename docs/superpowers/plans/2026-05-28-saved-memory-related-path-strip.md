# Saved Memory Related Path Strip

## Product Goal

After the user saves an AI result and reopens that saved future memory, the first-screen route board should immediately show why it connects back to past memories: current memory -> shared reason -> related past memory.

## Reins Mapping

- PRD: new diary/advice memories should appear with related past memories, not as isolated notes.
- Phase: Phase 1 usable prototype.
- Epic: visible diary/import -> private second brain -> related past-memory path -> grounded AI loop.
- Feature batch: first-screen route board related path strip for saved-memory reentry.

## Verification Gates

- Layout tests prove the use-now route board includes and updates a related path strip.
- Playwright proves saved-memory reentry populates the strip with the saved memory, related count, shared reason, and past memory label.
- Full verification: typecheck, tests, build, service-flow evidence, Playwright evidence.
