# First Screen Diary Entry Dock Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the first screen start with action: quick diary capture or diary import, before the user has to understand the graph.

**Architecture:** Keep `/capture/` as the app-like quick diary surface and reuse the existing local import panel in the web shell. Add a first-screen entry dock that links to capture, focuses import, and explains that the graph/AI session follows from the new diary memory.

**Tech Stack:** Static TypeScript app shell, Playwright evidence script, existing local import/capture APIs.

---

### Task 1: Failing First-Action Evidence

**Files:**
- Modify: `scripts/verify-playwright-evidence.ts`

- [ ] Add assertions for `data-entry-dock="diary-start"`, quick diary action, diary import focus action, and Korean labels.
- [ ] Click the diary import focus action and assert `data-interaction-state="diary-import-focused"`.

### Task 2: First-Screen Entry Dock

**Files:**
- Modify: `src/App.tsx`

- [ ] Add an entry dock below the main product flow with:
  - `/capture/` quick diary link
  - import focus button
  - selected-memory session hint
- [ ] Add CSS so the dock does not overlap the graph and remains compact.
- [ ] Wire the import focus button to scroll/focus `[data-control="local-import-paste-text"]`.

### Task 3: Verification

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [ ] Update app shell tests for the entry dock.
- [ ] Run typecheck, tests, build, service-flow, Playwright, diff check.
