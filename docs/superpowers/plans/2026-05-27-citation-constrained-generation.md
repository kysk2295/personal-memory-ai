# Citation Constrained Generation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an LLM boundary that only permits Ask, Decision Replay, and Report outputs grounded in supplied memory citations.

**Architecture:** Add a pure generation guard module that builds prompts from cited evidence, validates model-shaped output, and falls back to explicit insufficient evidence when citations are missing, unknown, or generic. This keeps external LLM provider wiring out of the domain contract.

**Tech Stack:** TypeScript, Vitest, existing `MemoryRecord`.

---

## Files

- Create: `src/lib/citationConstrainedGeneration.ts`
- Test: `src/lib/citationConstrainedGeneration.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Prompt Evidence Boundary

- [ ] **Step 1: Write failing test**

Test that the prompt payload contains only provided citation evidence and does not include unrelated memories.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/citationConstrainedGeneration.test.ts`

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement prompt builder**

Create `buildCitationConstrainedPrompt`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/citationConstrainedGeneration.test.ts`

Expected: PASS.

## Task 2: Output Validation

- [ ] **Step 1: Write failing test**

Test that generated output must include nonempty citation ids, and every citation id must be in the allowed evidence set.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/citationConstrainedGeneration.test.ts`

Expected: FAIL until validation is implemented.

- [ ] **Step 3: Implement validator**

Add `validateCitationConstrainedOutput`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/citationConstrainedGeneration.test.ts`

Expected: PASS.

## Task 3: Safe Generation Wrapper

- [ ] **Step 1: Write failing test**

Test that missing citations, unknown citations, and generic outputs return explicit insufficient evidence fallback.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/citationConstrainedGeneration.test.ts`

Expected: FAIL until wrapper is implemented.

- [ ] **Step 3: Implement wrapper**

Add `generateCitationConstrainedOutput({ evidence, input, generate })`.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npx vitest run src/lib/citationConstrainedGeneration.test.ts
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 4: Product Plan Status Update

- [ ] **Step 1: Mark L10 complete in product execution plan**

Update `docs/product/product-execution-plan-2026-05-27.md` so LLM Citation-Constrained Generation is `done-foundation`, L10 is completed, and L11 API Endpoints becomes next.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/lib/citationConstrainedGeneration.ts src/lib/citationConstrainedGeneration.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-citation-constrained-generation.md
git commit -m "feat: add citation constrained generation guard"
```
