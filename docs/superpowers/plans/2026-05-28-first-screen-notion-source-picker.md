# First Screen Notion Source Picker

## Goal

Let the user continue from the first-screen `습관리스트 Notion DB` entry into source discovery without hunting through the lower import panel.

## Scope

- Add a first-screen `습관리스트 소스 찾기` action.
- Route it through the existing safe Notion source discovery endpoint.
- Reflect token/rate/source-list/selected-source states in Korean in the intake result panel.
- Keep the selected source id in the hidden Notion database field so preview/apply can continue.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`
