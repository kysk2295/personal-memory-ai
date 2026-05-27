# Auth Provider Runtime Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add production-auth scaffolding for private vault ownership without changing the local-only default.

**Architecture:** Keep the current local private vault session as the default provider, then add a pluggable auth runtime that can resolve a private vault session from trusted upstream headers in deployed environments. The API and HTTP transport should accept resolved sessions only, return 401 when no authenticated owner exists, and never expose token/secret values in runtime health data.

**Tech Stack:** TypeScript, Vitest, Node HTTP headers, existing private vault and local transport modules.

---

### Task 1: RED Auth Runtime Tests

**Files:**
- Create: `src/lib/authProviderRuntime.test.ts`

- [x] **Step 1: Add local and trusted-header auth runtime tests**

Add tests that assert:

- default runtime is local and resolves `PMI_LOCAL_USER_ID`
- trusted-header runtime requires `x-pmi-user-id` by default
- trusted-header runtime returns a private vault session for the header owner
- safe health metadata includes provider/readiness but not header values or secrets

- [x] **Step 2: Run RED**

Run:

```bash
npx vitest run src/lib/authProviderRuntime.test.ts
```

Expected: FAIL because `authProviderRuntime.ts` does not exist.

### Task 2: Auth Runtime Implementation

**Files:**
- Modify: `src/lib/privateVault.ts`
- Create: `src/lib/authProviderRuntime.ts`

- [x] **Step 1: Generalize private vault session types**

Add `PrivateVaultSession`, keep `LocalPrivateVaultSession` compatibility, and add `createTrustedHeaderPrivateVaultSession`.

- [x] **Step 2: Implement auth runtime factory**

Implement `createPrivateVaultAuthRuntime({ env })` with:

- default provider: `local`
- optional provider: `trusted-header`
- env keys: `PMI_AUTH_PROVIDER`, `PMI_LOCAL_USER_ID`, `PMI_AUTH_USER_HEADER`, `PMI_AUTH_SESSION_HEADER`
- `resolveSession({ headers, now })`
- `safeHealth` that redacts request values

- [x] **Step 3: Run focused auth tests**

Run:

```bash
npx vitest run src/lib/authProviderRuntime.test.ts src/lib/privateVault.test.ts
```

Expected: PASS.

### Task 3: Wire HTTP Transport and Server

**Files:**
- Modify: `src/lib/localHttpTransport.ts`
- Modify: `src/lib/localHttpTransport.test.ts`
- Modify: `server.ts`

- [x] **Step 1: Add HTTP auth runtime tests**

Add transport tests proving:

- existing fixed local session input still works
- trusted-header runtime scopes export/capture to the request owner
- missing trusted header returns `401 auth_required`

- [x] **Step 2: Run RED for transport behavior**

Run:

```bash
npx vitest run src/lib/localHttpTransport.test.ts
```

Expected: FAIL until transport accepts request headers/auth runtime.

- [x] **Step 3: Wire transport and server**

Allow `createLocalPersonalMemoryHttpHandler` to receive either a fixed `session` or an `authRuntime`. Pass Node request headers through from `server.ts` and instantiate `createPrivateVaultAuthRuntime({ env: process.env })`.

- [x] **Step 4: Run focused transport tests**

Run:

```bash
npx vitest run src/lib/authProviderRuntime.test.ts src/lib/privateVault.test.ts src/lib/localHttpTransport.test.ts src/lib/personalMemoryApi.test.ts
```

Expected: PASS.

### Task 4: Product Plan, Verification, Commit

**Files:**
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `docs/superpowers/plans/2026-05-28-auth-provider-runtime.md`

- [x] **Step 1: Update product plan**

Add L35 as auth provider runtime scaffolding and move production auth provider from `planned` to `done-foundation`.

- [x] **Step 2: Full verification**

Run:

```bash
npm run typecheck
npm test
npm run build
npm run evidence:playwright
git diff --check
```

Expected: all commands exit 0.

- [x] **Step 3: Commit locally**

Run:

```bash
git add src/lib/authProviderRuntime.ts src/lib/authProviderRuntime.test.ts src/lib/privateVault.ts src/lib/privateVault.test.ts src/lib/localHttpTransport.ts src/lib/localHttpTransport.test.ts server.ts docs/product/product-execution-plan-2026-05-27.md docs/superpowers/plans/2026-05-28-auth-provider-runtime.md
git commit -m "feat: add private vault auth runtime"
```
