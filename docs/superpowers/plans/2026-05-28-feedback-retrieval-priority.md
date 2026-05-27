# Feedback Retrieval Priority Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make saved user correction memories influence future retrieval ranking.

**Architecture:** Treat feedback/correction memories as a first-class retrieval signal inside the existing multi-axis router. Add a feedback axis score and boost correction memories that match the query or point to retrieved memories, while preserving deterministic ordering and existing user scope boundaries.

**Tech Stack:** TypeScript, Vitest, existing multi-axis retrieval router.

---

### Task 1: RED Retrieval Tests

**Files:**
- Modify: `src/lib/multiAxisMemoryRetrieval.test.ts`

- [x] **Step 1: Add feedback priority test**

Create a feedback memory with topic tags `agent feedback` and `correction`, target text mentioning `citation first`, and a target memory id. Assert:

- feedback memory ranks first for a matching correction query
- `axisScores.feedback` is greater than 0
- reasons include feedback correction

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/multiAxisMemoryRetrieval.test.ts
```

Expected: FAIL because `axisScores.feedback` does not exist.

### Task 2: Retrieval Router Feedback Axis

**Files:**
- Modify: `src/lib/multiAxisMemoryRetrieval.ts`

- [x] **Step 1: Add feedback axis to scores and weights**

Add `feedback: 1.6` to `MultiAxisRetrievalScores` and `AXIS_WEIGHTS`.

- [x] **Step 2: Detect feedback memories**

Detect memories with topic tags `agent feedback` or `correction`, or source refs starting `personal-memory-ai://feedback/`.

- [x] **Step 3: Score feedback**

Score direct feedback matches and target-memory-linked matches:

- direct feedback text matching query terms gets feedback score
- if a feedback memory references a seed memory id in raw text, it gets feedback score

- [x] **Step 4: Include feedback reasons**

Add a reason string when feedback score is present.

- [x] **Step 5: Run focused tests**

Run:

```bash
npx vitest run src/lib/multiAxisMemoryRetrieval.test.ts src/lib/memoryRetrieval.test.ts src/lib/personalMemoryAgent.test.ts
```

Expected: PASS.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-feedback-retrieval-priority.md`

- [x] **Step 1: Update product plan**

Add L33 as feedback retrieval priority.

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
git add src/lib/multiAxisMemoryRetrieval.ts src/lib/multiAxisMemoryRetrieval.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-feedback-retrieval-priority.md
git commit -m "feat: prioritize feedback memories in retrieval"
```
