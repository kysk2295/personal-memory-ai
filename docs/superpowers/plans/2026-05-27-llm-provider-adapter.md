# LLM Provider Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a provider-agnostic LLM adapter boundary that sits behind the citation-constrained generation guard.

**Architecture:** Implement a pure adapter contract that accepts a provider object and always routes generated output through `generateCitationConstrainedOutput`. This does not call external APIs or require secrets.

**Tech Stack:** TypeScript, Vitest, existing citation-constrained generation module.

---

## Files

- Create: `src/lib/llmProviderAdapter.ts`
- Test: `src/lib/llmProviderAdapter.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: Provider Adapter Contract

- [x] **Step 1: Write failing test**

Assert a grounded provider output passes with citations, while a generic uncited provider output is rejected as insufficient evidence.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/llmProviderAdapter.test.ts`

Expected: FAIL because adapter module does not exist.

- [x] **Step 3: Implement adapter**

Create `src/lib/llmProviderAdapter.ts`.

- [x] **Step 4: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 2: Product Plan and Commit

- [x] **Step 1: Mark LLM answer generation done-foundation**

Update product execution plan to show provider adapter exists while live provider integration remains gated on secrets/config.

- [x] **Step 2: Commit locally**

Run:

```bash
git add src/lib/llmProviderAdapter.ts src/lib/llmProviderAdapter.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-llm-provider-adapter.md
git commit -m "feat: add citation guarded llm provider adapter"
```
