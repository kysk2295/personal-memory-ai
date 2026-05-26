# PMI-015 — Graph Node Selection Inspector Wiring

## Task ID

PMI-015

## Status

ready_for_hermes

## Paperclip

- Active issue: UNI-184
- Purpose: keep the autonomous frontend continuation visibly `in_progress` in Paperclip while Hermes works.

## Goal

Continue automatically from PMI-014 by making the graph feel explorable: clicking/selecting graph nodes should update the lower-right inspector headline/body and focus its citation chips.

## Product context

Personal Memory AI is a citation-based second brain. The graph should not feel decorative; it should let the user inspect memories and understand why an Ask My Past Self answer is grounded in citations.

## Benchmark anchor

Exact benchmark URL: `https://www.careerhackeralex.com/memory`

Borrowed benchmark qualities:

- graph nodes feel selectable
- selected item has a visible inspector/details affordance
- exploration changes the right-side/lower overlay state instead of opening a dashboard page
- graph remains the dominant surface

## Scope

One frontend slice: client-side selected-node → inspector/citation focus wiring.

Allowed subtasks:

1. Add safe `data-inspector-*` metadata to 3 primary memory nodes.
2. Make those graph nodes keyboard/click selectable where possible within static SVG markup.
3. Add `data-inspector-panel="pmi015"` and updateable headline/body/source/citation elements.
4. Extend the existing client script so node selection updates inspector content and active node state.
5. Add regression tests for markers and script behavior strings.
6. Verify live page with browser click/DOM check and screenshot.

## Allowed files

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `TASKS/PMI-015-graph-node-selection-inspector.md`
- `docs/design/pmi015-graph-node-selection-inspector-report.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `server.mjs`
- `db/**`
- `.env`
- `.env.*`
- auth/payment/secret files
- backend persistence files

## Acceptance criteria

- The page contains `data-inspector-panel="pmi015"`.
- Primary memory nodes expose inspector metadata.
- Selecting a graph node changes inspector headline/body/source and citation chip focus.
- Selected graph node gets an active visual state.
- Existing graph controls from PMI-014 keep working.
- No backend, auth, secret, dependency, package, or Railway config changes.

## Required verification

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Local smoke:

```bash
PORT=3000 npm start
curl -fsS http://127.0.0.1:3000/health/live
curl -fsS http://127.0.0.1:3000/ | grep -E 'data-inspector-panel="pmi015"|data-inspector-title|data-control="select-memory"'
```

Browser smoke:

- click a graph memory node
- assert inspector title/source changed
- assert no browser console JS errors

## Required closure

- Commit and push to `main`.
- Deploy Railway `web` service.
- Verify exact live URL: `https://web-production-bcaf6.up.railway.app/`.
- Attach fresh live screenshot.
- Add Paperclip checkpoint to UNI-184.
