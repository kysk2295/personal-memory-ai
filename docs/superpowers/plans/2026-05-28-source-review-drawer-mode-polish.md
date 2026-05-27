# Source Review Drawer Mode Polish Implementation Plan

**Goal:** Make the selected-memory source review drawer usable as a focused workflow instead of one dense stack of edit, history, and provenance controls.

**Architecture:** Keep the existing owner-scoped memory update, review ledger, and provenance API paths. Add client-only drawer modes so the same private memory detail panel can switch between editing the source, auditing review history, and exporting provenance.

**Tech Stack:** TypeScript, Vitest, static web shell script, Playwright.

## Task 1: Mode-Split Source Review Drawer

- [x] Add a failing shell layout test for Review/History/Provenance mode markers.
- [x] Add drawer mode buttons and mode-specific sections in the memory detail timeline panel.
- [x] Add CSS that hides inactive drawer sections and highlights the active mode.
- [x] Add client-side mode switching and stable interaction state markers.
- [x] Reveal History mode after saving a memory edit so the new comparison card is immediately visible.
- [x] Extend Playwright evidence to switch into Provenance mode before export/download.

## Verification

- `npx vitest run src/lib/appShellEvidenceLayout.test.ts -t "separates the source review drawer"`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

All passed after restarting the local server on `3001`.
