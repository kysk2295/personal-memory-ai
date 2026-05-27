# PMI-020 — Capture / Import Memory Ingestion Loop

## Task ID

PMI-020

## Status

in_progress_codex_local

## Goal

Implement the first local MVP ingestion loop: fast diary capture and import preview records can be applied into a user-scoped `MemoryStore`, returned as graph/evidence-ready `MemoryRecord`s, and undone by explicit record ids.

## Product context

Product Master Plan:

- Phase 3 — Capture/import to memory graph loop
- Epics E3.1, E3.2, E3.3, E3.4

Compliance Matrix:

- Existing records are P0.
- App capture and web import are separate surfaces.
- Capture/import must create `MemoryRecord` data.
- Import remove/undo and private-by-default user isolation are required local foundations.

This task does not build native mobile UI. It creates the tested product loop consumed by the later app/web surfaces.

## Allowed files

- `TASKS/PMI-020-capture-import-memory-ingestion-loop.md`
- `src/lib/memoryIngestion.ts`
- `src/lib/memoryIngestion.test.ts`
- `src/lib/memoryStore.ts`
- `src/lib/fixtureMemoryStore.ts`
- `src/lib/postgresMemoryStore.ts`
- `src/lib/memoryStore.test.ts`

## Forbidden files

- `package.json`
- `package-lock.json`
- `Dockerfile`
- `railway.json`
- `.env*`
- `db/migrations/**`
- `src/App.tsx`
- `src/components/**`

## Acceptance criteria

- Fast diary capture can be written to `MemoryStore` for one user.
- Imported preview records can be applied to `MemoryStore`.
- Exact duplicates are skipped by default during import apply.
- Applied import records return an undo action.
- Undo deletes only the applied records for the specified user.
- Graph/evidence lookup returns newly applied memory records.
- Store deletion is user-scoped in fixture and PostgreSQL implementations.

## Required tests

- Add `src/lib/memoryIngestion.test.ts`.
- Test fast diary capture writes one private `MemoryRecord` and returns it via graph evidence lookup.
- Test import preview apply skips exact duplicates and creates only new records.
- Test undo removes applied import records without deleting another user's record.
- Extend `src/lib/memoryStore.test.ts` to verify `deleteByIds` is user-scoped for PostgreSQL queries.

## Verification commands

```bash
npm run typecheck
npm test
npm run build
```

## Stop conditions

- Any verification command fails.
- Any forbidden file is modified.
- Any implementation requires secrets, `.env`, Railway config, or production DB access.
- Any code path claims production persistence while using fixture mode.

## Required evidence

- Test output showing all unit tests pass.
- Build output.
- `git diff --name-only` showing only allowed files for this task.

## Output requirements

- Commit locally only.
- Do not push.
- Do not merge to `main`.
- Final status may be `ready_for_human_review`, not `complete`.
