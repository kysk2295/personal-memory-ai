# RPI Backlog — Personal Memory AI App + Evidence Pipeline

This backlog explicitly includes app development. Backend/evidence contracts are not sufficient by themselves.

## Cycle 0 — Harness recovery

- Status: `active`
- Goal: Ensure one-cycle RPI runs record state/review reliably after the previous exit 143.
- Completion: state has a cycle entry and latest review exists.

## Cycle 1 — Pattern detector v1

- Files:
  - `src/lib/__fixtures__/personalMemoryRecords.ts`
  - `src/lib/patternDetector.ts`
  - `src/lib/patternDetector.test.ts`
- App follow-up required: Pattern panel consumes this output.

## Cycle 2 — Ask My Past Self contract

- Files:
  - `src/lib/askMyPastSelf.ts`
  - `src/lib/askMyPastSelf.test.ts`
- App follow-up required: Ask bar + answer card + citations + graph highlight.

## Cycle 3 — Decision Replay contract

- Files:
  - `src/lib/decisionReplay.ts`
  - `src/lib/decisionReplay.test.ts`
- App follow-up required: Decision Replay panel/modal + evidence drawer.

## Cycle 4 — Graph evidence adapter

- Files:
  - `src/lib/graphEvidence.ts`
  - `src/lib/graphEvidence.test.ts`
- App follow-up required: graph nodes/edges/highlight/evidence drawer use this adapter.

## Cycle 5 — Import preview contract and UI seam

- Files:
  - `src/lib/importPreview.ts`
  - `src/lib/importPreview.test.ts`
  - app component file(s) as needed
- App requirement: import preview visible with source/date/duplicate/extraction status.

## Cycle 6 — App fast diary capture contract/prototype

- Files:
  - `src/lib/fastDiaryCapture.ts`
  - `src/lib/fastDiaryCapture.test.ts`
- Requirement:
  - app surface is for quickly saving memories as diary entries
  - capture should be text-first, low friction, timestamped, and `MemoryRecord`-compatible
  - optional hints: emotion, decision, project, outcome
  - if native app tooling is absent, implement as clearly labeled app-capture contract/prototype in the current repo
- App follow-up required: native/PWA mobile capture UI can consume this contract.

## Cycle 7 — Web second-brain first-screen graph integration

- Files:
  - `src/App.tsx` or app shell equivalent
  - graph/panel/drawer components as needed
- Requirement:
  - first web screen is a central memory-brain graph, not a generic dashboard
  - daily diary entries captured from the app plus imported memory entries are visible as primary nodes
  - nodes connect by emotion, project, decision, outcome, and source
  - Ask My Past Self, pattern panel, import preview, Decision Replay access, and evidence drawer surround or support the graph
  - status labels are visible for planned/skeleton/fake/local-only areas
- Evidence: screenshot of the initial diary memory graph required.

## Cycle 7 — Ask + graph evidence visual flow

- Requirement:
  - user asks `이번에도 기능을 더 넣어야 할까?`
  - answer includes citations
  - graph highlights current question, memories, emotion, decision, outcome
  - evidence drawer opens with source/date/excerpt
- Evidence: screenshot required.

## Cycle 8 — Decision Replay visual flow

- Requirement:
  - user enters `MVP에 기능을 더 넣을지, 지금 배포할지`
  - UI shows similar past decisions, emotions, choices, outcomes, citations
  - graph highlights relevant nodes
- Evidence: screenshot required.

## Cycle 9 — Weekly Pattern Report / retention loop

- Requirement:
  - app displays weekly/recent pattern report with citations and actions/uncertainty.
- Evidence: output sample + screenshot or documented UI path.

## Cycle 10 — Capture new memory flow

- Requirement:
  - user can add a new memory manually
  - record becomes `MemoryRecord`
  - graph/evidence updates
- Evidence: screenshot required.

## Cycle 11 — Verification package

- Requirement:
  - typecheck/tests/build
  - local browser screenshot set
  - compliance matrix status update
  - Paperclip final checkpoint

## Do not mark complete until

- compliance matrix has no unacknowledged `planned` items for the local foundation scope;
- all fake/sample/skeleton states are labeled;
- app screenshots exist;
- Paperclip records test/build/screenshot paths.
