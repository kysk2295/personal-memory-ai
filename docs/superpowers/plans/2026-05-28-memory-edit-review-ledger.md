# Memory Edit Review Ledger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add deterministic edit review ledger metadata to memory update responses and the visible review/edit surface.

**Architecture:** Build a pure `memoryReviewLedger` helper that compares before/after `MemoryRecord` values and returns a redaction-safe ledger entry. The API returns the entry after owner-scoped update; the UI records the revision id after save.

**Tech Stack:** TypeScript, Vitest, existing static app shell.

---

## File Structure

- Create `src/lib/memoryReviewLedger.ts`: pure ledger entry builder.
- Create `src/lib/memoryReviewLedger.test.ts`: RED/GREEN coverage for changed and unchanged edits.
- Modify `src/lib/personalMemoryApi.ts`: include `reviewLedgerEntry` in `/api/memory/update`.
- Modify `src/lib/personalMemoryApi.test.ts`: assert the ledger is owner-scoped and includes changed fields.
- Modify `src/components/MemoryDetailTimelinePanel.tsx` and `src/App.tsx`: expose last review revision state.
- Modify `src/lib/appShellEvidenceLayout.test.ts`: assert UI data contract.
- Modify `docs/product/product-execution-plan-2026-05-27.md`: record L43.

### Task 1: Pure Ledger Helper

- [ ] Write failing `memoryReviewLedger.test.ts` for summary/raw text changes.
- [ ] Run `npm test -- src/lib/memoryReviewLedger.test.ts` and confirm module missing/failing.
- [ ] Implement `buildMemoryReviewLedgerEntry`.
- [ ] Re-run the focused test and confirm PASS.

### Task 2: API Integration

- [ ] Extend the existing `/api/memory/update` test to expect `reviewLedgerEntry.changedFields`.
- [ ] Run `npm test -- src/lib/personalMemoryApi.test.ts -t "reviews and updates one owner-scoped memory"` and confirm FAIL.
- [ ] Return ledger entry from the API update handler.
- [ ] Re-run the focused test and confirm PASS.

### Task 3: UI Contract

- [ ] Add render assertions for `data-memory-review-ledger="pending"` and `data-memory-review-revision`.
- [ ] Run `npm test -- src/lib/appShellEvidenceLayout.test.ts -t "renders a benchmark-like second-brain graph workspace"` and confirm FAIL.
- [ ] Render the attributes and set them from the save response.
- [ ] Re-run the focused test and confirm PASS.

### Task 4: Verification

- [ ] Run `git diff --name-only`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `npm run build`.
- [ ] Update the task contract with evidence and commit only PMI-013 files.
