# PMI-016 Direction Note — Obsidian / LLM Wiki Gap Analysis

## Source reviewed

- Video: https://www.youtube.com/watch?v=zzggJanBCJw
- Transcript fetched: 2026-05-27
- Core pattern described: Obsidian vault + `raw/` source folder + LLM Wiki/Codex agent that compiles sources into interlinked markdown pages and lets the user query the generated wiki.

## What the video is actually doing

The Obsidian setup is not primarily a polished SaaS product. It is a local, file-first knowledge compiler:

1. Put raw sources into a vault folder, usually `raw/`.
2. Ask an agent such as Codex/Claude to ingest the raw corpus.
3. Agent creates generated markdown pages, tags, summaries, sources, dates, related links, and wikilinks.
4. Obsidian renders the generated pages and graph view.
5. User asks questions in the coding agent/chat context, which reads the wiki pages rather than doing only chunk-level RAG.
6. Recommendation from the video: keep corpora compartmentalized; one huge all-purpose vault becomes chaotic.

## Difference from Personal Memory AI today

### Obsidian / LLM Wiki approach

- File-first local vault.
- Generated markdown pages are the product surface.
- Obsidian graph is the default visual layer.
- Agent is trusted to mutate the wiki directly.
- Great for power users and fast setup.
- Weak for productized onboarding, mobile capture, multi-user auth, privacy boundaries, and consistent UX.

### Personal Memory AI direction

- Productized memory system rather than only a vault.
- MemoryRecord is the canonical structured unit.
- Web graph is the product UI and evidence surface.
- Ask My Past Self, Decision Replay, and Pattern Reports require stable citation behavior.
- Backend needs durable storage, user isolation, export/delete, and eventually sync/import integrations.
- UI must feel like a second-brain app, not a developer-only Obsidian workflow.

## Strategic conclusion

We should not replace Personal Memory AI with Obsidian. But we should adopt the Obsidian/LLM Wiki ingestion model as an internal and optional power-user layer.

Best product direction:

1. Keep Personal Memory AI as the main product surface.
2. Add an LLM Wiki-style compiler pipeline:
   - `raw/` immutable sources
   - generated entity/concept/decision/pattern pages
   - wikilinks and citations
   - compartmentalized workspaces/corpora
3. Let the graph UI render from compiled wiki relationships plus MemoryRecords.
4. Support Obsidian-compatible export/import so power users can use their vaults without making Obsidian mandatory.
5. Use pgvector/RAG only as retrieval support, not as the only memory model.

## Why this is better

The video highlights the key product insight: users trust a second brain more when the system pre-digests their corpus into stable, inspectable pages instead of only searching raw chunks at query time.

For us, that means the next backend/frontend direction should be:

- raw source → MemoryRecord
- MemoryRecord → compiled wiki nodes
- wiki nodes → graph edges
- graph selection → evidence/citation inspector
- question → answer from compiled pages + raw citation fallback

## Proposed next autonomous slice

PMI-016 should create the first product-side LLM Wiki compiler contract and fixture:

- Add a small compiler module that converts existing fixture MemoryRecords into wiki-like nodes:
  - concept nodes
  - source pages
  - decision/pattern pages
  - related links
  - source citations
- Add tests proving links/citations are deterministic.
- Surface the compiled wiki relationship count/preview in the current graph UI without making it look like KPI cards.
- Preserve live Railway deploy + screenshot workflow.

## Non-goals

- Do not depend on Obsidian as the required UI.
- Do not ask the user for Scripty/API keys.
- Do not implement full vault sync yet.
- Do not ingest all personal files automatically without explicit scope.

## Product stance

Yes, develop in this direction — but as a hybrid:

- Obsidian-compatible under the hood.
- Product-grade Personal Memory AI on top.
- Compartmentalized corpora rather than one chaotic universal graph.
