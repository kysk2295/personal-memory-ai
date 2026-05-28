# Intake To Session Result Panel

## Goal

After a user pastes a diary on the first screen and applies it to the graph, the intake hub should show what happened and offer the next useful action: run the grounded AI session from the newly created memory and its related past-memory nodes.

## Scope

- Add a Korean-first result panel inside the first-screen intake hub.
- When diary apply finishes, populate applied memory id, related-memory count, and next-step state.
- Add a first-screen "AI session" button that triggers the existing guided memory session.
- Verify the flow through static layout tests and Playwright evidence.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`
