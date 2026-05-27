# Gemini Provider Adapter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Attach a real Gemini REST provider implementation behind the existing citation-guarded LLM adapter.

**Architecture:** Add a small fetch-based provider that formats `CitationConstrainedPrompt` into Gemini `generateContent` requests and parses JSON-shaped model output from `candidates[].content.parts[].text`. Keep secrets outside return values and keep live calls gated by caller-provided config.

**Tech Stack:** TypeScript, Vitest, native fetch-compatible dependency injection, Gemini REST generateContent.

---

### Task 1: RED Gemini Provider Tests

**Files:**
- Create: `src/lib/geminiProvider.test.ts`

- [x] **Step 1: Add request formatting and response parsing tests**

Assert the provider:

- POSTs to `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- sends `x-goog-api-key`
- includes citation instructions and evidence in text parts
- parses JSON response text into answer/citation ids/recommendation/confidence
- does not expose API key in provider output

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/geminiProvider.test.ts
```

Expected: FAIL because `geminiProvider.ts` does not exist.

### Task 2: Gemini Provider Implementation

**Files:**
- Create: `src/lib/geminiProvider.ts`
- Modify: `src/lib/llmProviderRuntime.ts`
- Modify: `src/lib/llmProviderRuntime.test.ts`

- [x] **Step 1: Implement fetch-based provider**

Export `createGeminiCitationGuardedProvider({ apiKey, model, baseUrl?, fetch })`.

- [x] **Step 2: Parse Gemini text safely**

Extract all text parts from first candidate and parse JSON, including fenced JSON.

- [x] **Step 3: Attach provider from ready runtime config**

Export `createGeminiProviderFromRuntimeConfig(config, env, fetch)` returning provider or null without leaking secrets.

- [x] **Step 4: Run focused tests**

Run:

```bash
npx vitest run src/lib/geminiProvider.test.ts src/lib/llmProviderRuntime.test.ts src/lib/llmProviderAdapter.test.ts
```

Expected: PASS.

### Task 3: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-gemini-provider-adapter.md`

- [x] **Step 1: Update product plan**

Add L34 as Gemini provider adapter.

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
git add src/lib/geminiProvider.ts src/lib/geminiProvider.test.ts src/lib/llmProviderRuntime.ts src/lib/llmProviderRuntime.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-gemini-provider-adapter.md
git commit -m "feat: add gemini provider adapter"
```
