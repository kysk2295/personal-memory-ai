# Web Second-Brain Product Surface Design

## Product Goal

The web surface must make Personal Memory AI feel like a private memory workspace, not a developer graph demo. The graph is an evidence UI. The product value comes from memory-cited Ask My Past Self, Decision Replay, Weekly Pattern Report, and import/capture evidence.

The intended user experience is: the user writes a diary or imports existing notes, the system connects that record to relevant past memories, and the web workspace shows why those memories matter. This is not shared memory between people. It is private contextual linking inside one user's own second brain.

## Authoritative Inputs

- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
- `docs/product/product-master-plan-2026-05-26.md`
- `docs/product/compliance-matrix.md`
- `docs/PRD.md`
- `AGENTS.md`
- `docs/reins-engineering-workflow.md`
- Benchmark direction: `https://www.careerhackeralex.com/memory`

## Required User-Facing Areas

1. Hero/value strip: "나보다 나를 더 잘 아는 개인 기억 AI"
2. Memory brain graph: central evidence graph with selected memory path
3. Ask My Past Self: question input, answer, citations, confidence, insufficient-evidence state
4. Evidence drawer: source, date, raw excerpt, why connected
5. Decision Replay: current decision, similar past decisions, outcomes, recommendation, uncertainty
6. Weekly Pattern Report: repeated emotions/decisions/outcomes with citations
7. Import/Capture entry points: fast diary capture and import preview access
8. Privacy/trust: local/prototype state, private-by-default copy, export/delete affordance

## Privacy Contract

- Memory data is private by default.
- The product copy must not imply that personal diaries are broadly shared or public.
- Cloud sync may exist in a future phase, but it must be framed as user-controlled storage, not default centralized ownership.
- Export and delete affordances must be visible as product commitments, even before full backend implementation.

## Evidence Contract

- Every answer, pattern, and recommendation must cite specific memories or explicitly state insufficient evidence.
- Evidence should expose source, date, excerpt, tags, and connection reason.
- The UI must make the selected memory path legible. The graph can be expressive, but it cannot be decorative-only.
- Existing Notion, Obsidian, Markdown, or diary records must be treated as product input, not demo filler.

## Non-Negotiables

- No generic advice without citations.
- No decorative graph disconnected from MemoryRecords.
- No excessive internal implementation labels in user-facing copy.
- No fake/sample behavior described as production-ready.
- Frontend completion requires browser screenshot evidence.

## Initial Implementation Target

Improve the existing static web shell. Do not introduce a new framework. Keep static rendering through `renderAppShellDocument()`.

The next implementation pass should prioritize:

- clearer first-screen product framing;
- a graph workspace that resembles a private second brain;
- visible memory paths and evidence details;
- user-facing diary/import entry points;
- privacy controls and copy that match the PRD.

## Acceptance

- `npm run typecheck`, `npm test`, and `npm run build` pass.
- Initial browser screenshot shows graph, ask, evidence drawer, and action cards in one coherent product surface.
- The first viewport communicates private diary-to-memory workflow, not a public knowledge graph.
- Any AI answer UI includes citations or an insufficient-evidence state.
