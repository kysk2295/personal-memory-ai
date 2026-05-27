# LLM Provider Smoke Harness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a secret-gated Gemini-first LLM provider configuration and smoke harness so live model wiring can be verified without leaking keys or producing uncited advice.

**Architecture:** Keep the existing citation-guarded provider adapter as the model boundary. Add a small runtime module that inspects env presence without returning secret values, builds a smoke plan, and runs a provider only when required config is present; blocked local runs should skip explicitly. Default the harness to Gemini because the user's live provider path is likely Gemini, while keeping the provider adapter generic.

**Tech Stack:** TypeScript, Vitest, existing citation guard adapter.

---

### Task 1: RED Runtime Config Tests

**Files:**
- Create: `src/lib/llmProviderRuntime.test.ts`

- [x] **Step 1: Add missing-secret readiness test**

Assert:

- missing `GEMINI_API_KEY` and `PMI_LLM_MODEL` returns `status: 'blocked'`
- required env vars are named
- secret values are not included in JSON output
- `canRunLiveSmoke` is false

- [x] **Step 2: Add ready readiness test**

Assert:

- present `GEMINI_API_KEY` and `PMI_LLM_MODEL` returns `status: 'ready'`
- model is copied from env
- API key value is redacted from JSON output
- `canRunLiveSmoke` is true

- [x] **Step 3: Add smoke runner tests**

Assert:

- blocked config returns `{ status: 'skipped' }`
- ready config with a fake provider runs through `generateWithCitationGuardedProvider`
- uncited fake output remains rejected by the citation guard

- [x] **Step 4: Run RED**

Run:

```bash
npx vitest run src/lib/llmProviderRuntime.test.ts
```

Expected: FAIL because `llmProviderRuntime.ts` does not exist.

### Task 2: Runtime Harness Implementation

**Files:**
- Create: `src/lib/llmProviderRuntime.ts`

- [x] **Step 1: Add env readiness resolver**

Export `resolveLlmProviderRuntimeConfig(env)` returning a redacted config object.

- [x] **Step 2: Add smoke plan builder**

Export `buildLlmProviderSmokePlan(config)` with:

- blocked reason
- required env vars
- safe command `npm test -- src/lib/llmProviderRuntime.test.ts`
- live smoke gate name

- [x] **Step 3: Add citation-guarded smoke runner**

Export `runCitationGuardedLlmSmoke(input)` that:

- returns skipped if config is blocked
- calls `generateWithCitationGuardedProvider` when config is ready and a provider is supplied
- never returns secret env values

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/llmProviderRuntime.test.ts src/lib/llmProviderAdapter.test.ts
```

Expected: PASS.

### Task 3: Product Plan and Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-llm-provider-smoke-harness.md`

- [x] **Step 1: Update product plan**

Add L30 as LLM provider smoke harness. Keep live provider calls gated on actual secrets.

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
git add src/lib/llmProviderRuntime.ts src/lib/llmProviderRuntime.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-llm-provider-smoke-harness.md
git commit -m "feat: add llm provider smoke harness"
```
