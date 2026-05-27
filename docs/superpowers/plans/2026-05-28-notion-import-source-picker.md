# Notion Import Source Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish Notion source listing so the import panel can list accessible Notion databases/data sources and preview the selected source through the existing private import flow.

**Architecture:** Keep Notion token handling server-side. Add a small Notion search mapper in `notionImport.ts`, expose it through the existing private-vault API/HTTP transport, and render source-list controls in the import panel that fill the existing Database ID input.

**Tech Stack:** TypeScript, Vitest, local HTTP transport, static web shell script.

---

### Task 1: Finish Notion Source Listing

**Files:**
- Modify: `src/lib/notionImport.ts`
- Modify: `src/lib/personalMemoryApi.ts`
- Modify: `src/components/PatternPanel.tsx`
- Modify: `src/App.tsx`
- Test: `src/lib/notionImport.test.ts`
- Test: `src/lib/personalMemoryApi.test.ts`
- Test: `src/lib/localHttpTransport.test.ts`
- Test: `src/lib/appShellEvidenceLayout.test.ts`

- [x] **Step 1: Verify RED**

Run:

```bash
npx vitest run src/lib/notionImport.test.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts -t "Notion|notion"
```

Expected: FAIL because `queryNotionImportSources` is missing, `/api/import/notion/sources` returns 404, and the rendered import panel lacks source-list controls.

- [x] **Step 2: Implement Notion source mapper**

Add `NotionImportSource`, `queryNotionImportSources`, and safe title extraction to `src/lib/notionImport.ts`. It should call `https://api.notion.com/v1/search`, filter `object === "data_source"` or `object === "database"`, and never return token values.

- [x] **Step 3: Wire private API path**

Add `/api/import/notion/sources` to `PersonalMemoryApiPath`, return `424` when the token is absent, and call `queryNotionImportSources` for `GET`.

- [x] **Step 4: Render source-list controls**

Add `data-notion-sources-endpoint`, `data-control="list-notion-sources"`, and `data-notion-source-list` to the Notion import panel.

- [x] **Step 5: Wire browser source selection**

Add a click handler that fetches the sources endpoint, renders source buttons, sets the selected source id into the database input, and updates interaction state.

- [x] **Step 6: Verify focused GREEN**

Run:

```bash
npx vitest run src/lib/notionImport.test.ts src/lib/personalMemoryApi.test.ts src/lib/localHttpTransport.test.ts src/lib/appShellEvidenceLayout.test.ts -t "Notion|notion"
```

Expected: PASS for the focused Notion source and preview coverage.

- [x] **Step 7: Run full Reins gates**

Run:

```bash
git diff --name-only
npm run typecheck
npm test
npm run build
```

Expected: all pass before updating the contract and committing.
