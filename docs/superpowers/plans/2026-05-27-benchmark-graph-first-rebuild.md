# Benchmark Graph First Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the first screen around the exact benchmark `https://www.careerhackeralex.com/memory`: left controls, dominant dark graph canvas, dense node field, and secondary evidence panels.

**Architecture:** Keep existing domain/product data, but change the visual composition. `MemoryGraph` should render a denser Obsidian-like graph language; `App` CSS should make graph the dominant first-screen surface and collapse the product rail into a secondary evidence drawer.

**Tech Stack:** TypeScript, Vitest, static HTML/CSS/SVG, local Chrome screenshot verification.

---

## Benchmark Anchors

- PRD promise: 개인 일기/기억을 근거 그래프로 연결하고 AI 답변은 citation으로만 정당화한다.
- Borrowed benchmark qualities: dark canvas, left graph controls, high-density nodes/edges, selected hub node, minimal first-screen card clutter.
- Must remain unchanged: Ask, Evidence Drawer, Decision Replay, Weekly Report, import/capture contracts remain in DOM and product flow.
- Screenshot evidence: before/after local screenshot plus saved benchmark screenshot.

## Files

- Modify: `src/App.tsx`
- Modify: `src/components/MemoryGraph.tsx`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Add artifact: `artifacts/web-second-brain-product-surface/graph-benchmark-after.png`
- Add artifact: `artifacts/web-second-brain-product-surface/graph-benchmark-mobile.png`

## Task 1: Render Contract

- [x] **Step 1: Write failing test**

Assert the rendered app exposes benchmark markers: `data-benchmark-reference`, `data-surface-mode="graph-first"`, `data-rail-mode="collapsed-evidence-drawer"`, and `data-ambient-node-count`.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: FAIL until graph-first markers exist.

- [x] **Step 3: Add markers and graph density metadata**

Patch `App.tsx` and `MemoryGraph.tsx`.

- [x] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: PASS.

## Task 2: Graph-First Visual Composition

- [x] **Step 1: Write failing assertions**

Assert CSS contains the dark graph-first selectors and collapsed evidence rail behavior.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/appShellEvidenceLayout.test.ts`

Expected: FAIL until CSS changes land.

- [x] **Step 3: Implement dark graph-first CSS**

Patch `App.tsx` styles.

- [x] **Step 4: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 3: Screenshot Evidence

- [x] **Step 1: Capture after screenshot**

Save `artifacts/web-second-brain-product-surface/graph-benchmark-after.png`.

- [ ] **Step 2: Commit locally**

Run:

```bash
git add src/App.tsx src/components/MemoryGraph.tsx src/lib/appShellEvidenceLayout.test.ts docs/superpowers/plans/2026-05-27-benchmark-graph-first-rebuild.md artifacts/web-second-brain-product-surface/graph-benchmark-before.png artifacts/web-second-brain-product-surface/careerhacker-memory-benchmark.png artifacts/web-second-brain-product-surface/graph-benchmark-after.png artifacts/web-second-brain-product-surface/graph-benchmark-mobile.png
git commit -m "feat: rebuild graph first benchmark layout"
```
