# PMI-014 — Client-Side Graph Control Wiring

## Task ID

PMI-014

## Status

ready_for_hermes

## Goal

Continue automatically from PMI-013 by making the visible graph controls perform lightweight client-side state changes: label hiding, node spacing, filter active state, and reset.

## Product context

Personal Memory AI should feel like an explorable second-brain graph. Controls that are visible but inert create a demo-like feel. This slice turns the current static controls into believable browser-side affordances without backend work or secrets.

## Benchmark anchor

Exact benchmark URL: `https://www.careerhackeralex.com/memory`

Borrowed benchmark qualities:

- Graph controls feel native to the canvas.
- Label density can be reduced.
- Node spacing controls visually change graph density.
- Filter chips show active/inactive graph exploration state.

## Scope

One frontend slice: lightweight client-side graph control affordances.

Allowed subtasks:

1. Add safe inline client script to wire graph controls.
2. `라벨 숨기기` toggles secondary labels and updates button text/state.
3. Node spacing pills update graph workspace density classes.
4. Filter chips toggle active state; reset clears it and restores default labels/spacing.
5. Add tests for script/markers and local smoke markers.

## Allowed files

- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi014-client-graph-controls-report.md`
- `TASKS/PMI-014-client-graph-control-wiring.md`

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

- The deployed page includes `data-graph-control-script="pmi014"`.
- Clicking `라벨 숨기기` hides secondary graph labels and changes visible button state/text.
- Node spacing controls apply a graph density class.
- Filter chips can become visually inactive and reset restores them.
- No backend, auth, secret, dependency, package, or Railway config changes.

## Required tests

- Existing tests continue passing.
- Document test asserts client control script marker exists.
- App shell test asserts control data attributes exist.

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Local production smoke before deploy:

```bash
PORT=3000 npm start
curl -fsS http://127.0.0.1:3000/health/live
curl -fsS http://127.0.0.1:3000/ | grep -E 'data-graph-control-script="pmi014"|data-control="toggle-labels"|data-spacing="wide"'
```

## Stop conditions

- Any forbidden file changes.
- Typecheck/test/build fails.
- Browser console shows JS errors.
- Live Railway deploy fails.

## Required evidence

- Changed file list.
- Typecheck/test/build outputs.
- Local production smoke output.
- Browser console check.
- Fresh Railway screenshot artifact from `https://web-production-bcaf6.up.railway.app/`.

## Output requirements

- Commit and push to `main` after verification.
- Deploy the Railway `web` service.
- Verify exact live URL with markers, browser console, and screenshot.
