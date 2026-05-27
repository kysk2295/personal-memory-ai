# Agent Retrieval Query Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the personal memory agent use multi-axis retrieval even when the user asks in Korean or with product-intent wording that does not directly match stored English memory text.

**Architecture:** Add a deterministic `memoryQueryBridge` module that expands Korean/user-intent phrases into retrieval terms, then integrate it into `answerPersonalMemoryQuestion` before pattern detection, Ask My Past Self, Decision Replay, and graph evidence. Keep all retrieval user-scoped through the existing `MemoryStore`.

**Tech Stack:** TypeScript, Vitest, existing `CurrentDecision`, `MemoryStore`, `retrieveMultiAxisMemoriesFromRecords`, and `personalMemoryAgent`.

---

### Task 1: RED Query Bridge Tests

**Files:**
- Create: `src/lib/memoryQueryBridge.test.ts`

- [x] **Step 1: Write query bridge tests**

Test that `buildMemoryRetrievalQuery`:

- preserves the original Korean question
- expands "기능을 더 넣어야 할까" into `feature addition`, `scope expansion`, `launch`, `anxiety`, `delay`, and `freeze`
- includes current decision emotions, choices, and topic tags
- dedupes expansion terms deterministically

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/memoryQueryBridge.test.ts
```

Expected: FAIL because `memoryQueryBridge.ts` does not exist.

### Task 2: RED Agent Retrieval Integration Tests

**Files:**
- Modify: `src/lib/personalMemoryAgent.test.ts`

- [x] **Step 1: Add agent retrieval assertions**

Extend the first agent test with a same-user unrelated calm memory and assert:

- `result.retrievalQuery.expandedQuery` includes `feature addition`
- `result.retrieval.retrievedMemoryIds` equals the loaded memory ids
- unrelated same-user memory is not loaded

Extend the weak-memory test to assert:

- `result.retrieval.evidenceLabel` is `insufficient_evidence`
- `result.loadedMemoryIds` is empty

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/personalMemoryAgent.test.ts
```

Expected: FAIL because `PersonalMemoryAgentResult` has no retrieval metadata and still loads all user memories.

### Task 3: Query Bridge Implementation

**Files:**
- Create: `src/lib/memoryQueryBridge.ts`

- [x] **Step 1: Implement types and deterministic expansion**

Export:

```ts
buildMemoryRetrievalQuery(input)
```

Return:

- `originalQuery`
- `expandedQuery`
- `expansions`
- `sourceTerms`

- [x] **Step 2: Run bridge tests**

Run:

```bash
npx vitest run src/lib/memoryQueryBridge.test.ts
```

Expected: PASS.

### Task 4: Agent Retrieval Integration

**Files:**
- Modify: `src/lib/personalMemoryAgent.ts`

- [x] **Step 1: Build retrieval query before reasoning**

Use `buildMemoryRetrievalQuery({ question, currentDecision })`.

- [x] **Step 2: Retrieve relevant memories before patterns**

Use `retrieveMultiAxisMemoriesFromRecords({ records: allUserMemories, query: retrievalQuery.expandedQuery, limit: 8 })`, and pass only `retrieval.memories` into pattern detection, Ask, Replay, and graph evidence.

- [x] **Step 3: Return retrieval metadata**

Add `retrievalQuery` and `retrieval` to `PersonalMemoryAgentResult`.

- [x] **Step 4: Run agent tests**

Run:

```bash
npx vitest run src/lib/personalMemoryAgent.test.ts src/lib/personalMemoryApi.test.ts
```

Expected: PASS.

### Task 5: Product Plan + Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-27-agent-retrieval-query-bridge.md`

- [x] **Step 1: Add L26 to product plan**

Record agent retrieval integration with multilingual query bridge as `done-foundation`, and move next loop to UI save actions for saved artifacts.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/memoryQueryBridge.ts src/lib/memoryQueryBridge.test.ts src/lib/personalMemoryAgent.ts src/lib/personalMemoryAgent.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-agent-retrieval-query-bridge.md
git commit -m "feat: bridge agent queries into memory retrieval"
```
