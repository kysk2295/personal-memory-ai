# Session Saveback Visible Korean

## Goal

When a guided memory session is saved, the user should clearly see that the AI session became a future private memory, without English fallback text.

## Scope

- Keep the session save CTA Korean after save.
- Surface saved session memory id and saved state in the first-screen intake result panel.
- Mark the intake flow as saved back into future memory.
- Verify through static layout tests and Playwright evidence.

## Verification

- `npm test -- src/lib/appShellEvidenceLayout.test.ts`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`
