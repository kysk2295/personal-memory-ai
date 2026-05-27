# Postgres Pgvector Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the local HTTP server to choose fixture or PostgreSQL/pgvector memory storage at runtime.

**Architecture:** Add a small runtime factory that owns backend selection, PostgreSQL pool creation, optional migration execution, fixture seeding, and shutdown. Keep `PostgresMemoryStore` as the repository implementation and keep secrets out of health/log outputs.

**Tech Stack:** TypeScript, Vitest, Node HTTP server, `pg`, PostgreSQL, pgvector.

---

### Task 1: Runtime Contract

**Files:**
- Create: `src/lib/memoryStoreRuntime.ts`
- Create: `src/lib/memoryStoreRuntime.test.ts`
- Modify: `package.json`
- Modify: `package-lock.json`

- [x] **Step 1: Add dependencies**

Run:

```bash
npm install pg
npm install --save-dev @types/pg
```

Expected: `package.json` includes runtime `pg` and dev `@types/pg`.

- [x] **Step 2: Write failing runtime tests**

Create tests that prove:

- fixture mode seeds local records without requiring Postgres
- Postgres mode requires `DATABASE_URL`
- Postgres mode creates a pool, optionally runs migration SQL, exposes only safe status, and closes the pool

Run:

```bash
npx vitest run src/lib/memoryStoreRuntime.test.ts
```

Expected: FAIL because `memoryStoreRuntime.ts` does not exist.

- [x] **Step 3: Implement runtime factory**

Create `createMemoryStoreRuntime(input)` with:

- `backendMode: 'fixture' | 'postgres'`
- `migrationStatus: 'not_applicable' | 'skipped' | 'applied'`
- `databaseUrlPresence: 'missing' | 'present'`
- `store: MemoryStore`
- `close(): Promise<void>`

Postgres mode accepts an injected `PgPoolConstructor`, runs migration only when `POSTGRES_AUTO_MIGRATE=true`, and never returns the raw database URL.

- [x] **Step 4: Verify focused tests**

Run:

```bash
npx vitest run src/lib/memoryStoreRuntime.test.ts
```

Expected: PASS.

### Task 2: Server Wiring

**Files:**
- Modify: `server.ts`
- Create: `src/lib/localServerHealth.ts`
- Create: `src/lib/localServerHealth.test.ts`
- Modify: `src/lib/localHttpTransport.test.ts` if needed

- [x] **Step 1: Wire server to runtime factory**

Modify `server.ts` so it imports `Pool` from `pg`, calls `createMemoryStoreRuntime`, seeds fixture memories only in fixture mode, and uses the returned store for API routes.

- [x] **Step 2: Add safe health payload**

Extend `/health/live` to include safe runtime metadata:

```json
{
  "status": "ok",
  "service": "personal-memory-ai-web",
  "memoryBackend": "fixture",
  "migrationStatus": "not_applicable",
  "databaseUrl": "missing"
}
```

No secrets may be printed.

- [x] **Step 3: Verify focused server/runtime behavior**

Run:

```bash
npm run typecheck
npm test
```

Expected: PASS.

### Task 3: Product Plan Update + Verification

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

- [x] **Step 1: Add L21 to the product plan**

Record that Postgres/pgvector runtime selection is implemented locally, while live DB credentials remain a deployment gate.

- [x] **Step 2: Run full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add package.json package-lock.json server.ts src/lib/memoryStoreRuntime.ts src/lib/memoryStoreRuntime.test.ts src/lib/localServerHealth.ts src/lib/localServerHealth.test.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-postgres-pgvector-runtime.md
git commit -m "feat: wire postgres pgvector memory runtime"
```
