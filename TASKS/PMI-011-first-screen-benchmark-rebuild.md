# PMI-011 — First-Screen Benchmark Rebuild

## Task ID

PMI-011

## Status

ready_for_rpi

## Goal

Rebuild the Personal Memory AI web first screen from scratch so it is materially closer to the exact benchmark page `https://www.careerhackeralex.com/memory` while still preserving the product's evidence-first structure: graph as evidence UI, visible Ask / Decision Replay / Pattern pillars, and an evidence drawer trust surface.

## Product context

Ko Yunseo explicitly rejected the current frontend direction as too different from the benchmark in overall composition, pacing, and density. The benchmark must be treated as the binding frontend comparison target, but the product meaning must remain Personal Memory AI rather than a clone: app capture feeds memories into a web second-brain workspace where Ask My Past Self, Decision Replay, and evidence drawer stay grounded in cited memories.

## Allowed files

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/components/AskMyPastSelfPanel.tsx`
- `src/components/DecisionReplayPanel.tsx`
- `src/components/PatternPanel.tsx`
- `src/components/EvidenceDrawer.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `server.mjs` (serve already-built `dist/index.html` only; no TSX runtime import, no product logic)
- `docs/design/pmi011-first-screen-benchmark-rebuild-report.md`
- `artifacts/design-baseline/*`
- `TASKS/PMI-011-first-screen-benchmark-rebuild.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `db/**`
- `.env`
- `.env.*`
- auth/payment/secret management files
- backend persistence files

## Acceptance criteria

- First screen is materially re-composed rather than a minor polish of the prior dashboard-like shell.
- The visual hierarchy reads closer to the benchmark: fewer competing panels, stronger hero framing, more negative space, and a more authored lower-half progression.
- The graph remains visible as evidence UI, not decorative background art.
- Ask My Past Self, Decision Replay, Pattern, and evidence drawer remain present as product pillars, but are surfaced with more selective information density.
- Internal implementation/status labels do not dominate the first impression.
- Existing evidence/citation grounding remains test-covered.

## Required tests

- Update app shell tests to reflect the rebuilt composition without weakening evidence-grounding assertions.
- Existing logic-level tests must continue passing.

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Frontend evidence gate:

```text
Capture fresh local browser evidence after rebuild.
If staging deployment is explicitly approved later, capture staging evidence too.
```

## Stop conditions

- Any forbidden file changes.
- Typecheck/test/build fails.
- The rebuild removes or buries citation/evidence grounding.
- The rebuild turns the graph into purely decorative hero art.
- The rebuild invents new product capabilities.

## Required evidence

- Changed file list.
- Typecheck/test/build outputs.
- Fresh local browser screenshot artifact.
- Short report describing benchmark-aligned changes and remaining gaps.

## Output requirements

- Paperclip status: `ready_for_human_review`, not `complete`.
- Report exact files changed, screenshot artifact paths, and what remains behind benchmark/PRD.
