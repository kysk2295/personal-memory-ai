# PMI-017 — MemoryAtom Architecture Foundation

## Task ID

PMI-017

## Status

ready_for_hermes

## Goal

Apply the strongest shared architecture ideas from these references into Personal Memory AI's internal memory model:

- Career Hacker Alex — `https://www.careerhackeralex.com/sharings/second-brain-architecture.html`
- Hindsight docs — `https://hindsight.vectorize.io/`
- Karpathy LLM Wiki gist — `https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f`

Build one bounded slice that upgrades the current `MemoryRecord -> compiled wiki graph` demo into a more canonical `MemoryAtom` foundation with provenance, versioning, freshness, and memory-operation semantics.

## Product context

Personal Memory AI is a citation-based personal memory product where the graph is evidence UI, not the product itself. The app should automatically compile diary/imported memories into trustworthy, citable, queryable memory structures without requiring the user to manually maintain an Obsidian vault.

## Reference insights to apply in this slice

### From Career Hacker Alex

- canonical thought/claim unit rather than only raw note chunks
- typed metadata such as claim, origin, meaning version, confidentiality, sources
- typed edge / graph worldview
- freshness / still-valid framing

### From Hindsight

- retain / recall / reflect mental model
- observations and memory-bank style explicit memory operations
- retrieval should eventually be multi-strategy, not single-vector only
- agent memory should preserve state across sessions rather than start from zero

### From Karpathy LLM Wiki

- raw immutable source layer
- compiled persistent wiki layer
- schema-driven maintenance layer
- compiled knowledge should accumulate rather than be rediscovered on every query

## Scope for this task

Implement only the smallest useful architecture slice:

1. Add a `MemoryAtom` model or compiler output that expresses a canonical claim unit derived from `MemoryRecord`.
2. Include stable provenance-rich fields such as:
   - atom id
   - canonical claim text
   - claim fingerprint/hash
   - memory class/type
   - origin
   - meaning version
   - privacy/confidentiality
   - source refs / raw-source handles
   - citation memory ids
   - freshness status or freshness score basis
   - retain / recall / reflect relevance markers
3. Compile existing fixture records into these atoms deterministically.
4. Feed the compiled output into the existing graph shell in a subtle way:
   - preserve graph-first UI
   - expose canonical-memory/freshness markers instead of adding dashboard cards
5. Add tests proving deterministic compilation and provenance preservation.

## Out of scope

- real database schema migration
- live pgvector retrieval implementation
- full multi-strategy retrieval engine
- full reflection pipeline
- live user vault sync
- production deployment config changes
- secrets, OAuth, external private data

## Allowed files

- `TASKS/PMI-017-memory-atom-architecture-foundation.md`
- `docs/design/*.md`
- `src/lib/memoryRecord.ts`
- `src/lib/__fixtures__/personalMemoryRecords.ts`
- `src/lib/appShellEvidenceLayout.ts`
- `src/lib/appShellEvidenceLayout.test.ts`
- `src/lib/llmWikiCompiler.ts`
- `src/lib/llmWikiCompiler.test.ts`
- `src/App.tsx`
- new helper modules under `src/lib/` that support this slice only

## Forbidden files

- `.env*`
- Railway config
- `package.json`
- lockfiles
- infra/deploy secrets
- files outside the allowed paths unless the contract is updated first

## Acceptance criteria

- current fixture `MemoryRecord`s compile into canonical memory atoms deterministically
- canonical atoms preserve citation memory ids and source refs
- compiled output exposes freshness or validity semantics in a deterministic way
- compiled output includes explicit retain/recall/reflect semantics or equivalent operation markers
- graph-first shell remains intact; no KPI dashboard regression
- UI contains subtle live markers showing canonical-memory architecture is now present

## Required tests

- deterministic compiler test with reversed input order
- provenance/citation preservation test
- freshness / operation marker test
- existing app shell render tests updated for new markers

## Verification commands

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

## Stop conditions

Stop immediately if:

- changes would require modifying forbidden files
- scope expands into backend migrations or package installs
- verification fails
- the graph-first shell would need a full redesign instead of a bounded architecture slice

## Required evidence

- changed file list
- test/build command outputs
- local HTML marker proof for canonical-memory markers
- concise note describing exactly which reference ideas were applied now vs deferred

## Output requirements

Final report must explicitly separate:

1. **Applied now**
2. **Deferred / not yet applied**
3. **Why the chosen slice fits the PRD and benchmark references**
