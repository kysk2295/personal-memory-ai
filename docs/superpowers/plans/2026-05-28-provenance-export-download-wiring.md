# Provenance Export Download Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real owner-scoped JSON download response for selected-memory provenance exports.

**Architecture:** Extend the existing private memory API with a sibling download route that reuses `buildMemoryProvenanceExport`. Allow API responses to carry optional headers, and teach the local HTTP transport to preserve those headers while still defaulting to JSON responses. Surface the download endpoint and filename in the timeline detail panel.

**Tech Stack:** TypeScript, Vitest, local in-memory `MemoryStore`, existing private vault auth runtime.

---

### Task 1: API Download Response Contract

**Files:**
- Modify: `src/lib/personalMemoryApi.test.ts`
- Modify: `src/lib/personalMemoryApi.ts`

- [ ] **Step 1: Write the failing API test**

Add a test beside the existing provenance export test that calls `GET /api/memory/provenance-download` with `memoryId` and `exportedAt`, expects status `200`, expects `headers['content-disposition']` to contain `attachment; filename="memory-provenance-mem_freeze_vs_feature_addition-2026-05-28.json"`, and expects the body to be the export bundle without leaking another user's guard string.

- [ ] **Step 2: Run the focused API test to verify RED**

Run: `npm test -- src/lib/personalMemoryApi.test.ts -t "provenance download"`

Expected: FAIL with `404` or missing headers because the route does not exist.

- [ ] **Step 3: Implement the minimal API route**

Add `/api/memory/provenance-download` to `PersonalMemoryApiPath`, add optional `headers` to `PersonalMemoryApiResponse`, and return the export bundle body with content type and content disposition headers.

- [ ] **Step 4: Run the focused API test to verify GREEN**

Run: `npm test -- src/lib/personalMemoryApi.test.ts -t "provenance download"`

Expected: PASS.

### Task 2: HTTP Header Preservation

**Files:**
- Modify: `src/lib/localHttpTransport.test.ts`
- Modify: `src/lib/localHttpTransport.ts`

- [ ] **Step 1: Write the failing HTTP test**

Add a trusted-header auth test that calls `/api/memory/provenance-download`, expects the attachment header and raw export body, and confirms another user's guard source does not appear.

- [ ] **Step 2: Run the focused HTTP test to verify RED**

Run: `npm test -- src/lib/localHttpTransport.test.ts -t "downloads selected memory provenance"`

Expected: FAIL because transport currently drops API response headers or the route is missing.

- [ ] **Step 3: Preserve API headers in the transport**

Change `LocalPersonalMemoryHttpResponse.headers` to allow content-disposition, and merge API response headers over the default JSON content type in `jsonResponse`.

- [ ] **Step 4: Run the focused HTTP test to verify GREEN**

Run: `npm test -- src/lib/localHttpTransport.test.ts -t "downloads selected memory provenance"`

Expected: PASS.

### Task 3: Timeline Download Affordance

**Files:**
- Modify: `src/lib/appShellEvidenceLayout.test.ts`
- Modify: `src/components/MemoryDetailTimelinePanel.tsx`
- Modify: `docs/product/product-execution-plan-2026-05-27.md`
- Modify: `TASKS/PMI-016-provenance-export-download-wiring.md`

- [ ] **Step 1: Write the failing layout test**

Extend the benchmark-like/detail timeline test to expect `data-memory-provenance-download-endpoint="/api/memory/provenance-download"` and a button/control with `data-control="download-memory-provenance"`.

- [ ] **Step 2: Run the focused layout test to verify RED**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"`

Expected: FAIL because the download endpoint/control metadata is absent.

- [ ] **Step 3: Render the download metadata**

Add the download endpoint attribute, deterministic filename attribute, and dedicated download button to `MemoryDetailTimelinePanel`.

- [ ] **Step 4: Run the focused layout test to verify GREEN**

Run: `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "benchmark-like"`

Expected: PASS.

- [ ] **Step 5: Run full Reins verification**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Expected: all pass.

- [ ] **Step 6: Commit the bounded slice**

Run:

```bash
git add TASKS/PMI-016-provenance-export-download-wiring.md docs/superpowers/plans/2026-05-28-provenance-export-download-wiring.md docs/product/product-execution-plan-2026-05-27.md src/lib/personalMemoryApi.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts src/components/MemoryDetailTimelinePanel.tsx
git commit -m "feat: add provenance export download"
```
