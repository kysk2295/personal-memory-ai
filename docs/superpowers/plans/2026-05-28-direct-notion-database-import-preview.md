# Direct Notion Database Import Preview Implementation Plan

**Goal:** Add a direct Notion database/data source preview path so existing Notion memories can enter the private second-brain import loop without requiring a manual JSON or Markdown export first.

**Architecture:** Keep import preview/apply unchanged as the canonical ingestion gate. Add a Notion connector that queries the Notion data source API with a secret-gated token, maps page properties into `ImportPreviewCandidate`s, and then reuses the existing owner-scoped import preview builder. The browser panel exposes only Database ID input; the integration token remains server-side.

**Tech Stack:** TypeScript, Vitest, local HTTP transport, Notion HTTP API, static web shell script.

## Task 1: Notion Connector Contract

- [x] Add failing tests for mapping Notion page properties into import preview candidates.
- [x] Add failing API tests for `/api/import/notion/preview`.
- [x] Implement `notionImport` query/mapping helpers without leaking the token into candidate metadata.
- [x] Wire the API and local HTTP transport with an optional server-side Notion token.
- [x] Add a direct Notion Database ID preview entry point to the import panel.
- [x] Keep apply/undo behavior shared with the existing import preview pipeline.

## Verification

- `npx vitest run src/lib/notionImport.test.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts -t "Notion|notion"`
- `npx vitest run src/lib/appShellEvidenceLayout.test.ts -t "direct Notion"`
- `npm run typecheck`
- `npm test`
- `npm run build`
- `PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:playwright`

All passed. The local environment has a Notion token present, so live database smoke should be run only with a real user-approved database/data source id.
