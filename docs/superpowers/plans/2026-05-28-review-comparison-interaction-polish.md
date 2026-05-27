# Review Comparison Interaction Polish Implementation Plan

**Goal:** Make memory review history comparison usable immediately after a source edit, not only visible after a later reload.

**Architecture:** Keep the owner-scoped `/api/memory/update` ledger write as the source of truth. After a successful edit, append a client-side comparison card from the returned `reviewLedgerEntry`, mark it active, and expose the selected revision through stable DOM attributes for Playwright and future UI wiring.

**Tech Stack:** TypeScript, static TSX string renderer, local HTTP API, Playwright evidence.

## Task 1: Review Comparison Interaction Contract

- [x] Add a failing render contract test for selectable review comparisons.
- [x] Render comparison cards with `data-control="select-review-comparison"` and active-state attributes.
- [x] Add client-side helpers for rendering, appending, wiring, and selecting review comparison cards.
- [x] Update Playwright evidence to edit a memory, verify ledger creation, and select the new comparison card.
- [x] Run full verification:
  - `npm run typecheck`
  - `npm test`
  - `npm run build`
  - `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

## Evidence

- Benchmark screenshot: `artifacts/web-second-brain-product-surface/benchmark-careerhacker-memory-playwright.png`
- Local graph screenshot: `artifacts/web-second-brain-product-surface/local-graph-density-playwright.png`
- Interaction screenshot: `artifacts/web-second-brain-product-surface/local-graph-interactions-playwright.png`
- Search/detail/review screenshot: `artifacts/web-second-brain-product-surface/local-memory-search-detail-playwright.png`

## Notes

The first Playwright run failed because the local server on port `3001` was an older process that did not know `/api/memory/update`. Restarting `PORT=3001 npm start` loaded the current API route and the evidence loop passed.
