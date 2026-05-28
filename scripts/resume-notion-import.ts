import { Pool } from 'pg';
import { personalMemoryRecords } from '../src/lib/__fixtures__/personalMemoryRecords';
import { createMemoryStoreRuntime } from '../src/lib/memoryStoreRuntime';
import { queryNotionImportSources } from '../src/lib/notionImport';
import { importNotionSourcesToMemoryStore } from '../src/lib/notionImportResume';

function splitSourceIds(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function readSourceIdsFromArgs(): string[] {
  const ids: string[] = [];
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--source=')) ids.push(arg.slice('--source='.length));
  }
  return ids.map((item) => item.trim()).filter(Boolean);
}

function jsonLine(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

const notionToken = process.env.NOTION_API_TOKEN || process.env.NOTION_API_KEY;
if (!notionToken) {
  jsonLine({ status: 'blocked', error: 'notion_token_missing' });
  process.exit(1);
}

const userId = process.env.PMI_LOCAL_USER_ID || 'local-user';
const runtime = await createMemoryStoreRuntime({
  env: process.env,
  pgPool: Pool,
  fixtureSeedRecords: personalMemoryRecords,
  seedUserId: userId,
});

try {
  let sourceIds = [...splitSourceIds(process.env.PMI_NOTION_SOURCE_IDS), ...readSourceIdsFromArgs()];
  if (!sourceIds.length && process.env.PMI_NOTION_DISCOVER_SOURCES === 'true') {
    const sources = await queryNotionImportSources({ notionToken });
    sourceIds = sources.map((source) => source.id);
    jsonLine({ status: 'sources_discovered', sourceCount: sourceIds.length });
  }

  if (!sourceIds.length) {
    jsonLine({ status: 'blocked', error: 'notion_source_ids_required' });
    process.exit(1);
  }

  const before = await runtime.store.listByUser(userId);
  const report = await importNotionSourcesToMemoryStore({
    store: runtime.store,
    userId,
    notionToken,
    sourceIds: Array.from(new Set(sourceIds)),
    createdAt: new Date().toISOString(),
    pageSize: process.env.PMI_NOTION_PAGE_SIZE ? Number(process.env.PMI_NOTION_PAGE_SIZE) : undefined,
  });
  const after = await runtime.store.listByUser(userId);
  jsonLine({
    ...report,
    before: { memories: before.length },
    after: { memories: after.length },
  });
} finally {
  await runtime.close();
}
