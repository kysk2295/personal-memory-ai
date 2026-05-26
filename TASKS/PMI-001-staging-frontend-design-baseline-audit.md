# PMI-001 — Staging Frontend Design Baseline Audit

## Task ID

PMI-001

## Status

ready_for_human_review

## Goal

Create a falsifiable baseline report for the current Railway staging frontend, identifying why it feels like a developer demo and what must change before any frontend polish task begins.

## Product context

The PRD says the web surface should feel emotionally trustworthy, calm, evidence-driven, and not like a data dump. Current staging renders, but Ko Yunseo rejected the design as not sufficiently considered. This task does not redesign or implement UI; it only captures verifiable baseline evidence and gap analysis.

## Allowed files

- `docs/design/staging-frontend-baseline-audit.md`
- `artifacts/design-baseline/*`
- `TASKS/PMI-001-staging-frontend-design-baseline-audit.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `server.mjs`
- `src/**`
- `db/**`
- `.env`
- `.env.*`
- any secret, token, OAuth, keychain, or Railway variable file

## Acceptance criteria

- Report includes current staging URL under audit.
- Report includes at least one real browser screenshot path captured from staging.
- Report identifies at least 5 concrete UI/product issues from the PRD/design principles.
- Report separates user-facing design issues from engineering/status issues.
- Report does not claim any frontend improvement was implemented.
- Report recommends 1–3 follow-up Reins Contracts, not broad redesign work.

## Required tests

No code tests are required because this is an audit/documentation-only task.

## Verification commands

```bash
git diff --name-only
python3 - <<'PY'
from pathlib import Path
required = [
  Path('docs/design/staging-frontend-baseline-audit.md'),
]
for path in required:
    assert path.exists(), f'missing {path}'
    text = path.read_text()
    assert 'https://web-production-bcaf6.up.railway.app' in text
    assert 'screenshot' in text.lower() or '스크린샷' in text
print('PMI-001 document verification passed')
PY
```

## Stop conditions

- Staging URL cannot be opened in a browser.
- Screenshot cannot be captured from the real staging URL.
- Any forbidden file is changed.
- The task attempts to implement UI changes.

## Required evidence

- Browser screenshot path from the current staging URL.
- Audit markdown report path.
- `git diff --name-only` output.

## Output requirements

- Paperclip status: `ready_for_human_review` if verification passes.
- Paperclip status: `failed_verification` if any gate fails.
- User report must include screenshot attachment path and audit report path.
- Do not mark `complete`.
