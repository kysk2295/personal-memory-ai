# PMI-015 Graph Node Selection Inspector Report

## Benchmark anchor

- Exact benchmark: `https://www.careerhackeralex.com/memory`
- Product promise: Personal Memory AI is an explorable, citation-based second brain rather than a static graph image.

## Implemented slice

Autonomous frontend cycle focused on graph node selection:

1. Added `data-control="select-memory"` to memory graph nodes.
2. Added per-node inspector metadata:
   - `data-inspector-title`
   - `data-inspector-source`
   - `data-inspector-body`
   - `data-inspector-citation`
3. Added inspector marker `data-inspector-panel="pmi015"`.
4. Extended the client script so selecting a memory node updates:
   - inspector headline
   - inspector source line
   - inspector body text
   - active citation chip
   - selected node visual state
5. Preserved PMI-014 controls for label hiding, spacing, filters, reset, and selected-node focus.
6. Added regression tests for inspector markers and script strings.

## Changed files

- `TASKS/PMI-015-graph-node-selection-inspector.md`
- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi015-graph-node-selection-inspector-report.md`

## Verification

Commands passed:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Local production smoke passed:

```bash
PORT=3000 npm start
curl -fsS http://127.0.0.1:3000/health/live
curl -fsS http://127.0.0.1:3000/ | grep -E 'data-inspector-panel="pmi015"|data-inspector-title|data-control="select-memory"'
```

Browser interaction smoke passed locally:

- clicked first memory node
- inspector selected memory became `mem_launch_may_anxiety_scope_delay`
- inspector headline changed to the selected memory summary
- active citation chip became `mem_launch_may_anxiety_scope_delay`
- browser console reported no JS errors

## Remaining risks

- Selection is still client-side fixture state; it does not query backend memory data yet.
- Next useful slice: make node filters actually dim matching graph groups and connect Evidence drawer scroll/focus to citation chips.
