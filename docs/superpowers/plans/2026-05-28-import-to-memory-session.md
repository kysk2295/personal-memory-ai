# Import To Memory Session Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** After a diary/local import is applied, automatically select the new memory in the graph and make it ready for a Guided Memory Session.

**Architecture:** Reuse the app-shell rehydration and Cytoscape rebuild path after import apply. Pass the first created memory id into rehydration, select that graph node after rebuild, render related memories, and expose import handoff/session markers.

**Tech Stack:** TypeScript, browser script in `src/App.tsx`, Playwright evidence in `scripts/verify-playwright-evidence.ts`, product execution docs.

---

### Task 1: Browser Contract

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`

- [ ] **Step 1: Add failing assertions after local import apply**

After import apply and graph rebuild, read the created memory id and assert:

```ts
const importedMemoryId = (await attribute(page, '.second-brain-shell', 'data-import-session-source-memory')) || '';
assert(importedMemoryId, 'Import handoff should expose the imported memory session source');
assert((await attribute(page, '.second-brain-shell', 'data-active-memory')) === importedMemoryId, 'Import handoff should select the imported memory');
assert(Number(await attribute(page, '.second-brain-shell', 'data-import-session-related-memory-count')) > 0, 'Import handoff should expose related memories');
```

Then click `run-memory-session` and assert the session completes for the imported memory.

- [ ] **Step 2: Verify RED**

Run: `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

Expected: FAIL because import handoff markers do not exist.

### Task 2: Import Handoff Implementation

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Pass created memory id into rehydration**

Change `rehydrateAppShellAfterImport()` to accept an optional target memory id and call `selectHandoffMemoryFromGraph(targetMemoryId)` after `rebuildCytoscapeGraphFromModel(memoryGraph)`.

- [ ] **Step 2: Mark import session readiness**

After selecting the imported memory and rendering related memory evidence, set:

```js
shell.setAttribute('data-import-session-source-memory', targetMemoryId);
shell.setAttribute('data-import-session-related-memory-count', shell.getAttribute('data-related-memory-count') || '0');
shell.setAttribute('data-import-session-state', 'ready');
```

- [ ] **Step 3: Keep undo cleanup sane**

When import is undone, clear import session markers and leave the session panel in `idle` or `undone`.

### Task 3: Product Plan and Full Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [ ] **Step 1: Add L88**

Record `L88: import to guided memory session handoff`.

- [ ] **Step 2: Full gate**

Run typecheck, tests, build, service-flow, Playwright evidence, and diff check.
