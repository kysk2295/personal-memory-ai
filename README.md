# Personal Memory AI

Local product prototype for a private personal memory AI.

## Product

Personal Memory AI turns diary entries, notes, and imported Notion/Obsidian/Markdown records into MemoryRecords. The web surface shows a second-brain evidence graph. Ask My Past Self, Decision Replay, and Weekly Pattern Report must cite real memories or clearly state insufficient evidence.

## Source of Truth

- `docs/product/personal-memory-ai-korean-prd-2026-05-26.md`
- `docs/product/product-master-plan-2026-05-26.md`
- `docs/product/compliance-matrix.md`
- `AGENTS.md`
- `docs/reins-engineering-workflow.md`

## Commands

```bash
npm install
npm run typecheck
npm test
npm run build
npm run start
```

Open `http://localhost:3000`.

## Structure

- `src/App.tsx`: static web product shell
- `src/components/*`: graph, evidence drawer, ask, replay, and pattern UI
- `src/lib/*`: MemoryRecord, import, ask, replay, pattern, graph evidence, and store logic
- `db/migrations/*`: PostgreSQL/pgvector durable memory schema
