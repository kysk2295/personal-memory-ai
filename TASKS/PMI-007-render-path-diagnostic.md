# PMI-007 — Render Path Diagnostic for Blank Screenshot Pixels

## Task ID

PMI-007

## Status

ready_for_human_review

## Goal

Determine which specific render path, component class, or markup pattern causes staging to expose visible DOM/layout text while browser screenshot captures still show blank white pixels.

## Product context

PMI-006 established that staging DOM, computed styles, and layout boxes are present and that benchmark screenshots capture successfully, but Personal Memory AI staging screenshots remain blank. Before any frontend polish can continue, we need a narrower diagnostic task that isolates whether the blank-visible-pixels issue is triggered by the graph SVG, the shell layout, inline styles, SSR output shape, or another app-specific render path.

## Allowed files

- `src/App.tsx`
- `src/components/**`
- `server.mjs`
- `docs/design/render-path-diagnostic-report.md`
- `artifacts/design-baseline/*`
- `TASKS/PMI-007-render-path-diagnostic.md`

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

- Report identifies the narrowest proven trigger or eliminated suspects for the blank-screenshot behavior.
- Report compares at least two render variants or diagnostic states, with evidence.
- If a minimal safe app-side change is required and proven, it stays within allowed files only.
- Report clearly states whether the issue is shell-level, SVG-level, panel-level, style-level, SSR-level, or still unresolved.
- Task does not broaden into general redesign work.

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
report = Path('docs/design/render-path-diagnostic-report.md')
assert report.exists(), 'missing report'
text = report.read_text()
for needle in ['trigger', 'variant', 'https://web-production-bcaf6.up.railway.app']:
    assert needle in text.lower() or needle in text, needle
print('PMI-007 report verification passed')
PY
```

## Stop conditions

- Any forbidden file is changed.
- The task requires package installation or package.json modification.
- No diagnostic narrowing is achieved.
- Verification (`typecheck`, `test`, `build`) fails.
- Fix would require Railway config changes, DB migration, or secret access.

## Required evidence

- Report path documenting compared variants, commands, findings, and known risks.
- Screenshot/image evidence paths for variants where possible.
- `git diff --name-only` output.
- Verification command outputs.

## Output requirements

- Post live progress updates to Paperclip during execution, not only at the end.
- Paperclip status: `ready_for_human_review` if all gates pass and narrowing is sufficient.
- Paperclip status: `failed_verification` if any gate fails.
- Do not mark `complete`.
