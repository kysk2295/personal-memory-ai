# PMI-016 — LLM Wiki Compiler Foundation

## Task ID

PMI-016

## Status

ready_for_hermes

## Source insight

Video reviewed: https://www.youtube.com/watch?v=zzggJanBCJw

The Obsidian example is a local LLM Wiki pattern: put immutable raw sources in `raw/`, let an agent compile them into interlinked markdown pages, then query the compiled wiki instead of only doing chunk-level RAG.

## Goal

Adopt the useful part of the Obsidian/LLM Wiki workflow inside Personal Memory AI without turning the product into an Obsidian clone.

Build the first small compiler foundation that turns existing MemoryRecord fixture data into deterministic wiki-like relationship nodes that the graph/evidence UI can consume.

## Why

The current graph UI is becoming benchmark-close visually, but the underlying product model still needs the stronger second-brain architecture shown in the video:

- raw sources are preserved
- generated pages/concepts are inspectable
- relationships are explicit
- questions answer from a pre-digested knowledge graph, not only runtime RAG chunks
- corpora/workspaces can stay compartmentalized

## Contract

Implement one bounded slice:

1. Add a compiler module that derives wiki-like nodes from existing memory fixtures.
2. Node types should include at minimum:
   - `source`
   - `concept`
   - `decision`
   - `pattern`
3. Every compiled node must include:
   - stable id
   - title
   - summary
   - source MemoryRecord ids
   - related node ids
   - citation ids
4. Add tests for deterministic output and citation preservation.
5. Add a subtle UI preview/marker showing that the graph is backed by compiled wiki relationships, not only raw memory nodes.
6. Preserve the current graph-first shell and avoid KPI/dashboard cards.

## Acceptance checks

- `npm run typecheck` passes.
- `npm test` passes.
- `npm run build` passes.
- Local production smoke passes on `/health/live` and expected markers.
- Commit and push to main.
- Railway `web` deploy succeeds.
- Live marker checks pass.
- Live browser screenshot captured.

## Non-goals

- Do not require Obsidian.
- Do not ingest the user’s real vault/files yet.
- Do not add Scripty/API-key dependencies.
- Do not build full vault sync.
- Do not replace pgvector/backend strategy.

## Product decision

Use the Obsidian/LLM Wiki idea as an internal architecture and optional compatibility path:

- Personal Memory AI remains the product surface.
- Obsidian remains an import/export/power-user compatibility target.
- Compiled wiki relationships become the bridge between raw memories and the graph UI.
