# Provenance Controls Client Workflow Implementation Plan

**Goal:** Make the selected-memory provenance export/download controls actually call the private API from the web drawer.

**Architecture:** Keep the existing owner-scoped provenance export/download builders and routes. Add browser-safe POST support for the same endpoints because `fetch` cannot send request bodies with GET. The drawer buttons now set stable state markers after export/download and the Playwright evidence script verifies both controls.

**Tech Stack:** TypeScript, Vitest, static web shell script, local HTTP transport, Playwright.

## Task 1: Browser-Safe Provenance API Calls

- [x] Add a failing API test that calls provenance export/download through POST request bodies.
- [x] Allow `/api/memory/provenance-export` and `/api/memory/provenance-download` to accept POST while preserving existing GET behavior.
- [x] Add drawer state attributes for export/download idle/ready/error states.
- [x] Wire `Export provenance` and `Download provenance JSON` buttons to the private API.
- [x] Extend Playwright evidence to verify selected-memory provenance export and download interactions.

## Verification

- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

All passed after restarting the local server on `3001` so the current API source was loaded.
