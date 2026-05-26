# AGENTS.md — Personal Memory AI

## Active workflow: Reins Engineering

This repository follows the Reins Engineering workflow requested by Ko Yunseo.

Hermes and any RPI worker are orchestration/implementation participants only. They are not autonomous product generators.

The required flow is:

```text
PRD → Product Plan → Phase → Epic → Task Contract → Implementation → Verification → PR → Ko Yunseo human review
```

Do not split a PRD directly into implementation tasks. First create or update a Product Master Plan, then define Phases and Epics, then decompose each Epic into small Reins Contract tasks.

## Role boundaries

### Hermes / Orchestrator

Allowed:

- read PRD/context documents
- create and maintain the Product Master Plan
- define Phases and Epics before task contracts
- decompose approved Epics into small executable Reins Contracts
- create `TASKS/*.md` contracts
- create isolated branches for one approved/ready task
- orchestrate implementation workers
- run verification gates
- collect evidence
- write audit reports
- open PRs
- wait for Ko Yunseo review

Not allowed:

- continue autonomous loops after a task
- mark work complete without verification
- treat Paperclip records as proof
- merge to `main`
- deploy production
- access `.env`, secrets, tokens, OAuth codes, passwords, keychain values
- apply production DB migrations
- modify `package.json` unless the Reins Contract explicitly allows it
- install dependencies unless explicitly allowed
- modify Railway config unless explicitly allowed

### RPI workers

RPI workers may execute exactly one task whose contract status is `ready_for_rpi`.

RPI workers must:

- obey allowed/forbidden file lists
- stop on any verification failure
- report changed files and commands run
- never self-promote to `complete`

Successful worker output status is at most:

```text
ready_for_human_review
```

### Paperclip

Paperclip is an audit ledger only.

Paperclip records must not be treated as proof of correctness or completion.

Every Paperclip record should include:

- task id
- status
- branch
- changed files
- commands executed
- test results
- build results
- screenshot paths if frontend
- PR link if opened
- confidence level
- known risks

## Reins Contract requirements

Every task in `TASKS/*.md` must include:

- Task ID
- Status
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

If a contract is missing any required section, stop before implementation.

## Verification gates

Base gates for all implementation tasks:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Additional checks:

- forbidden file check
- allowed file check
- git diff review
- API smoke tests when applicable
- evidence report

Frontend gates additionally require:

- Railway staging deploy, only if explicitly allowed by the task
- staging URL opens in a real browser
- Playwright/browser screenshot capture
- screenshot attached to the report
- Ko Yunseo human UX review

PNG file existence is not proof. Mock/static artifact renders are not proof.

## Failure policy

If any gate fails:

1. Stop immediately.
2. Do not continue to the next task.
3. Do not recursively self-repair.
4. Update Paperclip status to `failed_verification`.
5. Produce an audit report with commands, outputs, changed files, and risks.

## Product-specific non-negotiables

Personal Memory AI must remain:

- citation-based
- evidence-driven
- emotionally trustworthy
- calm, not developer-demo-like
- explicit about insufficient evidence

Forbidden product behavior:

- generic advice without citations
- fake/sample behavior described as production-ready
- graph as decorative visualization only
- excessive internal status exposure in user-facing UI
- claiming frontend completion without real staging browser evidence

## Current execution rule

Do not run RPI automatically from PRD. The only valid sequence is:

```text
PRD → Product Master Plan → Phase → Epic → Task Contract → Implementation
```

RPI workers are allowed only after a specific `TASKS/*.md` Task Contract is selected and is in `ready_for_rpi` status. Run at most one task after explicit instruction.
