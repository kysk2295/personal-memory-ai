# PMI-011 — First-Screen Benchmark Rebuild Report

Status: ready_for_human_review  
Task Contract: `TASKS/PMI-011-first-screen-benchmark-rebuild.md`

## Exact benchmark

- Reference page: `https://www.careerhackeralex.com/memory`
- Prior benchmark artifact: `artifacts/design-baseline/benchmark-careerhackeralex-memory.png`

## PRD target served

This rebuild serves the PRD promise `나보다 나를 더 잘 아는 개인 기억 AI` by making the first screen feel less like a dashboard and more like a composed product surface, while preserving the product pillars:

- graph as evidence UI
- Ask My Past Self
- Decision Replay
- Pattern / import / capture planning visibility
- evidence drawer as trust surface

## What changed

### 1. Full first-screen recomposition
- Rebuilt the app shell from a stacked dashboard into a three-part editorial flow:
  - hero stage
  - story grid
  - lower editorial band
- Stronger hero framing with one dominant message and a paired graph card.

### 2. Graph stayed central, but as evidence UI
- Graph moved into a dedicated hero-side card instead of competing equally with every other panel.
- Support copy was reduced to a smaller set of evidence cues.
- Active highlight manifest remains visible and test-covered.

### 3. Ask / Replay became curated story cards
- Both panels were rewritten to show the current question/decision, recommendation, and strongest citations first.
- Citation grounding remains intact.
- The panels are still product pillars, but no longer read like raw debug surfaces.

### 4. Evidence drawer became a separate trust rail
- Drawer remains on the right as a distinct vertical evidence surface.
- Source, date, status, citation id, and trace remain visible.
- The drawer now reads more like a verification rail than a generic side panel.

### 5. Product planning stayed visible, but was pushed down
- Capture / import / native app boundary and status honesty still appear.
- They were moved to the lower editorial band so they do not dominate the first impression.

## Files changed

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/components/AskMyPastSelfPanel.tsx`
- `src/components/DecisionReplayPanel.tsx`
- `src/components/PatternPanel.tsx`
- `src/components/EvidenceDrawer.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `TASKS/PMI-011-first-screen-benchmark-rebuild.md`
- `docs/design/pmi011-first-screen-benchmark-rebuild-report.md`

## Verification

Passed:
- `npm run typecheck`
- `npm test`
- `npm run build`

## Visual evidence

- Local browser screenshot: `/Users/goyunseo/.hermes/cache/screenshots/browser_screenshot_d42cd400ffec4c979604c8f18a9f6a11.png`

## Honest remaining gaps

Still behind the benchmark in:
- lower-half density is still higher than the benchmark
- the evidence drawer is structurally right but still text-dense
- the graph card is stronger, but the benchmark still has more cinematic restraint and visual breathing room
- hero and support surfaces are closer to the benchmark than before, but not yet at parity

## Next likely frontend slice

If continuing immediately after review, the next bounded slice should be:
- lower-half density reduction
- evidence drawer text compression / hierarchy refinement
- stronger separation between hero-level story and supporting product-truth surfaces
