# PMI-003 — Evidence Drawer Trust Surface Copy and Structure

## Task ID

PMI-003

## Status

blocked_until_PMI-001_review

## Goal

Make the evidence drawer read as a trust surface that explains why an AI answer was produced, rather than as an internal debug/status panel.

## Product context

The PRD says the evidence drawer is a trust surface. Ask My Past Self and Decision Replay must remain grounded in real memories, citations, dates, and outcomes. The drawer should help users understand source, date, raw excerpt/summary, and why a memory is connected.

## Allowed files

- `src/components/EvidenceDrawer.tsx`
- `src/lib/graphEvidence.ts`
- `src/lib/graphEvidence.test.ts`
- `docs/design/evidence-drawer-trust-surface-report.md`
- `artifacts/evidence-drawer-trust-surface/*`
- `TASKS/PMI-003-evidence-drawer-trust-surface.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `server.mjs`
- `db/**`
- `.env`
- `.env.*`
- auth/payment/secret management files
- unrelated components outside allowed files

## Acceptance criteria

- Drawer shows source, date, citation id, and reason for connection for each evidence item.
- Drawer language is user-facing and calm, not internal-debug-like.
- Insufficient evidence state is explicit where evidence is weak.
- No generic advice is introduced.
- Graph evidence IDs remain stable and test-covered.

## Required tests

- `src/lib/graphEvidence.test.ts` must assert evidence drawer payload contains source/date/citation/reason fields where applicable.
- Existing tests must continue passing.

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Frontend evidence gate:

```text
Deploy to Railway staging only if explicitly approved for this task execution.
Open staging URL in real browser.
Capture screenshot focused on the evidence drawer into artifacts/evidence-drawer-trust-surface/.
Attach screenshot to report.
```

## Stop conditions

- Any forbidden file changes.
- Typecheck/test/build fails.
- Evidence drawer loses citation/source/date information.
- Browser screenshot cannot be captured when frontend execution proceeds.

## Required evidence

- Changed file list.
- Test/build outputs.
- Evidence drawer screenshot from real staging browser if frontend execution proceeds.
- Design/report markdown path.

## Output requirements

- Open PR after all gates pass.
- Paperclip status: `ready_for_human_review`, not `complete`.
- Report known risks, especially any sample/fake data that remains.
