# PMI-013 — Graph Control Affordance Pass

## Task ID

PMI-013

## Status

ready_for_hermes

## Goal

Run the next autonomous benchmark-driven frontend slice after PMI-012: bring the deployed first screen closer to `https://www.careerhackeralex.com/memory` by adding graph control affordances and denser label hierarchy without asking Ko Yunseo for routine intervention.

## Product context

Personal Memory AI is a citation-based second brain. The first screen should read as an explorable memory graph workspace, not a SaaS dashboard. The graph can be static in this slice, but the UI must visually communicate that graph filters, layout density, label visibility, and node selection are core product behaviors.

## Benchmark anchor

Exact benchmark URL: `https://www.careerhackeralex.com/memory`

Concrete benchmark qualities borrowed in this slice:

- Sidebar includes compact graph controls after node/edge legends.
- Node spacing / layout / label visibility controls appear as graph-native affordances.
- Graph has many small secondary labels, with a few larger thesis/important nodes.
- Question/search bar is visually integrated with the graph canvas.

## Hybrid batch scope

One visual theme: graph interaction affordances.

Allowed subtasks:

1. Add compact sidebar control rows for spacing, rearrange, label visibility, and reset.
2. Add visible graph interaction hints such as selected/active node affordance and small label-density cues.
3. Preserve second-brain graph-first hierarchy from PMI-012.
4. Add tests to prevent regression to missing graph controls or KPI cards.

## Allowed files

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi013-graph-control-affordance-report.md`
- `TASKS/PMI-013-graph-control-affordance-pass.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `server.mjs`
- `db/**`
- `.env`
- `.env.*`
- auth/payment/secret management files
- backend persistence files

## Acceptance criteria

- The first screen includes graph-native controls similar to the benchmark: layout modes, node spacing, rearrange, hide labels, reset filters.
- Controls must not look like KPI/business dashboard controls.
- The graph remains the dominant first-screen surface.
- Secondary labels/ghost nodes make the graph feel denser, while important thesis/decision nodes remain visually distinct.
- Evidence/citation markers remain present and tested.

## Required tests

- Existing tests continue passing.
- App shell test asserts graph control markers are present.
- App shell test asserts KPI card class remains absent.

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Production smoke before deploy:

```bash
PORT=3000 npm start
curl -fsS http://127.0.0.1:3000/health/live
curl -fsS http://127.0.0.1:3000/ | grep -E 'graph-control-panel|node-spacing-controls|hide-secondary-labels'
```

## Stop conditions

- Any forbidden file changes.
- Typecheck/test/build fails.
- Live Railway deploy fails.
- Graph controls dominate over the graph canvas.
- Citation/evidence markers disappear.

## Required evidence

- Changed file list.
- Typecheck/test/build outputs.
- Local production smoke output.
- Fresh Railway screenshot artifact from `https://web-production-bcaf6.up.railway.app/`.

## Output requirements

- Commit and push to `main` after verification.
- Deploy the Railway `web` service.
- Verify the exact live URL with HTML markers and browser screenshot.
- Report final live URL, commit hash, verification commands, and screenshot path.
