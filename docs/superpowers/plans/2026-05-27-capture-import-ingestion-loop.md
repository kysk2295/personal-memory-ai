# Capture / Import Ingestion Loop Plan

## Goal

Implement the next Product Master Plan phase locally without reviving the removed RPI `TASKS` workflow. Phase 3 needs a credible loop where fast diary capture and import preview records become private, user-scoped `MemoryRecord`s that can be queried as graph/evidence records and undone.

## Scope

- Add a small `memoryIngestion` domain service.
- Extend `MemoryStore` with user-scoped `deleteByIds`.
- Keep fixture and PostgreSQL implementations aligned.
- Use TDD before production code.

## Files

- `src/lib/memoryIngestion.test.ts`
- `src/lib/memoryIngestion.ts`
- `src/lib/memoryStore.ts`
- `src/lib/fixtureMemoryStore.ts`
- `src/lib/postgresMemoryStore.ts`
- `src/lib/memoryStore.test.ts`

## Required Behavior

1. Fast diary capture writes a private `MemoryRecord` to the store.
2. The created capture record can be returned through graph evidence lookup.
3. Import preview apply creates only non-duplicate records by default.
4. Import apply returns an undo action containing applied memory ids.
5. Undo deletes only the applied ids for the specified user.
6. PostgreSQL delete queries remain user-scoped and remove embeddings before records.

## Verification

```bash
npm run typecheck
npm test
npm run build
```

## Completion

- Commit locally only.
- Do not push.
- Keep `TASKS/` absent unless the user explicitly wants the RPI contract workflow back.
