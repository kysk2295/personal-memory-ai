# PMI-012 Second-Brain Fidelity Report

## Benchmark anchor

- Exact benchmark: `https://www.careerhackeralex.com/memory`
- Product promise: Personal Memory AI is a citation-based second brain where diary/imported memories become an inspectable graph and Ask/Decision answers stay grounded in evidence.

## Implemented slice

Hybrid frontend cycle focused on graph-first second-brain fidelity:

1. Replaced dashboard-like metric cards with a subdued graph metadata line.
2. Reworked the memory graph from a neat radial demo into a denser, more organic constellation with ghost nodes, semantic edges, and restrained accent nodes.
3. Reduced inspector visual weight so Ask My Past Self remains progressive disclosure, not a competing dashboard panel.
4. Preserved hidden evidence ledger, citations, Decision Replay markers, and graph highlight IDs for tests/accessibility.

## Changed files

- `TASKS/PMI-012-second-brain-fidelity-pass.md`
- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi012-second-brain-fidelity-report.md`

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
curl -fsS http://127.0.0.1:3000/ | grep -E 'second-brain-shell|graph-meta-line|ghost-memory-node'
```

Local screenshot evidence:

- `/Users/goyunseo/.hermes/cache/screenshots/browser_screenshot_3ab4d95e22694b7db1b348808ad395f8.png`

## Remaining risks

- The current graph is still static demo data, not a live force-directed graph.
- Sidebar counts still carry some analytics flavor, but they are now visually subdued and framed as graph metadata/filters rather than KPI cards.
- A later task should add true node selection/focus behavior if product scope allows.
