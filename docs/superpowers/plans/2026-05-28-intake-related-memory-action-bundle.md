# L102 Intake Related Memory Action Bundle

## Goal

After a diary paste/apply or Notion diary apply, the first-screen intake result should clearly show the user's immediate second-brain moment: the new diary memory, the related past-memory nodes, and the three grounded AI actions that can use those memories.

## Scope

- Add a compact related-memory bundle inside the intake result panel.
- Populate it from the currently selected related-memory evidence after import/apply.
- Expose Korean-first next actions for Ask, Decision Replay, Weekly Pattern, and guided session.
- Keep the bundle private/diary scoped and driven by actual rendered related memory ids, not decorative copy.

## Verification

- Add RED expectations to `appShellEvidenceLayout.test.ts`.
- Extend Playwright evidence to assert the related bundle appears after applying a diary draft.
- Run `npm run typecheck`, targeted tests, `npm test`, `npm run build`, `npm run evidence:service-flow`, `npm run evidence:playwright`, and `git diff --check`.
