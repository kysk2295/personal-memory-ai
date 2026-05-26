# PMI-008 — Staging-Host Render Context Audit

## Task ID

PMI-008

## Status

ready_for_human_review

## Goal

Determine why the Railway staging host produces blank browser screenshots even though the deployed HTML is byte-identical to the local visible render, and isolate the narrowest host-context trigger or eliminated suspects.

## Product context

PMI-007 proved that local `debug-text`, `plain`, `no-svg`, `svg-only`, and `full` variants all render visible screenshots, and that local `dist/index.html` and remote staging HTML are byte-identical. Therefore the remaining suspect class is staging-host / deployment render context rather than page markup alone. This task must audit the host delivery path, response headers, cache behavior, origin-specific rendering behavior, and any browser-capture-visible differences that explain why staging remains blank.

## Allowed files

- `src/App.tsx`
- `server.mjs`
- `docs/design/staging-host-render-context-audit.md`
- `artifacts/design-baseline/*`
- `TASKS/PMI-008-staging-host-render-context-audit.md`

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

- Report compares remote staging host behavior against at least one local-visible control.
- Report records host-response evidence such as headers, content-type, caching, or browser-observed differences.
- Report isolates the narrowest proven host-context trigger or eliminated suspects.
- If a safe diagnostic change is required, it stays within allowed files only.
- Task does not broaden into general frontend redesign work.

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
report = Path('docs/design/staging-host-render-context-audit.md')
assert report.exists(), 'missing report'
text = report.read_text().lower()
for needle in ['header', 'cache', 'https://web-production-bcaf6.up.railway.app']:
    assert needle in text, needle
print('PMI-008 report verification passed')
PY
```

## Stop conditions

- Any forbidden file is changed.
- The task requires package installation or package.json modification.
- No host-context narrowing is achieved.
- Verification (`typecheck`, `test`, `build`) fails.
- Fix would require Railway config changes, DB migration, or secret access.

## Required evidence

- Report path documenting compared remote/local behavior, commands, findings, and known risks.
- Screenshot/image evidence paths where possible.
- Header/response evidence.
- `git diff --name-only` output.
- Verification command outputs.

## Output requirements

- Post live progress updates to Paperclip during execution, not only at the end.
- Paperclip status: `ready_for_human_review` if all gates pass and narrowing is sufficient.
- Paperclip status: `failed_verification` if any gate fails.
- Do not mark `complete`.
