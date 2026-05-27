# Web Second-Brain Product Surface Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:test-driven-development for code changes and superpowers:verification-before-completion before claiming completion.

**Goal:** Turn the current static graph shell into a clearer private second-brain product surface. The first screen must communicate: diary/imported memories become a private graph; Ask My Past Self and Decision Replay answer only through cited memories; evidence is visible, inspectable, and not framed as public shared memory.

**Architecture:** Keep the existing static renderer. `renderAppShellDocument()` remains the page entry point. `buildInitialAppShellEvidenceLayout()` remains the data contract. Product panels are rendered from existing component functions instead of duplicating important evidence markup in `src/App.tsx`.

**Tech Stack:** TypeScript, Vitest, static HTML rendering via `tsx scripts/render-static.ts`, Node static server.

---

## Source Inputs

- `docs/superpowers/specs/2026-05-27-web-second-brain-product-surface-design.md`
- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
- `docs/product/product-master-plan-2026-05-26.md`
- `docs/product/compliance-matrix.md`
- `docs/PRD.md`
- Benchmark direction: `https://www.careerhackeralex.com/memory`

## Files

- Modify: `src/App.tsx`
- Modify: `src/components/AskMyPastSelfPanel.tsx`
- Modify: `src/components/DecisionReplayPanel.tsx`
- Modify: `src/components/EvidenceDrawer.tsx`
- Modify: `src/components/MemoryGraph.tsx`
- Modify: `src/components/PatternPanel.tsx`
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Create: `artifacts/web-second-brain-product-surface/local-first-screen.png`

## Task 1: Add Failing Product-Surface Tests

- [ ] Update `src/lib/appShellEvidenceLayout.test.ts` before implementation.
- [ ] Add assertion that the first screen renders the north-star value strip: `나보다 나를 더 잘 아는 개인 기억 AI`.
- [ ] Add assertion that private diary/import workflow copy is visible and does not imply public sharing.
- [ ] Add assertion that Ask My Past Self renders either citations or an explicit insufficient-evidence state.
- [ ] Add assertion that Decision Replay renders outcome-backed citations for similar past decisions.
- [ ] Add assertion that Pattern/Weekly section exposes supporting memory ids.
- [ ] Add assertion that Evidence drawer renders source, date, raw excerpt/citation, and why-connected/trace copy.
- [ ] Add assertion that import/capture entry points are visible in the product surface.
- [ ] Run `npm test -- src/lib/appShellEvidenceLayout.test.ts` and confirm the new tests fail for missing product-surface requirements.

## Task 2: Recompose App Shell Around Product Areas

- [ ] Import and use `renderAskMyPastSelfPanel`, `renderDecisionReplayPanel`, `renderEvidenceDrawer`, and `renderPatternPanel` from `src/App.tsx`.
- [ ] Replace the hidden ledger-only product evidence section with a visible lower/right product rail that contains Ask, Decision Replay, Weekly Pattern, Import/Capture, and Evidence drawer areas.
- [ ] Keep the graph canvas as the central workspace and preserve current graph control behavior.
- [ ] Add a compact value strip near the top of the canvas with private diary-to-memory workflow language.
- [ ] Add visible privacy controls/copy: private by default, local prototype, export, delete.
- [ ] Keep copy honest: seed data is sample/private prototype data, not production cloud data.

## Task 3: Strengthen Component Evidence Markup

- [ ] `AskMyPastSelfPanel.tsx`: include a visible insufficient-evidence fallback branch for `status !== implemented` or empty citations; ensure implemented branch includes citation anchors.
- [ ] `DecisionReplayPanel.tsx`: include outcome labels and citation ids in each similar decision.
- [ ] `EvidenceDrawer.tsx`: include source, date, citation/raw excerpt, trace, and a user-facing reason label such as `why connected`.
- [ ] `PatternPanel.tsx`: rename visible surface from generic status dashboard to Weekly Pattern Report; include supporting memory ids and import/capture entry points.
- [ ] `MemoryGraph.tsx`: adjust aria/support copy so the graph is described as private memory evidence, not public knowledge sharing.

## Task 4: Styling And Responsive Polish

- [ ] Update `APP_SHELL_STYLES` in `src/App.tsx` for the new product rail/panel areas.
- [ ] Keep cards at 8px radius or less for repeated product panels unless an existing graph surface needs its current rounded canvas style.
- [ ] Avoid nested cards. Use panels as distinct repeated items or full-width rail sections.
- [ ] Ensure text does not overflow on mobile widths.
- [ ] Keep palette restrained but not one-note purple. Add neutral, ink, and one secondary accent for privacy/evidence states.

## Task 5: Verify

- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Start `npm run start` in the local clone.
- [ ] Capture browser evidence at `http://localhost:3000`.
- [ ] Save screenshot to `artifacts/web-second-brain-product-surface/local-first-screen.png`.

## Task 6: Commit Local Implementation

- [ ] Commit locally only. Do not push.
- [ ] Commit message:

```bash
feat: improve web second-brain product surface
```

## Acceptance

- Typecheck, tests, and build pass.
- Screenshot artifact exists.
- First viewport shows value strip, memory graph, Ask My Past Self, and Evidence drawer or its visible entry.
- Product surface includes Decision Replay or Weekly Pattern evidence.
- AI-facing recommendations remain citation-bound or explicitly insufficient.
- No deleted backend/store files: `src/lib/postgresMemoryStore.ts`, `src/lib/createMemoryStore.ts`, `src/lib/memoryStore.ts`, `db/migrations/0001_memory_records_pgvector.sql`, `Dockerfile`, `railway.json`.
