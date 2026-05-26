# Reins Engineering Workflow — Personal Memory AI

Status: active operating policy
Owner: Ko Yunseo
Role of Hermes: orchestration layer, not autonomous product generator

## Philosophy

PRD is product context. Tasks are executable contracts. Verification is mandatory. Failure stops progression.

The workflow is:

```text
PRD → Product Master Plan → Phase → Epic → Task Contract → Implementation → Verification → PR → Human Review
```

The goal is safe, verifiable, low-hallucination development — not maximum autonomous coding.

For Personal Memory AI frontend work, execution uses a hybrid cadence:
- keep Reins verification/review gates
- batch 2–4 tightly related subtasks inside one bounded frontend cycle
- stop after each cycle for browser-evidenced review
- do not let batch size justify PRD or benchmark reinterpretation

## Runtime roles

- Mac mini: orchestrator, verifier, browser/Playwright validation, git/GitHub control, Railway control.
- RPI workers: isolated implementation workers; backend/API/test focused; no production authority.
- Paperclip: audit ledger, task state, evidence storage, execution history. Paperclip is not proof of correctness.
- Ko Yunseo: product owner, UX reviewer, merge approval authority, production deployment authority.

## Core guards

Never:

- trust generated code without verification
- allow self-verified completion
- treat Paperclip logs as proof of correctness
- continue after failed verification
- mark frontend complete without real browser evidence
- describe mock/sample/fake behavior as production-ready
- modify package.json unless explicitly allowed
- install dependencies automatically
- access .env or secrets
- deploy to production
- merge to main automatically
- modify Railway config unless explicitly allowed
- rewrite architecture or perform uncontrolled refactors

## Reins Contract format

Every task must contain:

- Task ID
- Goal
- Product context
- Allowed files
- Forbidden files
- Acceptance criteria
- Required tests
- Verification commands
- Stop conditions
- Required evidence
- Output requirements

If any section is missing, stop and request or create decomposition before implementation.

## Task decomposition

Tasks must be small, isolated, testable, reviewable, and reversible.

Target size: one task ≈ 30–90 minutes implementation.

Good examples:

- Create `POST /api/memories` endpoint.
- Require citations in Ask My Past Self.
- Add graph node highlight opacity logic.

Bad examples:

- Build memory AI system.
- Make frontend good.
- Implement backend.

## Workflow

1. Read PRD context.
2. Update/check the Product Master Plan.
3. Choose the active Phase and Epic.
4. Create or refine the Task Contract.
5. Store task state in Paperclip.
6. Select one ready implementation cycle only.
7. Create or update an isolated git branch.
8. Execute implementation.
9. Run verification gates.
10. Generate evidence report.
11. Commit and push the completed task/cycle to `main` on GitHub.
12. Report the pushed commit and evidence to Ko Yunseo.

For frontend cycles, one implementation cycle may contain 2–4 tightly related subtasks under the same visual/theme objective, but must still stop at the same verification and review gate before push.

No automatic progression after failure.

## Verification gates

Base verification:

- allowed file check
- forbidden file check
- git diff analysis
- typecheck
- tests
- build
- API smoke tests where applicable
- evidence report

Frontend verification additionally requires:

- Railway staging deploy
- browser open success
- Playwright or browser screenshot capture
- screenshot attached to report
- human UX review

PNG existence alone is not proof. Mock UI renders are not proof.

## Failure handling

If any verification fails:

1. Stop immediately.
2. Update Paperclip status to `failed_verification`.
3. Generate audit report.
4. Do not continue loops.
5. Do not start next task.
6. Do not self-repair recursively forever.

## Paperclip record requirements

Every record must include:

- task id
- status
- branch
- changed files
- commands executed
- test results
- build results
- screenshot paths
- PR link
- confidence level
- known risks

## Product-specific rules

Personal Memory AI requirements:

- citation-based reasoning is mandatory
- generic advice is forbidden
- insufficient evidence must be explicit
- Ask My Past Self remains grounded in real memories
- Decision Replay remains grounded in past outcomes
- graph is evidence UI, not decorative visualization
- evidence drawer is a trust surface

If evidence quality is weak, return insufficient evidence instead of hallucinating.

## Frontend principles

The UI must feel emotionally trustworthy, calm, evidence-driven, and not like a developer demo.

Avoid:

- data dump feeling
- excessive graph complexity
- internal status exposure
- fake completeness signaling

Use:

- progressive disclosure
- restrained palette
- strong hierarchy
- citation visibility
- evidence-first interaction

## Completion policy

A task is never complete because Codex exited successfully, a partial TypeScript compile passed, an artifacts folder exists, screenshots exist without browser verification, or Paperclip contains logs.

A task is only `ready_for_human_review` after all gates pass.
