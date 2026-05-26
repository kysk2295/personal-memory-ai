# PMI-007 — Render Path Diagnostic Report

Status: ready_for_human_review  
Task Contract: `TASKS/PMI-007-render-path-diagnostic.md`  
Branch: `reins/pmi-007-render-path-diagnostic`  
Date: 2026-05-26 KST

## 1. Goal

Determine which specific render path, component class, or markup pattern causes staging to expose visible DOM/layout text while browser screenshot captures still show blank white pixels.

## 2. URLs compared

Remote staging:

- `https://web-production-bcaf6.up.railway.app`
- `https://web-production-bcaf6.up.railway.app/?pmi007=cmp`

Local diagnostic server:

- `http://127.0.0.1:3105/?variant=debug-text`
- `http://127.0.0.1:3105/?variant=plain`
- `http://127.0.0.1:3105/?variant=no-svg`
- `http://127.0.0.1:3105/?variant=svg-only`
- `http://127.0.0.1:3105/?variant=full`

## 3. Variant matrix

### Variant A — `debug-text`

Purpose:

- prove local screenshot-visible pixels work with a trivial HTML body

Result:

- visible screenshot
- large black text rendered successfully

Evidence:

- `artifacts/design-baseline/local-debug-text-visible.png`

### Variant B — `plain`

Purpose:

- topbar-only app shell without graph/panels

Result:

- visible screenshot
- header text and buttons render successfully

Evidence:

- `artifacts/design-baseline/local-plain-visible.png`

### Variant C — `no-svg`

Purpose:

- full app panels without graph SVG

Result:

- visible screenshot
- Ask / Decision Replay / drawer / lower panels all render successfully

Evidence:

- `artifacts/design-baseline/local-no-svg-visible.png`

### Variant D — `svg-only`

Purpose:

- isolate graph section and SVG render path without the rest of the app shell

Result:

- visible screenshot
- graph SVG, circles, labels, and connectors all render successfully

Evidence:

- `artifacts/design-baseline/local-svg-only-visible.png`

### Variant E — `full`

Purpose:

- local full-page render using the same app shell markup as staging

Result:

- visible screenshot
- full page renders successfully

Evidence:

- `artifacts/design-baseline/local-full-visible.png`

### Remote staging baseline

Purpose:

- compare the deployed page using browser capture

Result:

- screenshot remains blank white
- DOM/a11y snapshot still shows full content

Evidence:

- `artifacts/design-baseline/staging-root-browser-blank.png`
- `artifacts/design-baseline/staging-cachebust-browser-blank.png`
- `artifacts/design-baseline/staging-cachebust-html-snapshot.html`

## 4. Strongest narrowing result

The narrowest proven trigger is **not** any single component or markup block inside the page.

What PMI-007 eliminated:

- not shell-level text alone (`debug-text` visible)
- not topbar-only app shell (`plain` visible)
- not non-SVG panels (`no-svg` visible)
- not SVG graph alone (`svg-only` visible)
- not the combined local full markup (`full` visible)

Therefore the blank-screenshot behavior is **not reproducible from the app markup alone** when served locally through the same browser capture flow.

## 5. Byte-identical remote vs local HTML check

Command comparison showed:

```text
local_len 55962
remote_len 55962
local_sha256 6d16cbe5dee8c1f698755d5b218961a6f1e16eee490804a42dafce63a892ccf4
remote_sha256 6d16cbe5dee8c1f698755d5b218961a6f1e16eee490804a42dafce63a892ccf4
diff_lines 0
```

Interpretation:

- local `dist/index.html` and remote staging HTML are byte-identical
- this rules out “different deployed HTML” as the trigger

## 6. Diagnostic conclusion

Current classification:

```text
deployment-context-specific / staging-host-render-context-specific
```

More specifically:

- the trigger is not proven to be shell-level, SVG-level, panel-level, style-level, or combined-markup-level
- the issue only appears when the identical HTML is loaded from Railway staging in the browser capture environment
- the same HTML loaded from a local server renders visible pixels correctly

So the narrowest proven trigger is:

```text
remote staging delivery/render context, not a specific app component subtree
```

## 7. What this means operationally

PMI-002 / PMI-003 frontend polish should still wait.

Why:

- visual verification on the real staging host remains unreliable
- even though app markup is not the root trigger, the required frontend evidence gate is still blocked on staging-host rendering behavior

## 8. Suggested next task

Recommended follow-up:

```text
PMI-008 — Staging-host rendering context audit
```

Focus areas:

- inspect HTTP headers/content-type/cache behavior on Railway response path
- compare root response and screenshot behavior across browser sessions
- verify whether Browserbase/browser capture has host-specific blanking on this Railway origin
- test alternate path/query response behavior on the same host without changing package.json or secrets
- if necessary, create a minimal alternate staging route on the same deployment host using allowed files only

## 9. Files changed during PMI-007

Allowed code changes:

- `src/App.tsx`
- `server.mjs`

Documentation/evidence:

- `docs/design/render-path-diagnostic-report.md`
- `artifacts/design-baseline/local-debug-text-visible.png`
- `artifacts/design-baseline/local-plain-visible.png`
- `artifacts/design-baseline/local-no-svg-visible.png`
- `artifacts/design-baseline/local-svg-only-visible.png`
- `artifacts/design-baseline/local-full-visible.png`
- `TASKS/PMI-007-render-path-diagnostic.md`

## 10. Verification intent

This task achieved sufficient narrowing under contract because it identified the narrowest proven trigger class and eliminated the main internal suspects.

Target status:

```text
ready_for_human_review
```

Not `complete`.
