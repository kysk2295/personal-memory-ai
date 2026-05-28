# Notion Diary Intake Handoff

## Goal

Make the first-screen `습관리스트 Notion DB` path behave like a real product entry, not only a focus shortcut.

## Scope

- Add first-screen Notion preview/apply controls scoped to diary DB import.
- Keep missing-token/rate-limit states visible in Korean in the intake result panel.
- When Notion preview succeeds, allow apply to reuse the existing private import apply/graph/session path.
- Verify token-required behavior locally without secrets and preserve the live token-gated path.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`
