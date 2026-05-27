# Import Apply Undo State Model Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a deterministic import batch state model so preview, apply, skip, undo, and graph-visible created records can be tracked as one product workflow.

**Architecture:** Keep low-level store writes in `memoryIngestion.ts`, and add a focused state reducer/service for import batch UI state. The state model stores preview rows, applied memory ids, skipped preview ids, graph evidence ids, and undo availability without requiring React state.

**Tech Stack:** TypeScript, Vitest, existing `MemoryStore`, existing `ImportPreview`.

---

## Files

- Create: `src/lib/importBatchState.ts`
- Test: `src/lib/importBatchState.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Initial Preview State

- [ ] **Step 1: Write failing test**

```ts
test('creates pending state from import preview summary', () => {
  const preview = buildImportPreview({
    batchId: 'batch-state',
    createdAt: '2026-05-27T10:00:00.000Z',
    candidates: [
      {
        sourceType: 'markdown',
        sourceRef: 'markdown://daily.md',
        observedAt: '2026-05-27',
        rawText: 'I chose to finish import before adding agent polish.',
      },
    ],
  });

  expect(createImportBatchState(preview)).toMatchObject({
    batchId: 'batch-state',
    phase: 'preview',
    totalPreviewRecords: 1,
    appliedMemoryRecordIds: [],
    skippedPreviewRecordIds: [],
    undoEnabled: false,
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/importBatchState.test.ts`

Expected: FAIL because `src/lib/importBatchState` does not exist.

- [ ] **Step 3: Implement minimal state creation**

Create `src/lib/importBatchState.ts` with exported `createImportBatchState`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/importBatchState.test.ts`

Expected: PASS.

## Task 2: Applied State

- [ ] **Step 1: Write failing test**

```ts
test('marks applied state with created, skipped, and graph-visible records', () => {
  const state = markImportBatchApplied(createImportBatchState(preview), {
    createdMemoryIds: ['mem_new'],
    skippedPreviewRecordIds: ['import_preview_batch-state_1'],
    graphEvidenceRecords: [memoryRecord],
    undoAction: {
      type: 'undo_import_batch',
      batchId: 'batch-state',
      appliedMemoryRecordIds: ['mem_new'],
      enabled: true,
      label: 'Undo import',
    },
  });

  expect(state.phase).toBe('applied');
  expect(state.undoEnabled).toBe(true);
  expect(state.graphEvidenceMemoryIds).toEqual(['mem_new']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/importBatchState.test.ts`

Expected: FAIL because `markImportBatchApplied` does not exist.

- [ ] **Step 3: Implement minimal applied transition**

Add exported `markImportBatchApplied`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/importBatchState.test.ts`

Expected: PASS.

## Task 3: Undone State

- [ ] **Step 1: Write failing test**

```ts
test('marks undone state and disables undo after deleting applied ids', () => {
  const undone = markImportBatchUndone(appliedState, {
    deletedCount: 1,
    appliedMemoryRecordIds: ['mem_new'],
  });

  expect(undone.phase).toBe('undone');
  expect(undone.undoEnabled).toBe(false);
  expect(undone.deletedMemoryRecordIds).toEqual(['mem_new']);
  expect(undone.graphEvidenceMemoryIds).toEqual([]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/importBatchState.test.ts`

Expected: FAIL because `markImportBatchUndone` does not exist.

- [ ] **Step 3: Implement minimal undone transition**

Add exported `markImportBatchUndone`.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/importBatchState.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 4: Product Plan Status Update

- [ ] **Step 1: Mark L6 complete in product execution plan**

Update `docs/product/product-execution-plan-2026-05-27.md` so the feature inventory marks Import Apply/Undo state as `done-foundation`, and add L6 to completed loops.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/importBatchState.ts src/lib/importBatchState.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-import-apply-undo-state-model.md
git commit -m "feat: add import batch state model"
```
