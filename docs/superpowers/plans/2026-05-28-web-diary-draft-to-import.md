# Web Diary Draft To Import Batch

## Goal

Turn the first-screen intake hub from navigation into a usable web diary entry point. A user should be able to paste today's diary on the first screen and send it into the existing private import preview/apply flow.

## Scope

- Add an inline diary draft textarea and preview/apply actions to the intake hub.
- Reuse the existing private local import pipeline instead of adding a separate storage path.
- Keep the draft diary-only and graph-handoff scoped.
- Verify static contracts and Playwright interaction states.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`
