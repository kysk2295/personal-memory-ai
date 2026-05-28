# Task Contract — PMI-009 Saved Artifact Persistence Through Capture API

## Task ID

`PMI-009`

## Status

`completed`

## Goal

Persist saved Ask, Decision Replay, and Weekly Report artifacts through the local private `/api/capture` path so they become user-scoped `MemoryRecord`s.

## Product context

- Phase: local execution loop aligned to Product Execution Plan L29
- Epic: saved artifact persistence through capture API
- Product goal: keep saved advice/report artifacts inside the user's private memory corpus so the graph, timeline, and future retrieval can cite them as real memories
- Privacy constraint: no secret exposure, no cross-user leakage, no remote push

## Allowed files

- `src/lib/personalMemoryApi.ts`
- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/App.tsx`
- `src/lib/appShellEvidenceLayout.test.ts`
- `scripts/verify-playwright-evidence.ts`
- `docs/product/product-execution-plan-2026-05-27.md`
- `docs/superpowers/plans/2026-05-28-saved-artifact-persistence.md`
- `artifacts/web-second-brain-product-surface/**`

## Forbidden files

- `.env*`
- `package.json`
- `package-lock.json`
- `railway.json`
- `.git/**`
- any file outside the allowed list

## Acceptance criteria

- `POST /api/capture` accepts a saved artifact payload in addition to fast diary capture input
- saved artifact payloads are persisted via `saveArtifactAsMemoryRecord`
- saved artifact persistence remains scoped to the active private vault user
- save buttons expose the artifact manifest and persist through `/api/capture` when served over HTTP
- static `file:` previews keep local saved-state behavior without requiring a server

## Required tests

- `src/lib/personalMemoryApi.test.ts`
- `src/lib/localHttpTransport.test.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- Playwright evidence assertions in `scripts/verify-playwright-evidence.ts`

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
npm run evidence:playwright
```

## Stop conditions

- any verification command fails
- artifact persistence leaks or mutates another user's records
- a required edit would touch a forbidden file
- secret/config access becomes necessary

## Required evidence

- passing test output for API, transport, build, and Playwright gates
- updated screenshot artifacts under `artifacts/web-second-brain-product-surface/`
- final changed-file list from `git diff --name-only`
- local commit hash for the bounded slice

## Output requirements

- leave the task at most `ready_for_human_review`
- report changed files, commands run, verification status, and known risks
- do not push to remote

## Historical verification result — 2026-05-28

- `git diff --name-only`: pending local changes remain in the allowed files plus this task contract
- `npm run typecheck`: passed
- `npm test`: passed (`31` files, `91` tests)
- `npm run build`: passed
- `npm run evidence:playwright`: failed before app assertions because `tsx` IPC pipe creation was denied under `/var/.../*.pipe`
- `node --import tsx ./scripts/verify-playwright-evidence.ts`: failed because headless Chromium was terminated by the sandbox (`SIGTRAP` / `kill EPERM`) before assertions completed
- `node --import tsx server.ts`: failed because the environment denied binding `0.0.0.0:3000` with `EPERM`

## Historical known risks

- saved artifact persistence code is not locally browser-verified in this environment
- no local commit was created because the required verification gate did not complete

## Completion update — 2026-05-28

- Implemented and committed saved artifact persistence through `/api/capture`.
- Live Ask answers now return saveable `ask_answer` artifacts and the web Save answer action posts artifact payloads through the private capture API.
- Playwright now verifies saved artifact action, persistence manifest, live Ask API response, and live Ask follow-up context.
- Current verification:
  - `npm run typecheck`: passed
  - `npm test`: passed (`43` files, `176` tests)
  - `npm run build`: passed
  - `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`: passed
  - `npm run cleanup:evidence`: passed dry-run with `selectedCount: 0`
  - `git diff --check`: passed
- Related commits:
  - `5a1e21d feat: return saveable live ask artifacts`
  - `1fc696e test: verify live ask follow-up context`

## Residual risk

- Production deploy and remote push remain intentionally gated by explicit user approval.
