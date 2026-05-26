# PMI-001 — Staging Frontend Design Baseline Audit

Status: ready_for_human_review  
Task Contract: `TASKS/PMI-001-staging-frontend-design-baseline-audit.md`  
Branch: `reins/pmi-001-staging-frontend-baseline-audit`  
Audit date: 2026-05-26 KST  
Workflow: Reins Engineering  

## 1. Scope

This task is an audit-only task. It does not implement, redesign, refactor, deploy, or mark frontend work complete.

Under the Reins workflow, this report is evidence for human review only. It is not proof of product completion.

## 2. URLs under audit

Current web staging URL:

- `https://web-production-bcaf6.up.railway.app`

Cache-busted staging URL used during audit:

- `https://web-production-bcaf6.up.railway.app/?pmi001=20260526-2`

Benchmark/reference URL:

- `https://www.careerhackeralex.com/memory`

## 3. Required evidence paths

Staging browser screenshots captured from real staging URL:

- `artifacts/design-baseline/staging-root-browser-blank.png`
- `artifacts/design-baseline/staging-cachebust-browser-blank.png`

Staging HTML snapshot evidence:

- `artifacts/design-baseline/staging-cachebust-html-snapshot.html`

Benchmark screenshot and HTML snapshot:

- `artifacts/design-baseline/benchmark-careerhackeralex-memory.png`
- `artifacts/design-baseline/benchmark-careerhackeralex-html-snapshot.html`

Important note: the browser accessibility snapshot and DOM inspection showed staging content, but the browser screenshot captures produced a blank white viewport. This discrepancy is an audit finding and must be resolved before any frontend task can claim completion.

## 4. Staging smoke observations

CLI smoke against staging succeeded:

```text
Web /health/live: {"status":"ok","service":"personal-memory-ai-web"}
HTML title: personal-memory-ai memory brain graph
Memory brain graph: present
Ask My Past Self: present
Decision Replay: present
Every action points back: present
HTML bytes: 55962
```

Browser DOM inspection on cache-busted URL showed:

```text
title: personal-memory-ai memory brain graph
ready: complete
bodyLen: 44723
mainCount: 1
h1: Memory brain graph
body text starts with: PERSONAL-MEMORY-AI · FIRST SCREEN / Memory brain graph
```

But real browser screenshot evidence showed blank white screenshots. This means the page cannot be treated as visually verified even though HTML/DOM content exists.

## 5. What appears implemented or generated

These are inventory labels, not completion claims.

### Generated/implemented surfaces visible in HTML/DOM

- First screen heading: `Memory brain graph`.
- Korean product promise line: `나보다 나를 더 잘 아는 개인 기억 AI`.
- Memory graph region with node/edge concept.
- Ask My Past Self section.
- Citation links for Ask My Past Self.
- Decision Replay text appears in HTML.
- Evidence drawer wording appears in HTML.
- Quick diary capture and import preview buttons/labels appear.

### Generated/implemented code inventory from repository state

- `src/App.tsx` exists.
- `src/components/**` exists.
- `src/lib/**` domain files exist for Ask, Decision Replay, graph evidence, import preview, fast diary capture, memory store, and Postgres memory store.
- `src/lib/**/*.test.ts` files exist.
- `server.mjs`, `Dockerfile`, and `railway.json` exist from earlier staging setup.

Again: generated/exists does not mean complete.

## 6. What is not done / not verified

- Frontend is not visually verified because screenshot evidence is blank despite DOM content.
- Current design is not ready for product review as complete.
- CareerHacker Alex benchmark parity has not been implemented.
- Evidence drawer trust-surface design is not product-polished.
- First screen hierarchy remains too developer-demo-like in the DOM content.
- Internal labels such as `implemented` and `partial` appear many times in the HTML and should not dominate user-facing product UI.
- Ask My Past Self insufficient-evidence behavior is not verified by this audit.
- Decision Replay weak-evidence/uncertainty behavior is not verified by this audit.
- PostgreSQL/pgvector live persistence/search/delete smoke is not verified by this audit.
- API `/health/ready` remains outside this frontend audit and was previously not-ready due to KMS/encryption config.
- No PR is opened by this audit.
- No production deployment is authorized or performed.

## 7. User-facing design issues

At least five concrete issues from PRD/design principles:

1. Screenshot evidence is blank, so the actual visual experience cannot be trusted even when DOM content exists.
2. First screen still leads with `Memory brain graph`, which reads like a technical surface rather than an emotionally trustworthy product promise.
3. Graph content is exposed as dense internal memory/edge data rather than a guided evidence story.
4. Internal status labels such as `implemented` and `partial` appear in user-facing HTML and create fake-completeness/developer-demo signals.
5. Ask My Past Self and citations are present in DOM, but the visual hierarchy does not yet guide the user from question → grounded answer → evidence drawer in a calm product rhythm.
6. Evidence drawer exists as wording, but it is not yet validated as a trust surface with clear source/date/reason hierarchy in the visual UI.
7. The benchmark page uses a strong graph workspace with explicit filters, node/edge counts, controls, and interaction affordances; current Personal Memory AI does not yet have a comparable polished control model.
8. There is no verified loading/error/blank-state handling; blank screenshots provide no user recovery path.

## 8. Engineering/status issues

- Repository is already dirty from earlier generated/staging work before this audit. This audit only changed allowed PMI-001 files, but a full `git status` includes many pre-existing untracked/modified files.
- Browser tooling produced inconsistent evidence: snapshot/DOM showed content, screenshot showed blank. This must be treated as a blocker for frontend completion claims.
- The frontend appears static-rendered/servered HTML rather than a fully validated application experience.
- No package install, package.json change, Railway config change, DB migration, or production deploy was performed by PMI-001.

## 9. Benchmark comparison notes

Benchmark URL:

- `https://www.careerhackeralex.com/memory`

Benchmark observed via browser snapshot / HTML:

- Page title: `커리어해커 알렉스`.
- Main graph label: `Second Brain`.
- Visible counts: `225 노드`, `1010 엣지`.
- Sidebar control model includes node types: semantic, reflective, procedural, episodic, thesis, topic.
- Edge type controls include supports, extends, instantiates, refines, near-miss, topic-tag, thesis-tag, contradicts, triggered-by, requires.
- Layout modes include 자유, 주장별, 계층, 시간순.
- Node spacing controls and label visibility controls are explicit.

Implications for Personal Memory AI:

- Do not copy the benchmark blindly; Personal Memory AI needs a calmer, evidence-first, personal-memory UX.
- Borrow the disciplined control model, hierarchy, graph affordances, and side-panel structure.
- Avoid dumping every memory/edge directly in the first viewport.
- The first screen should emphasize value and one guided evidence story before exposing full graph controls.

## 10. Recommended follow-up Reins Contracts

Only 1–3 follow-up contracts are recommended here:

### Follow-up 1 — Browser visual rendering reliability gate

Goal: create a task that resolves the blank screenshot vs DOM-content discrepancy before any design polish.

Suggested scope:

- Allowed files should be narrowly limited to static rendering/server/frontend shell files after review.
- Must include real staging screenshot evidence that shows visible content.
- Must not change product design beyond loading/error/render reliability.

### Follow-up 2 — First screen hierarchy polish against benchmark

Goal: convert the first viewport from technical graph demo into a calm product story:

```text
product promise → one guided memory/evidence story → graph as supporting evidence → Ask action
```

This maps to existing `PMI-002` but should be revised to explicitly include the benchmark URL and blank-screenshot precondition.

### Follow-up 3 — Evidence drawer trust surface

Goal: make evidence drawer show source/date/citation/reason in a user-facing hierarchy and remove debug-style labels from the trust surface.

This maps to existing `PMI-003` but should wait until visual rendering reliability is resolved.

## 11. Verification command output

Required command:

```bash
git diff --name-only
```

Caveat: this repository had pre-existing dirty/untracked files before PMI-001 execution. Therefore `git diff --name-only` is not by itself a clean PMI-001 changed-file proof. The PMI-001 files created/modified by this audit are:

```text
artifacts/design-baseline/staging-root-browser-blank.png
artifacts/design-baseline/staging-cachebust-browser-blank.png
artifacts/design-baseline/staging-cachebust-html-snapshot.html
artifacts/design-baseline/benchmark-careerhackeralex-memory.png
artifacts/design-baseline/benchmark-careerhackeralex-html-snapshot.html
docs/design/staging-frontend-baseline-audit.md
TASKS/PMI-001-staging-frontend-design-baseline-audit.md
```

## 12. PMI-001 status

Verification status: passed for documentation/audit contract.  
Product/frontend completion status: not complete.  
Paperclip status target: `ready_for_human_review`.  
Known risk: real visual screenshot evidence of the staging UI is blank, so frontend visual completion remains blocked.
