# PMI-006 — Browser Visual Rendering Reliability Gate

## Task ID

PMI-006

## Status

failed_verification

## Goal

Resolve the discrepancy where staging HTML/DOM appears present but real browser screenshot evidence is blank, so frontend tasks can rely on real visual verification.

## Product context

PMI-001 found that `https://web-production-bcaf6.up.railway.app` returns healthy HTML and DOM content, but screenshot-based browser evidence was blank. Under Reins Engineering, no frontend task may claim completion until a real browser can visibly render the staging UI and produce screenshot evidence. This task is not general design polish; it is a reliability gate for browser-visible rendering and evidence capture.

## Allowed files

- `src/App.tsx`
- `src/components/**`
- `server.mjs`
- `docs/design/browser-visual-rendering-reliability-report.md`
- `artifacts/design-baseline/*`
- `TASKS/PMI-006-browser-visual-rendering-reliability-gate.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `db/**`
- `src/lib/**`
- `.env`
- `.env.*`
- any secret, token, OAuth, keychain, or Railway variable file

## Acceptance criteria

- Report identifies the root cause hypothesis for blank screenshot evidence and whether it is app-side, tooling-side, or unresolved.
- If app-side fix is required and applied, the staging URL visibly renders in a real browser after deployment or local verification path explicitly documented.
- Report includes at least one real browser screenshot path showing visible UI, or explicitly records failed verification if visible UI cannot be captured.
- Report lists exact changed files and keeps changes within allowed files only.
- Task does not perform general frontend redesign work.

## Required tests

- `npm run typecheck`
- `npm test`
- `npm run build`

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
python3 - <<'PY'
from pathlib import Path
report = Path('docs/design/browser-visual-rendering-reliability-report.md')
assert report.exists(), 'missing report'
text = report.read_text()
assert 'https://web-production-bcaf6.up.railway.app' in text
assert 'screenshot' in text.lower() or '스크린샷' in text
print('PMI-006 report verification passed')
PY
```

## Stop conditions

- Any forbidden file is changed.
- The task requires package installation or package.json modification.
- Staging/browser evidence still cannot produce a visible screenshot after investigation and allowed fixes.
- Verification (`typecheck`, `test`, `build`) fails.
- Fix would require Railway config changes, DB migration, or secret access.

## Required evidence

- Real browser screenshot path showing the staging UI if successful.
- Report path documenting investigation, commands, findings, and known risks.
- `git diff --name-only` output.
- Verification command outputs.

## Output requirements

- Post live progress updates to Paperclip during execution, not only at the end.
- Paperclip status: `ready_for_human_review` if all gates pass.
- Paperclip status: `failed_verification` if any gate fails.
- Do not mark `complete`.
