# Related Context Result Evidence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make selected-memory related context remain visible after Ask, Decision Replay, and Weekly Report results are generated.

**Architecture:** The graph inspector already seeds related-memory context into shell-level state. This loop adds a result-level evidence marker so the user can see that the answer/report used the selected source memory and related past memories, not a detached generic query.

**Tech Stack:** TypeScript, static HTML renderer in `src/App.tsx`, Playwright evidence script, product execution plan docs.

---

### Task 1: Add Failing Browser Evidence

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`

- [ ] **Step 1: Write the failing Playwright assertions**

Add assertions after related Ask/Decision/Weekly actions are clicked and their live API calls complete:

```ts
assert(
  (await attribute(page, '.second-brain-shell', 'data-ask-result-context-source-memory')) === firstCitation,
  'Ask result should preserve the selected related-memory context source',
);
assert(
  Number(await attribute(page, '[data-context-result="ask-related"]', 'data-context-related-memory-count')) > 0,
  'Ask result should render a related-context evidence badge',
);
```

Repeat the same pattern for `data-replay-result-context-source-memory` / `data-context-result="replay-related"` and `data-weekly-result-context-source-memory` / `data-context-result="weekly-related"`.

- [ ] **Step 2: Run the evidence script and verify it fails**

Run: `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

Expected: FAIL because the result-level context markers do not exist yet.

### Task 2: Render Result-Level Context Evidence

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add a helper that renders/updates a context badge**

Create a helper near the live result render functions:

```js
const renderResultContextEvidence = (target, kind, context) => {
  if (!target || !context?.sourceMemoryId) return;
  const relatedMemoryIds = Array.from(new Set(context.relatedMemoryIds || [])).filter(Boolean);
  let badge = target.querySelector('[data-context-result="' + kind + '-related"]');
  if (!badge) {
    badge = document.createElement('div');
    badge.className = 'result-context-evidence';
    badge.setAttribute('data-context-result', kind + '-related');
    target.prepend(badge);
  }
  badge.setAttribute('data-context-source-memory', context.sourceMemoryId);
  badge.setAttribute('data-context-related-memory-count', String(relatedMemoryIds.length));
  badge.setAttribute('data-context-related-memories', relatedMemoryIds.join(','));
  badge.textContent = 'Selected memory context: ' + context.sourceMemoryId + ' + ' + relatedMemoryIds.length + ' related memories';
};
```

- [ ] **Step 2: Call the helper after each live result**

In `renderLiveAskResult`, use `lastAskFollowUpContext` to derive source and related ids. In `renderLiveReplayResult`, use `lastReplayRelatedContext`. In `renderLiveWeeklyReport`, use `lastWeeklyRelatedContext`.

- [ ] **Step 3: Expose shell markers**

Set:

```js
shell.setAttribute('data-ask-result-context-source-memory', sourceMemoryId);
shell.setAttribute('data-ask-result-context-related-memory-count', String(relatedMemoryIds.length));
```

Repeat for replay and weekly.

- [ ] **Step 4: Run the evidence script and verify it passes**

Run: `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

Expected: PASS.

### Task 3: Update Product Plan and Verify

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [ ] **Step 1: Add L86 to completed loop list and details**

Add `L86: related context result evidence.` and a short details section.

- [ ] **Step 2: Run full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow
PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright
git diff --check
```

Expected: all commands pass.
