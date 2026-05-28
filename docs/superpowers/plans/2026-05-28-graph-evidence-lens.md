# Graph Evidence Lens

## Goal

Make the graph itself explain what is selected and why it matters. The benchmark graph exposes node/edge counts and tells the user that clicking nodes opens the body; this product needs the same affordance, but grounded in private diary memory.

## Contract

- Add a graph-stage overlay with `data-graph-evidence-lens="selected-memory-path"`.
- The lens shows selected memory, related past-memory count, highlighted path edge count, last AI action, citation count, and next action.
- The lens updates when a graph memory is selected, related edges are highlighted, related-memory AI actions run, and session saveback completes.
- Keep it compact and graph-native, not another large dashboard card.
- Add Playwright assertions that the lens follows Cytoscape node selection and grounded Ask/saveback state.

## Verification

- RED/GREEN layout test for markup and script wiring.
- Playwright evidence for node selection -> related path -> Ask -> saveback.
- Standard gates: typecheck, tests, build, service-flow, Playwright, diff check.
