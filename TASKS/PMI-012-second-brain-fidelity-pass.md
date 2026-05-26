# PMI-012 — Second-Brain Fidelity Pass

## Task ID

PMI-012

## Status

ready_for_hermes

## Goal

Run one hybrid frontend cycle that keeps the deployed first screen anchored to `https://www.careerhackeralex.com/memory` by reducing remaining dashboard cues and making the graph canvas feel more like a dense, explorable second-brain workspace.

## Product context

Personal Memory AI is a citation-based personal memory AI. The web surface should feel like a second-brain graph/analysis workspace where diary entries, imports, decisions, outcomes, and citations are inspectable. The app must not drift back into a generic SaaS dashboard of stacked feature cards.

## Hybrid batch scope

This cycle may include 2–4 tightly related frontend subtasks under one theme: graph-first second-brain fidelity.

1. Reduce dashboard-like metric cards in the sidebar.
2. Make the graph canvas more dense/organic and closer to a knowledge graph rather than a neat demo diagram.
3. Keep Ask My Past Self / Decision Replay / Evidence Drawer as progressive disclosure rather than competing dashboard panels.
4. Preserve citation/evidence test coverage.

## Allowed files

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi012-second-brain-fidelity-report.md`
- `artifacts/design-baseline/*`
- `TASKS/PMI-012-second-brain-fidelity-pass.md`

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

- The deployed first screen still uses left sidebar + large graph canvas + ask bar as the dominant structure.
- Sidebar metrics feel like graph metadata/legend, not KPI dashboard cards.
- The graph looks more like a second-brain/knowledge-graph canvas: denser, more organic, less symmetric, with subdued edges and restrained accent nodes.
- Ask/Decision/Evidence surfaces remain present and citation-grounded but do not dominate the first impression as dashboard panels.
- Existing evidence/citation grounding remains test-covered.

## Required tests

- Update app shell tests for the second-brain fidelity markers.
- Existing logic-level tests must continue passing.

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
curl -fsS http://127.0.0.1:3000/ | grep second-brain-shell
```

## Stop conditions

- Any forbidden file changes.
- Typecheck/test/build fails.
- Live Railway deploy fails.
- The graph becomes decorative without evidence/citation grounding.
- The first impression returns to stacked dashboard cards.

## Required evidence

- Changed file list.
- Typecheck/test/build outputs.
- Local production smoke output.
- Fresh Railway screenshot artifact from `https://web-production-bcaf6.up.railway.app/`.

## Output requirements

- Commit and push to `main` after verification.
- Deploy the Railway `web` service.
- Report final live URL, commit hash, verification commands, and screenshot path.
