# PMI-014 Client Graph Controls Report

## Benchmark anchor

- Exact benchmark: `https://www.careerhackeralex.com/memory`
- Product promise: Personal Memory AI should feel like an explorable citation-based second brain, not a static demo or KPI dashboard.

## Implemented slice

Autonomous frontend cycle focused on client-side graph controls:

1. Added safe inline browser script marker `data-graph-control-script="pmi014"`.
2. Wired `라벨 숨기기` to toggle secondary graph labels and update button text/state.
3. Wired node spacing controls to update `data-spacing` on the shell (`tight`, `normal`, `wide`).
4. Wired filter chips to toggle `aria-pressed` active/inactive visual state.
5. Wired reset to restore visible labels, active filters, and normal spacing.
6. Added regression tests for script marker and control data attributes.

## Changed files

- `TASKS/PMI-014-client-graph-control-wiring.md`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi014-client-graph-controls-report.md`

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
curl -fsS http://127.0.0.1:3000/ | grep -E 'data-graph-control-script="pmi014"|data-control="toggle-labels"|data-spacing="wide"'
```

Browser JS interaction smoke passed locally:

- label toggle changed shell `data-labels` to `hidden` and button text to `라벨 보이기`.
- wide spacing control changed shell `data-spacing` to `wide`.
- episodic filter changed `aria-pressed` to `false`.
- browser console reported no JS errors.

## Remaining risks

- Controls are still client-only; they do not persist state or filter real backend graph data.
- Next useful slice: connect selected-node detail card and filter controls to actual graph subset state in the static fixture, then later replace fixtures with real graph data.
