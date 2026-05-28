# Selected Memory Action Flow Batch

## Goal

Make the graph feel like the entry point to the service, not decoration. When a memory
node is selected, the user should immediately see the path from that memory to related
past memories, grounded AI actions, and saveback.

## Contract

- The selected memory path panel exposes a Korean action rail for graph -> related memory -> AI -> saveback.
- The rail starts ready for the selected graph memory and records source, related count, active action, and save state.
- Ask/Decision/Weekly/Session actions update the rail state before the existing grounded flows run.
- Browser evidence verifies that clicking graph-driven actions updates the rail.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `npm run evidence:service-flow`
- `npm run evidence:playwright`
