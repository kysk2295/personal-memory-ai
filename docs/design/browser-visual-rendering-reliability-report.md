# PMI-006 — Browser Visual Rendering Reliability Report

Status: failed_verification  
Task Contract: `TASKS/PMI-006-browser-visual-rendering-reliability-gate.md`  
Branch: `reins/pmi-006-browser-visual-reliability`  
Date: 2026-05-26 KST

## 1. Goal

Determine whether the blank screenshot evidence found in PMI-001 is app-side, tooling-side, or unresolved, and unblock real browser visual verification for frontend work.

## 2. URL under test

- `https://web-production-bcaf6.up.railway.app`
- `https://web-production-bcaf6.up.railway.app/?pmi006=inspect`

## 3. Evidence collected

Blank browser screenshot artifacts from staging:

- `artifacts/design-baseline/staging-root-browser-blank.png`
- `artifacts/design-baseline/staging-cachebust-browser-blank.png`

Benchmark screenshot that captured successfully:

- `artifacts/design-baseline/benchmark-careerhackeralex-memory.png`

Staging HTML evidence:

- `artifacts/design-baseline/staging-cachebust-html-snapshot.html`

## 4. Investigation steps

1. Re-opened staging in browser tool with cache-busted URL.
2. Confirmed browser accessibility snapshot showed the full app structure:
   - `Memory brain graph`
   - `Ask My Past Self`
   - citation links
   - evidence drawer related content
   - Decision Replay content
3. Confirmed browser console showed no JavaScript errors.
4. Inspected computed styles via DOM evaluation.
5. Compared staging screenshot behavior with benchmark screenshot behavior.
6. Ran required verification gates: typecheck, tests, build.

## 5. Findings

### A. DOM/layout content exists on staging

Browser evaluation showed:

```text
title: personal-memory-ai memory brain graph
readyState: complete
bodyLen: 44723
mainCount: 1
body/html background: rgb(243, 241, 234)
body/html text color: rgb(23, 23, 23)
main width: 1265
main height: 4423+
svg width: 821
svg height: 496+
```

This means the page is not an empty DOM and is not trivially hidden by `display:none`, `visibility:hidden`, `opacity:0`, or zero-sized layout boxes.

### B. Browser screenshot evidence remains blank on staging

Despite visible DOM structure and non-zero layout, the captured browser screenshots for staging remain blank white images.

Observed artifact sizes:

```text
staging-root-browser-blank.png            3742 bytes
staging-cachebust-browser-blank.png       3742 bytes
```

This is consistent with a blank white screenshot capture.

### C. Benchmark screenshot capture works

The benchmark screenshot was captured successfully and is much larger:

```text
benchmark-careerhackeralex-memory.png     381866 bytes
```

This suggests the screenshot pipeline itself is not completely broken.

### D. Current root-cause classification

Current classification:

```text
unresolved, likely app/render-path-specific
```

Why not "generic screenshot-tool failure":

- benchmark capture worked
- staging DOM exists
- staging console has no JS errors
- layout boxes and computed styles indicate visible content should exist

Why not confidently "app-side root cause fixed":

- no visible successful staging screenshot was produced
- no single deterministic root cause was proven from allowed-file investigation alone

## 6. Changed files during PMI-006

Implementation-side code changes applied:

```text
none
```

Documentation/task files created or updated during PMI-006 setup/execution:

```text
TASKS/PMI-006-browser-visual-rendering-reliability-gate.md
docs/design/browser-visual-rendering-reliability-report.md
```

Planning-layer update created before/around task kickoff:

```text
docs/product/product-master-plan-2026-05-26.md
```

No forbidden files were intentionally modified by PMI-006 execution.

## 7. Verification gates

### git diff --name-only

Repository already had pre-existing dirty/untracked files from earlier generated work, so raw repo diff is noisy. PMI-006-specific files are listed above.

### npm run typecheck

```text
PASS
```

### npm test

```text
PASS
8 test files passed
27 tests passed
```

### npm run build

```text
PASS
```

## 8. Contract outcome

Acceptance criteria not fully met.

Met:

- root cause hypothesis/classification documented
- report written
- required verification commands passed
- no general frontend redesign performed

Not met:

- no real browser screenshot showing visible staging UI was produced

Per the PMI-006 stop conditions, this requires the task to stop as:

```text
failed_verification
```

## 9. Recommended next step

Do **not** proceed to PMI-002/PMI-003 frontend polish yet.

Recommended follow-up task should be narrower and more diagnostic, for example:

```text
PMI-007 — Determine why staging renders to DOM but not to screenshot-visible pixels
```

Possible allowed investigation directions for PMI-007:

- compare local static output vs staging output visually
- inspect SVG/render path and server-rendered markup simplification
- test whether specific components (graph SVG, large layout shell, or inline style block) trigger the blank capture
- create a minimal visible staging shell proof on the same route without changing package.json or Railway config

## 10. Final status

Paperclip status should be:

```text
failed_verification
```

Frontend completion remains blocked.
