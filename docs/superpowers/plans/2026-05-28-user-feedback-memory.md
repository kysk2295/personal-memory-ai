# User Feedback Memory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let user corrections and feedback become private memories so the agent can learn from mistakes and preference edits.

**Architecture:** Add a deterministic `MemoryRecord` builder for feedback/correction events and expose it through the existing private API boundary. The feature stays local-first and user-scoped; no live LLM or Postgres secrets are required.

**Tech Stack:** TypeScript, Vitest, existing `MemoryStore`, existing API dispatcher.

---

### Task 1: RED Feedback Memory Tests

**Files:**
- Create: `src/lib/userFeedbackMemory.test.ts`
- Modify: `src/lib/personalMemoryApi.test.ts`

- [x] **Step 1: Add feedback record builder test**

Assert:

- correction text becomes a private `MemoryRecord`
- id starts with `mem_api_feedback_`
- source ref starts with `personal-memory-ai://feedback/`
- memory type is `reflection`
- topic tags include `agent feedback` and `correction`
- cited/target memory ids are preserved in raw text

- [x] **Step 2: Add API feedback persistence test**

Assert:

- `POST /api/feedback` creates a feedback memory for the request user
- another user's records are not changed or exported
- response includes `createdMemoryIds`

- [x] **Step 3: Run RED**

Run:

```bash
npx vitest run src/lib/userFeedbackMemory.test.ts src/lib/personalMemoryApi.test.ts
```

Expected: FAIL because the feedback module and API path do not exist.

### Task 2: Feedback Memory Implementation

**Files:**
- Create: `src/lib/userFeedbackMemory.ts`
- Modify: `src/lib/personalMemoryApi.ts`

- [x] **Step 1: Implement feedback memory builder**

Export `createUserFeedbackMemoryRecord(input)` using `normalizeMemoryRecord`.

- [x] **Step 2: Implement store persistence helper**

Export `saveUserFeedbackMemory({ store, userId, input })` returning `{ createdMemoryIds, record }`.

- [x] **Step 3: Add `/api/feedback` path**

Extend `PersonalMemoryApiPath` and `handlePersonalMemoryApiRequest` so `POST /api/feedback` calls `saveUserFeedbackMemory`.

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/userFeedbackMemory.test.ts src/lib/personalMemoryApi.test.ts
```

Expected: PASS.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-user-feedback-memory.md`

- [x] **Step 1: Update product plan**

Add L31 as user feedback/correction memory. Move next loop to UI affordance or staging smoke depending on secrets.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/userFeedbackMemory.ts src/lib/userFeedbackMemory.test.ts src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-user-feedback-memory.md
git commit -m "feat: add user feedback memory"
```
