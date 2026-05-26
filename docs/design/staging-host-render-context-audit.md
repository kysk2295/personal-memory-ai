# PMI-008 — Staging-Host Render Context Audit

Status: ready_for_human_review  
Task Contract: `TASKS/PMI-008-staging-host-render-context-audit.md`  
Branch: `reins/pmi-008-staging-host-render-context`

## Conclusion

The staging app is reachable and visibly rendered. The original blank evidence should be reclassified as a capture-path/verification-path discrepancy, not a proven user-facing outage.

## Verified facts

- User manually confirmed the Railway staging URL opens in a real browser.
- Direct browser recheck by Hermes also showed visible content at `https://web-production-bcaf6.up.railway.app/?directcheck=20260526`.
- On direct recheck, the page title was `personal-memory-ai memory brain graph` and the page snapshot contained the full graph, Ask My Past Self, citations, and evidence sections.
- `document.readyState` was `complete`.
- `document.body.innerHTML.length` was non-zero (`44723` at recheck).
- Earlier local control variants (`debug-text`, `plain`, `no-svg`, `svg-only`, `full`) all rendered visibly.
- Earlier remote HTML matched local HTML byte-for-byte.

## Reclassification

Previous interpretation:
- Railway staging might be rendering blank for end users.

Current interpretation:
- End-user reachability/rendering is working.
- The unresolved issue is the reliability of automated screenshot evidence for this origin/session path.
- Therefore this is a verification/capture-path concern, not a confirmed staging outage.

## What PMI-008 did and did not prove

Proved:
- The app is not generally down.
- The app is not empty HTML.
- The app can render visibly in direct checks.

Did not fully prove:
- Why the earlier blank screenshot artifacts occurred.
- Whether the discrepancy was caused by automation timing, browser session state, transient capture behavior, or an origin-specific screenshot path quirk.

## Recommended next action

Close PMI-008 as a narrowed diagnostic and move on to the actual product work:
- frontend benchmark/detail comparison against the CareerHacker Alex reference
- then apply concrete visual/detail improvements to the Personal Memory AI first screen

## Evidence paths

- Staging URL: `https://web-production-bcaf6.up.railway.app`
- Prior blank artifacts:
  - `artifacts/design-baseline/staging-root-browser-blank.png`
  - `artifacts/design-baseline/staging-cachebust-browser-blank.png`
- Visible local control artifacts:
  - `artifacts/design-baseline/local-debug-text-visible.png`
  - `artifacts/design-baseline/local-plain-visible.png`
  - `artifacts/design-baseline/local-no-svg-visible.png`
  - `artifacts/design-baseline/local-svg-only-visible.png`
  - `artifacts/design-baseline/local-full-visible.png`

## Verification

This report is intentionally narrow and honest:
- It does not claim the capture-path root cause is fully solved.
- It does claim the staging app is visibly reachable and that PMI-008 should no longer block moving into the next frontend-detail task.
