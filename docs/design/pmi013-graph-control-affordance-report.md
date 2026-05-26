# PMI-013 Graph Control Affordance Report

## Benchmark anchor

- Exact benchmark: `https://www.careerhackeralex.com/memory`
- Product promise: Personal Memory AI is an explorable, citation-based second brain rather than a KPI dashboard.

## Implemented slice

Autonomous frontend cycle focused on graph interaction affordances:

1. Added benchmark-like graph control area in the sidebar:
   - layout modes: 자유 / 주장별 / 계층 / 시간순
   - node spacing controls: 좁게 / 보통 / 넓게
   - actions: 다시 정렬 / 라벨 숨기기 / 필터 초기화 / 선택 노드 보기
2. Added secondary ghost labels and selected-node affordance to the graph so it feels more interactive and closer to a dense explorable memory graph.
3. Preserved graph-first hierarchy, subdued metadata, citation chips, hidden evidence ledger, and Decision Replay evidence markers.
4. Added regression tests for graph controls, ghost labels, and selected-node affordance.

## Changed files

- `TASKS/PMI-013-graph-control-affordance-pass.md`
- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/pmi013-graph-control-affordance-report.md`

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
curl -fsS http://127.0.0.1:3000/ | grep -E 'graph-control-panel|node-spacing-controls|hide-secondary-labels|selected-node-affordance'
```

## Remaining risks

- The controls are visual affordances in this slice, not wired interactive state.
- The graph remains static fixture data.
- Next useful slice: implement lightweight client-side state for label toggle/filter focus without introducing backend dependencies.
