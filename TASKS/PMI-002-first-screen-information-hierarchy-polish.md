# PMI-002 — First Screen Information Hierarchy Polish

## Task ID

PMI-002

## Status

blocked_until_PMI-001_review

## Goal

Improve the first screen hierarchy so the page communicates “나보다 나를 더 잘 아는 개인 기억 AI” before showing dense graph details.

## Product context

The PRD requires the web first screen to present a memory-brain graph as evidence UI, not as decorative or overwhelming data visualization. The first screen should guide attention from value proposition → selected memory/Ask story → evidence drawer.

## Allowed files

- `src/App.tsx`
- `src/components/MemoryGraph.tsx`
- `src/components/EvidenceDrawer.tsx`
- `src/components/AskMyPastSelfPanel.tsx`
- `src/components/DecisionReplayPanel.tsx`
- `src/lib/appShellEvidenceLayout.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `docs/design/first-screen-hierarchy-report.md`
- `artifacts/first-screen-hierarchy/*`
- `TASKS/PMI-002-first-screen-information-hierarchy-polish.md`

## Forbidden files

- `package.json`
- `package-lock.json`
- `railway.json`
- `Dockerfile`
- `server.mjs`
- `db/**`
- `.env`
- `.env.*`
- API/backend persistence files
- auth/payment/secret management files

## Acceptance criteria

- Hero section foregrounds the product promise in Korean.
- First viewport reduces data-dump feeling by limiting visible graph complexity or using progressive disclosure.
- Evidence/citation visibility remains present above the fold.
- Internal implementation statuses are not overexposed in the user-facing first viewport.
- Ask My Past Self remains citation-based and does not become generic advice.
- Existing tests are updated only where needed to reflect intentional IA changes.

## Required tests

- Existing app shell/layout tests must pass.
- Add or update tests only within allowed files to assert that the first screen contains:
  - Korean product promise
  - citation/evidence wording
  - no excessive internal status label cluster in the hero

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
Capture screenshot into artifacts/first-screen-hierarchy/.
Attach screenshot to report.
```

## Stop conditions

- Any forbidden file changes.
- `npm run typecheck` fails.
- `npm test` fails.
- `npm run build` fails.
- Staging deploy is required but not explicitly approved.
- Browser screenshot cannot be captured.
- The UI removes citations/evidence grounding.

## Required evidence

- `git diff --name-only` output.
- Typecheck/test/build outputs.
- Real staging browser screenshot path if frontend execution proceeds.
- Short before/after design report.

## Output requirements

- Open PR after gates pass.
- Paperclip status: `ready_for_human_review`, not `complete`.
- Include known risks and screenshot path in the report.
