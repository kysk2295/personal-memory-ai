# Knowledge Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the local LLM Wiki compiler into a canonical private memory ledger with raw archive entries, canonical thoughts, typed edges, and checkpoints.

**Architecture:** Keep `llmWikiCompiler` as the compiler foundation and add a separate `memoryKnowledgeLedger` module for durable architecture concepts. The ledger is deterministic, citation-preserving, and ready to back future graph traversal retrieval.

**Tech Stack:** TypeScript, Vitest, existing `MemoryRecord`, existing `compileMemoryRecordsToWikiGraph`.

---

### Task 1: RED Ledger Tests

**Files:**
- Create: `src/lib/memoryKnowledgeLedger.test.ts`

- [x] **Step 1: Write tests**

Test that `buildMemoryKnowledgeLedger(records)`:

- is deterministic across input order
- creates immutable raw archive entries preserving raw text and source refs
- creates canonical thoughts linked to source archive entries and citations
- creates typed edges for raw citations, topics, emotions, projects, decisions, outcomes, sources, and patterns
- marks stale edges when all supporting atoms are stale
- emits a checkpoint summary for atomize/dedup/apply

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/memoryKnowledgeLedger.test.ts
```

Expected: FAIL because `memoryKnowledgeLedger.ts` does not exist.

### Task 2: Ledger Implementation

**Files:**
- Create: `src/lib/memoryKnowledgeLedger.ts`

- [x] **Step 1: Implement types and helpers**

Create raw archive, thought, edge, checkpoint, stats, and ledger interfaces.

- [x] **Step 2: Implement `buildMemoryKnowledgeLedger(records)`**

Generate:

- `rawArchiveEntries`
- `canonicalThoughts`
- `typedEdges`
- `checkpoint`
- `stats`

- [x] **Step 3: Run focused tests**

Run:

```bash
npx vitest run src/lib/memoryKnowledgeLedger.test.ts
```

Expected: PASS.

### Task 3: Product Plan + Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [x] **Step 1: Add L22 to product plan**

Record the knowledge ledger as the next foundation for graph traversal and multi-axis retrieval.

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
git add src/lib/memoryKnowledgeLedger.ts src/lib/memoryKnowledgeLedger.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-knowledge-ledger.md
git commit -m "feat: add canonical memory knowledge ledger"
```
