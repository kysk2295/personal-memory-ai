# Intake To Graph Status Board Batch

## Goal

Make the first product step obvious: app quick diary, web paste, or Notion diary DB
import becomes a private graph memory, then related past-memory nodes, then a grounded
AI session.

## Contract

- The intake hub exposes a Korean status board for diary source -> graph memory -> related nodes -> AI -> saveback.
- The board starts in waiting state and updates when a diary draft is applied.
- It records route, applied memory id, related-memory count, next action, AI state, and saveback state.
- Browser evidence verifies the board after web diary apply.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run evidence:service-flow`
- `npm run evidence:playwright`
