# Weekly Report Schedule Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a local recurring weekly report schedule contract that can later be driven by cron, push, email, or app notifications.

**Architecture:** Create a pure scheduling model that evaluates whether a weekly report is due for a user, returns the exact report window, and emits an in-app notification payload without generating duplicate reports. Expose that contract through the private-vault API so the current owner boundary stays intact.

**Tech Stack:** TypeScript, Vitest, existing weekly report engine, existing private vault API dispatcher.

---

### Task 1: RED Weekly Schedule Model Tests

**Files:**
- Create: `src/lib/weeklyReportSchedule.test.ts`

- [x] **Step 1: Add schedule evaluation tests**

Add tests that assert:

- default schedule is enabled for the owner, Monday 09:00, Asia/Seoul, in-app notification
- Monday 09:05 local time is due and reports the previous Monday-Sunday window
- the same report id is not due again once `lastGeneratedReportId` matches
- disabled schedule returns not due

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/weeklyReportSchedule.test.ts
```

Expected: FAIL because `weeklyReportSchedule.ts` does not exist.

### Task 2: Weekly Schedule Model Implementation

**Files:**
- Create: `src/lib/weeklyReportSchedule.ts`

- [x] **Step 1: Implement schedule types and default schedule**

Add `WeeklyReportSchedule`, `WeeklyReportScheduleEvaluation`, and `createDefaultWeeklyReportSchedule`.

- [x] **Step 2: Implement deterministic due evaluation**

Add `evaluateWeeklyReportSchedule({ schedule, nowLocalDateTime, lastGeneratedReportId })`, date helpers, duplicate suppression, and notification payload generation.

- [x] **Step 3: Run focused model tests**

Run:

```bash
npx vitest run src/lib/weeklyReportSchedule.test.ts
```

Expected: PASS.

### Task 3: Private Vault Schedule API

**Files:**
- Modify: `src/lib/personalMemoryApi.ts`
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/localHttpTransport.test.ts`

- [x] **Step 1: Add API tests**

Add tests for `POST /api/report/weekly/schedule/evaluate` proving:

- it evaluates the private owner schedule
- it returns a generated weekly report when due
- it returns the in-app notification payload
- local HTTP transport keeps the endpoint owner-scoped

- [x] **Step 2: Run RED for API tests**

Run:

```bash
npx vitest run src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts
```

Expected: FAIL until the endpoint is implemented.

- [x] **Step 3: Implement schedule evaluation endpoint**

Add the endpoint to `PersonalMemoryApiPath`, read `nowLocalDateTime`, optional `lastGeneratedReportId`, and optional schedule overrides, evaluate the schedule, and generate the weekly report only when due.

- [x] **Step 4: Run focused API tests**

Run:

```bash
npx vitest run src/lib/weeklyReportSchedule.test.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts
```

Expected: PASS.

### Task 4: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-weekly-report-schedule.md`

- [x] **Step 1: Update product plan**

Add L36 as weekly report schedule foundation and mark scheduler/reminders as `done-foundation`.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/weeklyReportSchedule.ts src/lib/weeklyReportSchedule.test.ts src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-weekly-report-schedule.md
git commit -m "feat: add weekly report schedule evaluation"
```
