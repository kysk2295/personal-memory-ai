# Memory Session Saveback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save a completed Guided Memory Session as a private memory so the session itself becomes future second-brain evidence.

**Architecture:** Extend saved artifacts with a `memory_session` kind, convert it to a private `MemoryRecord`, and add a session save action in the web shell that posts to `/api/capture` then rehydrates graph/timeline state.

**Tech Stack:** TypeScript domain tests, static web shell script in `src/App.tsx`, Playwright evidence.

---

### Task 1: Domain Contract

**Files:**
- Modify: `src/lib/savedMemoryArtifact.ts`
- Modify: `src/lib/savedMemoryArtifact.test.ts`

- [ ] Add `memory_session` artifact kind and creator.
- [ ] Verify `savedArtifactToMemoryRecord()` converts it into a private reflection memory with topic tags `saved artifact` and `memory session`.

### Task 2: Browser Flow

**Files:**
- Modify: `src/App.tsx`
- Modify: `scripts/verify-playwright-evidence.ts`

- [ ] Add `Save session` action to the Guided Memory Session panel.
- [ ] When session completes, build a saveable `memory_session` artifact from source memory, related memories, and current Ask/Replay/Weekly citation markers.
- [ ] Post artifact to `/api/capture`, set saved state, expose `data-last-saved-session-memory`, and rehydrate graph/timeline.
- [ ] Playwright verifies session saveback after import-to-session flow.

### Task 3: Product Plan and Full Gate

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [ ] Add L89.
- [ ] Run typecheck, tests, build, service-flow, Playwright evidence, diff check, commit, push, and deploy smoke.
