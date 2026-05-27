# Saved Memory Artifacts Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let useful AI answers, decision replays, and weekly reports become private saved artifacts that can be converted back into future `MemoryRecord`s.

**Architecture:** Add a `savedMemoryArtifact` domain module rather than a new cloud store. Saved artifacts keep citation ids, evidence labels, source workflow metadata, and deterministic ids; `saveArtifactAsMemoryRecord` persists them through the existing user-scoped `MemoryStore`.

**Tech Stack:** TypeScript, Vitest, existing `AskMyPastSelfAnswer`, `DecisionReplayResult`, `WeeklyReport`, `MemoryRecord`, and `MemoryStore`.

---

### Task 1: RED Saved Artifact Tests

**Files:**
- Create: `src/lib/savedMemoryArtifact.test.ts`

- [x] **Step 1: Write tests**

Cover:

- saved Ask artifact preserves question, answer, recommendation, evidence label, confidence, citations, and graph highlights
- weekly report artifact preserves date window, included memories, pattern citations, and aggregate tags
- converting an artifact to `MemoryRecord` keeps it private, citation-rich, and source-scoped to `personal-memory-ai://saved-artifacts/...`
- saving through `MemoryStore` is user-scoped

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/savedMemoryArtifact.test.ts
```

Expected: FAIL because `savedMemoryArtifact.ts` does not exist.

### Task 2: Saved Artifact Implementation

**Files:**
- Create: `src/lib/savedMemoryArtifact.ts`

- [x] **Step 1: Implement artifact types and deterministic id helper**

Create:

- `SavedMemoryArtifactKind`
- `SavedMemoryArtifact`
- `CreateSavedAskArtifactInput`
- `CreateSavedWeeklyReportArtifactInput`
- `SaveArtifactAsMemoryRecordInput`

- [x] **Step 2: Implement artifact creators**

Export:

```ts
createSavedAskArtifact(input)
createSavedDecisionReplayArtifact(input)
createSavedWeeklyReportArtifact(input)
```

Each artifact must keep `privacyScope: 'private'`, `citationMemoryIds`, `graphHighlightIds`, `evidenceLabel`, and `createdAt`.

- [x] **Step 3: Implement conversion and persistence**

Export:

```ts
savedArtifactToMemoryRecord(artifact)
saveArtifactAsMemoryRecord(input)
```

The converted record should use:

- `sourceType: 'api'`
- `sourceRef: personal-memory-ai://saved-artifacts/${artifact.id}`
- `memoryType: 'reflection' | 'decision' | 'pattern'` based on artifact kind
- `topicTags` including `saved artifact`
- `extractionStatus: 'ready'`

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/savedMemoryArtifact.test.ts
```

Expected: PASS.

### Task 3: Product Plan + Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-27-saved-memory-artifacts.md`

- [x] **Step 1: Add L24 to product plan**

Record saved advice/report artifacts as `done-foundation`, and move the active next loop to memory detail/timeline surfaces plus multilingual query bridge.

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
git add src/lib/savedMemoryArtifact.ts src/lib/savedMemoryArtifact.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-saved-memory-artifacts.md
git commit -m "feat: add saved memory artifacts"
```
