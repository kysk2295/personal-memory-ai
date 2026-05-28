# Diary Intake Hub Batch

## Goal

Make the front door of the product match the PRD flow: app quick diary capture or web diary import first, then private second-brain graph and memory-grounded AI.

## Scope

- Add a Korean first-screen intake hub with three entry modes: app quick capture, web diary paste/import, and Notion diary database.
- Keep the intake scope explicit: diary-only, private, graph handoff.
- Wire hub actions to the existing capture page, paste import panel, and Notion import panel.
- Verify static contracts and browser interactions.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`
