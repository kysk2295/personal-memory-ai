# Personal Memory AI Implementation Plan — RPI with User Review Gates

> **For Hermes:** Execute with one-cycle RPI harness + user review gate after each cycle. Do not claim production/private beta until verification evidence exists.

**Goal:** Build the clarified Personal Memory AI product flow: existing journals/imports + capture → MemoryRecord → pattern detection → Ask My Past Self → Decision Replay → graph evidence.

**Architecture:** Keep the existing frontend/graph visual direction, but make it consume real evidence contracts instead of decorative sample data. The graph is an evidence layer over memory citations, patterns, decisions, emotions, and outcomes.

**Status vocabulary:** `implemented`, `partial`, `skeleton`, `fake/sample`, `planned`, `blocked`.

---

## Reuse Decision

### Reuse as-is / adapt

- Existing visual direction: dark graph-first UI, CareerHackerAlex-inspired detail direction.
- Existing graph shell / canvas / node-edge mental model if present in repo.
- Existing ask/search bar and drawer concepts if present.
- Newly implemented foundation files:
  - `src/lib/memoryRecord.ts`
  - `src/lib/importers/markdownImporter.ts`
  - `src/lib/importers/notionExportImporter.ts`
  - `src/lib/importBatch.ts`

### Do not reuse as completion evidence

- Static/sample graph data that is not backed by `MemoryRecord` citations.
- Generic AI answers without citation ids.
- UI polish that cannot highlight evidence nodes.
- Any skeleton/fake flow unless visibly labeled.

### Rebuild / newly implement

- Pattern detector.
- Ask My Past Self answer contract.
- Decision Replay contract.
- Graph evidence adapter.
- Import preview integration seam.
- Frontend wiring from real evidence contracts to graph/evidence drawer.

---

## Current Blocker Reality

The original repo path under `/Users/goyunseo/Documents/Codex/2026-05-25/personal-memory-ai` is intermittently failing with `Interrupted system call` during Codex/Python execution. Therefore:

1. Implementation contracts can be written to the original repo when filesystem writes succeed.
2. Autonomous RPI execution should use the readable mirror workspace:
   - `/Users/goyunseo/.hermes/workspaces/personal-memory-ai-rpi`
3. After mirror cycles pass review, changes should be copied/synced back to the original repo and verified there if possible.

---

## Phase 0 — Harness and Review Gate Stabilization

**ETA:** 0.5 day

**Objective:** Make automation observable and reviewable before more coding.

**Tasks:**

1. Keep active Paperclip tracking on `UNI-163` for the RPI harness.
2. Keep implementation tracking on `UNI-161` for product foundation.
3. Use mirror workspace for autonomous cycles until original checkout is readable.
4. Keep review files:
   - `/Users/goyunseo/.hermes/rpi/personal-memory-foundation-mirror/review/latest.md`
   - `/Users/goyunseo/.hermes/rpi/personal-memory-foundation-mirror/state.json`
   - `/Users/goyunseo/.hermes/rpi/personal-memory-foundation-mirror/constraints.md`
5. Run one bounded cycle at a time.
6. Stop after each cycle for user review.

**Verification:**

- RPI dry-run prints next task.
- State file updates after cycle.
- Review artifact exists.
- Telegram monitor reports only cycle boundary events.

---

## Phase 1 — Memory Import Foundation

**ETA:** 1 day from current state, mostly already done.

**Objective:** Make existing journals/imports the first-class data source.

**Already implemented / partial:**

- `MemoryRecord` contract.
- Markdown/Obsidian importer.
- Notion Markdown/CSV export importer.
- Import batch/dedupe/undo foundation.

**Remaining tasks:**

1. Add/verify fixture set for repeated decision pattern.
2. Add import coverage summary:
   - record count
   - date coverage
   - duplicate count
   - source types
   - extraction status
3. Add import status labels: `implemented`, `partial`, `failed`, `skipped`.
4. Verify TypeScript compile on mirror and original repo if possible.

**Completion gate:**

- Imported records can be converted to `MemoryRecord[]`.
- Duplicate records are identified.
- User can inspect what will be imported before applying.

---

## Phase 2 — Pattern Detector v1

**ETA:** 0.5–1 day

**Objective:** Detect repeated personal decision/emotion/outcome loops from memory records.

**Files:**

- Create: `src/lib/__fixtures__/personalMemoryRecords.ts`
- Create: `src/lib/patternDetector.ts`
- Create: `src/lib/patternDetector.test.ts`

**Required output:**

- pattern id
- title
- confidence
- supporting memory ids
- common emotion tags
- decision keywords/signals
- outcome tags/text
- explanation
- insufficient-evidence state

**Acceptance example:**

Detect this pattern:

```text
불안 / 부족한 느낌 → scope or feature expansion 욕구 → 출시 지연 or later regret
```

**Completion gate:**

- At least 3 supporting memories produce a medium/high-confidence pattern.
- Fewer than 2 supporting memories returns insufficient evidence.
- No generic product advice is generated here; only pattern evidence.

---

## Phase 3 — Ask My Past Self Contract

**ETA:** 1 day

**Objective:** Turn current user questions into evidence-backed answers with citations and graph highlight ids.

**Files:**

- Create: `src/lib/askMyPastSelf.ts`
- Create: `src/lib/askMyPastSelf.test.ts`
- Possibly modify: `src/lib/patternDetector.ts`

**Required input:**

```ts
{
  question: string;
  memories: MemoryRecord[];
  patterns: DetectedPattern[];
}
```

**Required output:**

- answer text
- recommendation
- evidence bullets
- citation memory ids
- confidence
- graphHighlightIds:
  - current question node
  - related memory nodes
  - emotion node, e.g. `불안`
  - decision node, e.g. `scope 확장`
  - outcome node, e.g. `출시 지연`
- insufficient-evidence fallback

**Contract example:**

Question:

```text
이번에도 기능을 더 넣어야 할까?
```

Expected recommendation:

```text
이번에는 기능을 더 넣기보다 freeze하고 사용자 피드백을 먼저 받으세요.
```

**Completion gate:**

- Answer cannot pass without citation ids.
- Graph highlight ids must correspond to evidence.
- Generic advice without memory evidence fails.

---

## Phase 4 — Decision Replay v1

**ETA:** 1 day

**Objective:** Compare a current decision with similar past decisions.

**Files:**

- Create: `src/lib/decisionReplay.ts`
- Create: `src/lib/decisionReplay.test.ts`

**Required output:**

- current decision
- similar past decisions
- emotion tags
- past choice
- outcome or unknown
- citation ids
- repeated pattern
- recommendation or uncertainty
- graphHighlightIds

**Completion gate:**

- Similarity is based on memory records and decision signals.
- Insufficient evidence returns explicit uncertainty.
- At least one fixture covers MVP feature-addition vs shipping decision.

---

## Phase 5 — Graph Evidence Adapter

**ETA:** 0.5–1 day

**Objective:** Give the frontend stable data to highlight evidence nodes and populate the right drawer.

**Files:**

- Create: `src/lib/graphEvidence.ts`
- Create: `src/lib/graphEvidence.test.ts`

**Required node types:**

- memory
- current_question
- current_decision
- pattern
- emotion
- decision
- outcome
- source

**Required drawer payload:**

- citation id
- source type
- source ref
- observed date
- raw excerpt
- summary
- status label

**Completion gate:**

- Ask/Pattern/Decision Replay outputs can all map to graph evidence.
- No graph highlight exists without a traceable current query or memory citation.

---

## Phase 6 — Frontend Integration

**ETA:** 2–3 days

**Objective:** Connect the existing UI shell to real evidence flows.

**Files likely involved:**

- `src/App.tsx`
- graph component files if present
- drawer/panel components if present
- import preview component files if present

**Tasks:**

1. Import preview surface:
   - source selector
   - preview records
   - duplicate count
   - apply/undo action
2. Ask My Past Self bar:
   - question input
   - answer output
   - citation list
   - graph highlight trigger
3. Pattern panel:
   - show detected patterns
   - show support count/confidence
   - click → highlight evidence
4. Decision Replay UI:
   - current decision input
   - similar decisions list
   - recommendation/uncertainty
   - evidence drawer
5. Evidence drawer:
   - citation source/date/raw excerpt
   - status labels
6. Graph highlight polish:
   - current question node
   - memory nodes
   - emotion/decision/outcome nodes
   - edge emphasis

**Completion gate:**

- User can import sample records, ask the freeze-vs-feature question, and see cited graph highlights.
- Decision Replay works with same evidence layer.
- Fake/sample data is visibly labeled or removed.

---

## Phase 7 — Verification and Demo Evidence

**ETA:** 1 day

**Objective:** Produce reviewable evidence that the product loop works.

**Tasks:**

1. Run typecheck/tests/build.
2. Run one local demo scenario:
   - import sample Notion/Obsidian records
   - run Ask My Past Self question
   - inspect graph highlights
   - run Decision Replay
3. Capture screenshots:
   - import preview
   - Ask answer with citations
   - graph highlights
   - Decision Replay
4. Update compliance matrix.
5. Update Paperclip final checkpoint.

**Completion gate:**

- Verified commands listed with pass/fail.
- Screenshots or explicit blocker recorded.
- No claim beyond actual status.

---

## Overall ETA

### Local PRD-quality foundation

**3–5 working days** from current state.

Includes:

- import foundation
- pattern detector
- Ask My Past Self contract
- Decision Replay contract
- graph evidence adapter
- first UI integration

### Private beta candidate

**5–8 working days** from current state.

Adds:

- polished frontend states
- import preview UX
- better duplicate handling
- weekly report
- mobile/responsive pass
- screenshots and test stability

### Production/private beta live

**1–2+ weeks** from current state.

Adds:

- auth
- DB
- user storage
- privacy/delete/export flows
- deployment
- live smoke tests

---

## Next Concrete Step

Because the mirror RPI process was terminated with exit code 143 before recording a cycle, resume with a shorter one-cycle pattern-detector run after confirming the runner command/timeout. Then review:

```text
/Users/goyunseo/.hermes/rpi/personal-memory-foundation-mirror/review/latest.md
```

Do not continue to Ask My Past Self until Pattern Detector v1 has review approval.
