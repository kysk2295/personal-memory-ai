# Personal Memory Agent Orchestrator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a domain service that turns one user's stored memories into Ask My Past Self, Decision Replay, Pattern, and graph evidence outputs.

**Architecture:** The orchestrator reads user-scoped `MemoryRecord`s from `MemoryStore`, runs existing deterministic domain engines, and returns a single evidence bundle. It does not call an LLM yet; it establishes the boundary that future LLM generation must obey.

**Tech Stack:** TypeScript, Vitest, existing `MemoryStore`, `askMyPastSelf`, `replayDecision`, `detectRepeatedPatterns`, and `buildGraphEvidence`.

---

## Task 1: Failing Agent Tests

**Files:**

- Create: `src/lib/personalMemoryAgent.test.ts`

- [ ] Write tests covering sufficient evidence, insufficient evidence, and user isolation.
- [ ] Run `npm test -- src/lib/personalMemoryAgent.test.ts`.
- [ ] Expected result: fails because `src/lib/personalMemoryAgent.ts` does not exist.

## Task 2: Agent Implementation

**Files:**

- Create: `src/lib/personalMemoryAgent.ts`

- [ ] Implement `answerPersonalMemoryQuestion(input)`.
- [ ] Load records with `store.listByUser(userId)`.
- [ ] Run `detectRepeatedPatterns(records)`.
- [ ] Run `askMyPastSelf({ question, memories: records, patterns })`.
- [ ] Run `replayDecision(...)` only when `currentDecision` is provided.
- [ ] Run `buildGraphEvidence(...)` with current query, memories, ask, patterns, and optional replay.
- [ ] Return records, patterns, ask, replay, graphEvidence, and a privacy label.

## Task 3: Verify

- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.

## Task 4: Commit

- [ ] Commit locally.
- [ ] Commit message: `feat: add personal memory agent orchestrator`
