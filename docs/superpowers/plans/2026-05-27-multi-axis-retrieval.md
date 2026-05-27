# Multi-Axis Retrieval Router Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a deterministic retrieval router that fuses keyword, semantic, graph, and temporal signals over private memory records and the new knowledge ledger.

**Architecture:** Add a focused `multiAxisMemoryRetrieval` module that uses `buildMemoryKnowledgeLedger(records)` for graph traversal signals while preserving the existing `memoryRetrieval` public contract. Keep provider embeddings optional; local tests use deterministic token and ledger signals so the feature works without secrets or network calls.

**Tech Stack:** TypeScript, Vitest, existing `MemoryRecord`, `MemoryStore`, `memoryKnowledgeLedger`, and `memoryRetrieval`.

---

### Task 1: RED Multi-Axis Retrieval Tests

**Files:**
- Create: `src/lib/multiAxisMemoryRetrieval.test.ts`

- [x] **Step 1: Write deterministic router tests**

Create tests that import `personalMemoryRecords`, `createMemoryStore`, and the new functions:

```ts
import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import {
  retrieveMultiAxisMemories,
  retrieveMultiAxisMemoriesFromRecords,
} from './multiAxisMemoryRetrieval';

describe('multi-axis memory retrieval router', () => {
  test('returns deterministic scored memories with per-axis explanations', () => {
    const first = retrieveMultiAxisMemoriesFromRecords({
      records: personalMemoryRecords,
      query: 'anxiety launch delay',
      limit: 3,
    });
    const second = retrieveMultiAxisMemoriesFromRecords({
      records: [...personalMemoryRecords].reverse(),
      query: 'anxiety launch delay',
      limit: 3,
    });

    expect(first).toEqual(second);
    expect(first.status).toBe('implemented');
    expect(first.evidenceLabel).toBe('sufficient_evidence');
    expect(first.ledgerCheckpointId).toMatch(/^checkpoint:sha-/);
    expect(first.axisWeights).toEqual({
      keyword: 1,
      semantic: 1.2,
      graph: 0.7,
      temporal: 0.15,
    });
    expect(first.retrievedMemoryIds).toEqual([
      'mem_launch_june_anxiety_scope_delay',
      'mem_launch_may_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(first.retrievedMemories[0]).toEqual(
      expect.objectContaining({
        memory: expect.objectContaining({ id: 'mem_launch_june_anxiety_scope_delay' }),
        axisScores: expect.objectContaining({
          keyword: expect.any(Number),
          semantic: expect.any(Number),
          graph: expect.any(Number),
          temporal: expect.any(Number),
        }),
        reasons: expect.arrayContaining([expect.stringContaining('keyword')]),
      }),
    );
  });

  test('uses ledger graph traversal to include linked memories that do not directly match the query text', () => {
    const result = retrieveMultiAxisMemoriesFromRecords({
      records: personalMemoryRecords,
      query: 'onboarding examples replay controls',
      limit: 4,
    });

    expect(result.retrievedMemoryIds[0]).toBe('mem_launch_june_anxiety_scope_delay');
    expect(result.retrievedMemoryIds).toEqual(
      expect.arrayContaining([
        'mem_launch_may_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ]),
    );
    const graphOnly = result.retrievedMemories.find(
      (entry) => entry.memory.id === 'mem_freeze_vs_feature_addition',
    );
    expect(graphOnly?.axisScores.graph).toBeGreaterThan(0);
    expect(graphOnly?.supportingEdgeIds).toEqual(
      expect.arrayContaining([
        expect.stringContaining('reinforces-pattern'),
      ]),
    );
  });

  test('keeps retrieval user-scoped through MemoryStore and reports insufficient evidence', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of personalMemoryRecords) {
      await store.create('user-a', record);
    }
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_onboarding_private',
      sourceRef: 'obsidian://other-user/onboarding',
    });

    const scoped = await retrieveMultiAxisMemories({
      store,
      userId: 'user-a',
      query: 'onboarding examples replay controls',
      limit: 5,
    });

    expect(scoped.retrievedMemoryIds).toContain('mem_launch_june_anxiety_scope_delay');
    expect(scoped.retrievedMemoryIds).not.toContain('mem_other_user_onboarding_private');

    const insufficient = await retrieveMultiAxisMemories({
      store,
      userId: 'user-a',
      query: 'gardening nutrition',
      limit: 5,
    });

    expect(insufficient).toMatchObject({
      evidenceLabel: 'insufficient_evidence',
      retrievedMemoryIds: [],
      insufficientEvidenceReason: 'No user-scoped MemoryRecord matched semantic, keyword, graph, or temporal retrieval gates.',
    });
  });
});
```

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/multiAxisMemoryRetrieval.test.ts
```

Expected: FAIL because `multiAxisMemoryRetrieval.ts` does not exist.

### Task 2: Multi-Axis Retrieval Implementation

**Files:**
- Create: `src/lib/multiAxisMemoryRetrieval.ts`

- [x] **Step 1: Implement result types and deterministic text helpers**

Add interfaces for axis scores, weights, retrieved memory entries, and results. Reuse normalization/tokenization logic locally so the module is standalone.

- [x] **Step 2: Implement scoring**

For each `MemoryRecord`:

- `keyword`: count query term occurrences in raw text, summary, source, memory type, decision, emotions, topics, projects, and people.
- `semantic`: count distinct query terms that overlap high-signal canonical fields: summary, outcome, topics, emotions, project tags, and decision signal.
- `graph`: build the ledger, find direct seed memories from keyword/semantic matches, then boost records that share typed ledger edge targets with the seeds.
- `temporal`: add a small freshness score only when keyword, semantic, or graph score is non-zero.

- [x] **Step 3: Implement public functions**

Export:

```ts
export function retrieveMultiAxisMemoriesFromRecords(
  input: RetrieveMultiAxisMemoriesFromRecordsInput,
): MultiAxisMemoryRetrievalResult

export async function retrieveMultiAxisMemories(
  input: RetrieveMultiAxisMemoriesInput,
): Promise<MultiAxisMemoryRetrievalResult>
```

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/multiAxisMemoryRetrieval.test.ts
```

Expected: PASS.

### Task 3: Preserve Legacy Retrieval Contract

**Files:**
- Modify: `src/lib/memoryRetrieval.ts`
- Modify: `src/lib/memoryRetrieval.test.ts` only if the legacy assertions need additional axis metadata checks.

- [x] **Step 1: Delegate legacy retrieval to the multi-axis router**

Keep `retrieveRelevantMemoriesFromRecords` and `retrieveRelevantMemories` signatures stable. Internally call `retrieveMultiAxisMemoriesFromRecords`, then map each multi-axis entry to the existing `RetrievedMemory` shape with `score` and `matchedTerms`.

- [x] **Step 2: Run legacy retrieval tests**

Run:

```bash
npx vitest run src/lib/memoryRetrieval.test.ts
```

Expected: PASS with existing API behavior preserved.

### Task 4: Product Plan + Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-27-multi-axis-retrieval.md`

- [x] **Step 1: Add L23 to product plan**

Record multi-axis retrieval router as `done-foundation`, and move the active next loop to saved advice/report artifacts plus detail/timeline surfaces.

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
git add src/lib/multiAxisMemoryRetrieval.ts src/lib/multiAxisMemoryRetrieval.test.ts src/lib/memoryRetrieval.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-multi-axis-retrieval.md
git commit -m "feat: add multi-axis memory retrieval"
```
