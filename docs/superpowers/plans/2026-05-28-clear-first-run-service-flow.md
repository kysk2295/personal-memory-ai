# L93 Clear First-Run Service Flow

## Product Goal

Make the first screen read as one usable product flow: quick diary or diary import -> private graph -> selected related memories -> AI session -> save back as a future memory.

## Batch Contract

- Add a first-run guide that is visible on the primary surface, not buried in the side rail.
- Keep actions large enough to feel like a user workflow rather than implementation status.
- Wire guide actions to existing diary import, selected-memory focus, AI session, and saveback behavior.
- Preserve private-memory and graph evidence contracts.

## Verification Gates

- Targeted app shell test proves the guide is rendered with the right product actions.
- Playwright evidence proves the guide exists and import action works in-browser.
- Full typecheck, test suite, build, service-flow evidence, Playwright evidence, and diff check pass before commit.
