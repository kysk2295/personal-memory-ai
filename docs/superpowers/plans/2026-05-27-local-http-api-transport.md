# Local HTTP API Transport Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expose the existing private-vault API boundary through a local HTTP transport so `/capture/` quick-save can target a real `/api/capture` route.

**Architecture:** Add a small request/response adapter around `handlePrivateVaultMemoryApiRequest`, then use it from a TypeScript static/API server. Keep local seed data owner-scoped to `local-user` and avoid secrets or remote deployment.

**Tech Stack:** TypeScript, Node HTTP server, Vitest, existing `MemoryStore`, private vault API boundary.

---

## Files

- Create: `src/lib/localHttpTransport.ts`
- Test: `src/lib/localHttpTransport.test.ts`
- Create: `server.ts`
- Modify: `package.json`
- Keep: `server.mjs` as legacy static server fallback
- Modify: `docs/product/product-execution-plan-2026-05-27.md`

## Task 1: HTTP Transport Adapter

- [x] **Step 1: Write failing test**

Assert POST `/api/capture` JSON creates a private memory for session owner and GET `/api/export` returns only that owner data.

- [x] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/lib/localHttpTransport.test.ts`

Expected: FAIL because transport module does not exist.

- [x] **Step 3: Implement adapter**

Create `src/lib/localHttpTransport.ts`.

- [x] **Step 4: Run focused test**

Run: `npx vitest run src/lib/localHttpTransport.test.ts`

Expected: PASS.

## Task 2: TypeScript Local Server

- [x] **Step 1: Implement `server.ts`**

Serve `dist` static files and route `/api/*` to the local HTTP transport.

- [x] **Step 2: Update start script**

Change `npm start` to `tsx server.ts`.

- [x] **Step 3: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
```

Expected: all commands exit 0.

## Task 3: Local API Smoke and Commit

- [x] **Step 1: Restart local server**

Run `PORT=3001 npm start`.

- [x] **Step 2: Smoke `/api/capture` and `/api/export`**

Use curl with a local JSON body and confirm no cross-user data is exposed.

- [x] **Step 3: Mark transport done-foundation**

Update product execution plan.

- [ ] **Step 4: Commit locally**

Run:

```bash
git add src/lib/localHttpTransport.ts src/lib/localHttpTransport.test.ts server.ts package.json docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-27-local-http-api-transport.md
git commit -m "feat: expose local private vault api transport"
```
