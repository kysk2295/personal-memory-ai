# PMI-018 — Obsidian Graph Node Parity

## Task ID

PMI-018

## Status

ready_for_hermes

## Goal

Rebuild the first-screen graph presentation of Personal Memory AI so the graph canvas, node styling, edge treatment, density, and label feel are recognizably Obsidian Graph View-like, while still preserving Personal Memory AI semantics: clickable memory selection, cited inspector, compiled-memory strip, and hidden evidence ledger.

## Product anchor

Personal Memory AI is a personal memory AI where the graph is evidence UI, not just decoration. The graph must feel like Obsidian’s living vault graph, but still drive Ask My Past Self, citation-backed answers, and MemoryAtom architecture.

## Exact benchmarks

1. Obsidian graph help screenshot:
   - https://obsidian.md/help/plugins/graph
   - screenshot asset: `obsidian-graph-view.png`
2. Prior architecture references that must remain semantically integrated:
   - https://www.careerhackeralex.com/sharings/second-brain-architecture.html
   - https://hindsight.vectorize.io/
   - https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f

## Visual truths to borrow from Obsidian

- Bright, nearly white graph canvas
- Very thin low-contrast ambient edges
- One selected/hub node with soft purple fill and subtle border
- Small secondary nodes with compact labels placed beside dots
- Many faded background nodes to imply graph depth
- Minimal glow; no heavy dashboard neon
- Light gray left rail / control surface rather than black dashboard chrome
- Labels are small, neutral gray, not hero-card typography
- The graph should look like a navigable note map, not like big feature cards connected by lines

## Must remain unchanged

- `data-control="select-memory"` interaction must stay wired
- Inspector (`data-inspector-panel="pmi015"`) must still update from graph selection
- Compiled-memory strip (`data-wiki-compiler`) must remain present, but subtle
- Ask My Past Self bar remains above the graph
- Evidence drawer stays available but not dominant
- No KPI dashboard count cards on first impression

## Implementation slice

This slice is a full graph presentation rebuild, not a tiny polish pass.

### Required implementation changes

1. Rebuild `renderMemoryGraph()` composition toward an Obsidian-like topology:
   - center-selected node
   - small satellite memory nodes
   - faded ambient background nodes
   - thin purple spoke edges + faint gray graph web
2. Replace oversized red memory bubbles with Obsidian-style node scale/contrast
3. Convert labels to small beside-node graph labels
4. Add explicit Obsidian-style CSS markers/classes so tests can prove parity work shipped
5. Keep existing semantic DOM markers and selection wiring intact

## Verification markers

HTML / DOM should include:

- `data-control="select-memory"`
- `data-inspector-panel="pmi015"`
- `data-wiki-compiler="pmi017"` or later
- Obsidian-style implementation markers such as:
  - `class="obsidian-memory-node"`
  - `class="obsidian-selected-memory"`
  - `class="obsidian-spoke-edge"`
  - `class="obsidian-faded-edge"`
  - `class="obsidian-background-node"`
  - `class="obsidian-node-label"`

## Verification steps

1. `npm run typecheck`
2. `npm test`
3. `npm run build`
4. local `/health/live` smoke
5. local browser screenshot proving:
   - graph feels visually Obsidian-like
   - central selected purple node present
   - small side labels present
   - graph still first-screen
   - inspector and compiled-memory strip still visible
6. commit + push
7. Railway deploy
8. live URL marker verification + screenshot

## Done when

The deployed graph no longer reads like a custom dark dashboard graph. It should immediately read as “Obsidian graph-inspired note network” while still being clearly Personal Memory AI through the ask bar, inspector, citations, and compiled-memory semantics.
