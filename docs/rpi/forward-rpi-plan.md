# Forward RPI Plan — Personal Memory AI

## Correct product split

- App: fast diary/memory capture surface. The user quickly saves memories as diary entries.
- Web: second-brain graph/analysis surface. The user sees captured/imported memories as a brain-like graph and asks/replays decisions with evidence.
- Railway: staging/production hosting surface for the web/API/DB once the local product loop is visible and verified.
- PostgreSQL + pgvector: persistent memory/vector database for production/staging retrieval, semantic search, graph evidence, per-user isolation, export, and hard delete. Local prototype may use fixtures/in-memory state, but Railway staging must move durable memories/embeddings into Postgres/pgvector.

## Current verified foundation

- Pattern detector contract
- Ask My Past Self contract
- Decision Replay contract
- Graph Evidence contract, manually recovered and TypeScript verified
- App fast diary capture contract
- Import preview contract

## Phase A — Finish local product loop

### A1. Web second-brain first screen

- Build the first web screen as a central memory-brain graph.
- Diary entries captured from the app and imported records are primary nodes.
- Nodes connect by emotion, decision, project, outcome, source, and pattern.
- Evidence drawer opens from nodes.
- Completion evidence: local browser screenshot.

### A2. Ask My Past Self visual flow

- Wire Ask input into the graph/evidence contracts.
- Show answer, recommendation, citations, confidence, and graph highlights.
- Completion evidence: screenshot with cited answer and highlighted graph path.

### A3. Decision Replay visual flow

- Wire current decision input into replay results.
- Show similar past decisions, emotions, choices, outcomes, citations, and uncertainty/recommendation.
- Completion evidence: screenshot with decision replay and highlighted graph path.

### A4. Weekly pattern report and capture loop

- Show weekly/recent pattern report with citations.
- Make the new-memory capture prototype update MemoryRecord-compatible state and graph evidence.
- Completion evidence: screenshot or documented UI path.

### A5. Local verification package

- Typecheck, tests, build.
- Local browser run.
- Screenshots for first graph, Ask, Decision Replay, import preview, capture/report.
- Frontend completion reports to Ko Yunseo must attach the actual images with `MEDIA:/absolute/path/to.png`, not just mention screenshot paths.
- Update compliance matrix statuses.

## Phase B — Railway staging readiness

### B1. Inspect deploy shape without secrets

- Identify whether current repo needs a frontend-only deploy, API service, database, or all three.
- Check package scripts, build output, server/API presence, persistence requirements.
- Confirm where PostgreSQL/pgvector integration belongs: API persistence layer, vector embedding storage, semantic search, graph evidence lookup, export/delete, and per-user isolation.
- Do not print secrets or env values.

### B2. Railway CLI/project verification

- Verify Railway CLI login/project link if already configured.
- If Railway auth is not active, use browserless login and ask only for public activation approval/code flow.
- Check project/service list and variable presence with redacted `present/missing` reports only.

### B3. Staging deploy

- Add or update Railway config for the web surface and any API service required.
- Configure Railway PostgreSQL with pgvector for durable memory records and embeddings.
- Configure non-secret variables directly where safe, including backend mode and vector dimensions when supported.
- User-entered secrets remain in Railway dashboard/variables and are checked only by presence.
- Deploy to Railway staging.

### B4. Staging smoke tests

- Verify live URL loads.
- Verify health endpoints if an API exists.
- Verify Railway Postgres env presence without printing connection strings.
- Verify pgvector extension/vector type/migration status.
- Verify vector smoke: insert/search/delete, per-user isolation, export, hard delete.
- Verify import/capture sample data can render the second-brain graph.
- Verify no secret values are logged.

## Phase C — Private beta hardening

- Auth/user boundary if multi-user or public staging is enabled.
- Persistent database/storage if local/sample state is insufficient.
- Delete/export/undo guardrails.
- Error/loading/empty states.
- Mobile capture handoff: native app, PWA capture, or separate minimal mobile capture app depending on chosen scope.

## Operating rules

- Continue automatically with `review_gate=none` unless blocked by compile/test/deploy/auth/manual secret entry.
- Send checkpoints for new cycles or blockers.
- Never expose `.env`, tokens, OAuth codes/secrets, Railway variables, DB URLs, or API keys.
- If secrets already exist in Railway, the agent can use them by deploying/running presence checks, but must not read or print their values.
