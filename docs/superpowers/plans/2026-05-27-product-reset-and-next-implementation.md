# Product Reset and Next Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reset the local clone around the real product plan, remove RPI/Hermes execution noise, and prepare the next product implementation cycle for the Personal Memory AI web surface.

**Architecture:** Keep the repository as a static-rendered TypeScript product prototype with durable backend code preserved for the later PostgreSQL/pgvector phase. Treat `docs/product/*` as the product source of truth, `src/lib/*` as the domain engine, and `src/App.tsx` + `src/components/*` as the current web second-brain surface.

**Tech Stack:** TypeScript, Vitest, static HTML rendering via `tsx scripts/render-static.ts`, Node static server, PostgreSQL/pgvector repository code preserved for later staging.

---

## Current Source Of Truth

Use these as authoritative product documents:

- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
- `docs/product/product-master-plan-2026-05-26.md`
- `docs/product/compliance-matrix.md`
- `AGENTS.md`
- `docs/reins-engineering-workflow.md`

Treat `docs/PRD.md` as a supplemental earlier draft only. It must not override the three `docs/product` documents.

## Preserve / Remove Policy

Preserve:

- `src/App.tsx`
- `src/components/*`
- `src/lib/*`
- `db/migrations/0001_memory_records_pgvector.sql`
- `Dockerfile`
- `railway.json`
- `server.mjs`
- `scripts/render-static.ts`
- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
- `docs/product/product-master-plan-2026-05-26.md`
- `docs/product/compliance-matrix.md`
- `AGENTS.md`
- `docs/reins-engineering-workflow.md`

Remove:

- `TASKS/`
- `artifacts/`
- `docs/design/`
- `docs/plans/`
- `docs/rpi/`
- `docs/product/legacy-rpi-to-epic-mapping-2026-05-26.md`
- `scripts/build_korean_prd_pdf.py`

Do not remove:

- `src/lib/postgresMemoryStore.ts`
- `src/lib/createMemoryStore.ts`
- `src/lib/memoryStore.ts`
- `db/migrations/0001_memory_records_pgvector.sql`
- `Dockerfile`
- `railway.json`

## Task 1: Stabilize Cleanup Boundary

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create or modify: `README.md`
- Delete: `TASKS/**`
- Delete: `artifacts/**`
- Delete: `docs/design/**`
- Delete: `docs/plans/**`
- Delete: `docs/rpi/**`
- Delete: `docs/product/legacy-rpi-to-epic-mapping-2026-05-26.md`
- Delete: `scripts/build_korean_prd_pdf.py`
- Preserve: `docs/product/*.md`
- Preserve: `src/lib/postgresMemoryStore.ts`
- Preserve: `db/migrations/0001_memory_records_pgvector.sql`

- [ ] **Step 1: Check cleanup diff**

Run:

```bash
git status --short
```

Expected:

```text
D entries only for TASKS, artifacts, docs/design, docs/plans, docs/rpi, legacy-rpi mapping, and build_korean_prd_pdf.py
M package.json
M package-lock.json
?? README.md
```

If `Dockerfile`, `railway.json`, `db/migrations`, or `src/lib/postgresMemoryStore.ts` appear as deleted, restore them:

```bash
git restore --source=HEAD --worktree --staged Dockerfile railway.json db/migrations/0001_memory_records_pgvector.sql src/lib/postgresMemoryStore.ts src/lib/createMemoryStore.ts src/lib/memoryStore.ts
```

- [ ] **Step 2: Keep package metadata product-oriented**

Update `package.json` so the package name is:

```json
{
  "name": "personal-memory-ai"
}
```

Do not remove the existing scripts:

```json
{
  "build": "tsx scripts/render-static.ts",
  "start": "node server.mjs",
  "test": "vitest run",
  "typecheck": "tsc --noEmit -p tsconfig.json"
}
```

- [ ] **Step 3: Make README reflect the current local clone**

Create or update `README.md` with this content:

```markdown
# Personal Memory AI

Local product prototype for a private personal memory AI.

## Product

Personal Memory AI turns diary entries, notes, and imported Notion/Obsidian/Markdown records into MemoryRecords. The web surface shows a second-brain evidence graph. Ask My Past Self, Decision Replay, and Weekly Pattern Report must cite real memories or clearly state insufficient evidence.

## Source of Truth

- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
- `docs/product/product-master-plan-2026-05-26.md`
- `docs/product/compliance-matrix.md`
- `AGENTS.md`
- `docs/reins-engineering-workflow.md`

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
npm run start
```

Open `http://localhost:3000`.

## Structure

- `src/App.tsx`: static web product shell
- `src/components/*`: graph, evidence drawer, ask, replay, and pattern UI
- `src/lib/*`: MemoryRecord, import, ask, replay, pattern, graph evidence, and store logic
- `db/migrations/*`: PostgreSQL/pgvector durable memory schema
```

- [ ] **Step 4: Verify cleanup**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected:

```text
typecheck exits 0
Vitest reports 9 test files and 30 tests passing
build exits 0 and writes dist/index.html
```

- [ ] **Step 5: Commit local cleanup**

Commit only locally. Do not push.

```bash
git add -A
git commit -m "chore: reset repo around product source of truth"
```

## Task 2: Create Product-Implementation Spec

**Files:**

- Create: `docs/superpowers/specs/2026-05-27-web-second-brain-product-surface-design.md`

- [ ] **Step 1: Write the spec**

Create the spec with these sections:

```markdown
# Web Second-Brain Product Surface Design

## Product Goal

The web surface must make Personal Memory AI feel like a private memory workspace, not a developer graph demo. The graph is an evidence UI. The product value comes from memory-cited Ask My Past Self, Decision Replay, Weekly Pattern Report, and import/capture evidence.

## Required User-Facing Areas

1. Hero/value strip: "나보다 나를 더 잘 아는 개인 기억 AI"
2. Memory brain graph: central evidence graph with selected memory path
3. Ask My Past Self: question input, answer, citations, confidence, insufficient-evidence state
4. Evidence drawer: source, date, raw excerpt, why connected
5. Decision Replay: current decision, similar past decisions, outcomes, recommendation, uncertainty
6. Weekly Pattern Report: repeated emotions/decisions/outcomes with citations
7. Import/Capture entry points: fast diary capture and import preview access
8. Privacy/trust: local/prototype state, private-by-default copy, export/delete affordance

## Non-Negotiables

- No generic advice without citations.
- No decorative graph disconnected from MemoryRecords.
- No excessive internal implementation labels in user-facing copy.
- No fake/sample behavior described as production-ready.
- Frontend completion requires browser screenshot evidence.

## Initial Implementation Target

Improve the existing static web shell. Do not introduce a new framework. Keep static rendering through `renderAppShellDocument()`.

## Acceptance

- `npm run typecheck`, `npm test`, and `npm run build` pass.
- Initial browser screenshot shows graph, ask, evidence drawer, and action cards in one coherent product surface.
```

- [ ] **Step 2: Self-review the spec**

Run:

```bash
rg -n "TBD|TODO|later|placeholder|generic advice" docs/superpowers/specs/2026-05-27-web-second-brain-product-surface-design.md
```

Expected:

```text
No TBD/TODO/later/placeholder hits.
"generic advice" appears only in the Non-Negotiables section.
```

- [ ] **Step 3: Commit local spec**

```bash
git add docs/superpowers/specs/2026-05-27-web-second-brain-product-surface-design.md
git commit -m "docs: define web second-brain product surface"
```

## Task 3: Plan First Product UI Implementation Cycle

**Files:**

- Create: `docs/superpowers/plans/2026-05-27-web-second-brain-product-surface.md`

- [ ] **Step 1: Write implementation plan from the spec**

The implementation plan must cover these files:

```text
src/App.tsx
src/components/AskMyPastSelfPanel.tsx
src/components/DecisionReplayPanel.tsx
src/components/EvidenceDrawer.tsx
src/components/MemoryGraph.tsx
src/components/PatternPanel.tsx
src/lib/appShellEvidenceLayout.test.ts
```

The plan must include tests for:

```text
hero/value strip exists
ask answer includes citations or insufficient evidence
decision replay includes outcome citations
pattern panel includes evidence memory ids
evidence drawer shows source/date/raw excerpt/why connected
```

- [ ] **Step 2: Commit local implementation plan**

```bash
git add docs/superpowers/plans/2026-05-27-web-second-brain-product-surface.md
git commit -m "docs: plan web second-brain product surface implementation"
```

## Task 4: Execute The First Product UI Cycle

**Files:**

- Modify: `src/App.tsx`
- Modify: `src/components/AskMyPastSelfPanel.tsx`
- Modify: `src/components/DecisionReplayPanel.tsx`
- Modify: `src/components/EvidenceDrawer.tsx`
- Modify: `src/components/MemoryGraph.tsx`
- Modify: `src/components/PatternPanel.tsx`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`

- [ ] **Step 1: Use superpowers:executing-plans**

Before editing code, load:

```text
superpowers:executing-plans
```

Then execute only the plan from:

```text
docs/superpowers/plans/2026-05-27-web-second-brain-product-surface.md
```

- [ ] **Step 2: Verify code**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected:

```text
All commands exit 0.
```

- [ ] **Step 3: Browser evidence**

Run the app:

```bash
npm run start
```

Open:

```text
http://localhost:3000
```

Capture a screenshot showing:

```text
hero/value strip
memory brain graph
Ask My Past Self panel
Decision Replay or Weekly Pattern card
evidence drawer with citation/source/date/raw excerpt
```

Save it under:

```text
artifacts/web-second-brain-product-surface/local-first-screen.png
```

- [ ] **Step 4: Commit local implementation**

```bash
git add src/App.tsx src/components src/lib/appShellEvidenceLayout.test.ts artifacts/web-second-brain-product-surface/local-first-screen.png
git commit -m "feat: improve web second-brain product surface"
```

## Current Execution Stop Point

Stop after Task 1 unless Ko Yunseo explicitly approves proceeding to Task 2.

Reason:

- The repository currently has a cleanup diff.
- Product documents are now known to be authoritative.
- The next irreversible step is committing the local cleanup boundary.

## Verification Summary

Fresh commands already observed in this clone:

```text
npm test: 9 test files passed, 30 tests passed
npm run build: exit 0, dist/index.html generated
```

Run them again before any completion claim or commit.
