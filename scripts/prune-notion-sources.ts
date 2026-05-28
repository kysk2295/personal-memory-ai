import { Pool } from 'pg';
import { personalMemoryRecords } from '../src/lib/__fixtures__/personalMemoryRecords';
import { createMemoryStoreRuntime } from '../src/lib/memoryStoreRuntime';
import { buildNotionSourcePrunePlan } from '../src/lib/notionSourcePrune';

function splitIds(value: string | undefined): string[] {
  return (value ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function argValue(name: string): string | undefined {
  const prefix = `--${name}=`;
  return process.argv
    .slice(2)
    .find((arg) => arg.startsWith(prefix))
    ?.slice(prefix.length);
}

function hasFlag(name: string): boolean {
  return process.argv.slice(2).includes(`--${name}`);
}

function jsonLine(value: unknown): void {
  process.stdout.write(`${JSON.stringify(value)}\n`);
}

const keepSourceIds = [...splitIds(process.env.PMI_NOTION_KEEP_SOURCE_IDS), ...splitIds(argValue('keep-source-ids'))];
const apply = hasFlag('apply') || process.env.PMI_NOTION_PRUNE_APPLY === 'true';
const userId = process.env.PMI_LOCAL_USER_ID || 'local-user';

const runtime = await createMemoryStoreRuntime({
  env: process.env,
  pgPool: Pool,
  fixtureSeedRecords: personalMemoryRecords,
  seedUserId: userId,
});

try {
  const records = await runtime.store.listByUser(userId);
  const plan = buildNotionSourcePrunePlan({ records, keepSourceIds });
  const response = {
    status: apply ? 'applied' : 'dry_run',
    keepSourceCount: plan.keepSourceIds.length,
    notionDataSourceRecordCount: plan.notionDataSourceRecordCount,
    keepRecordCount: plan.keepRecordCount,
    deleteRecordCount: plan.deleteRecordCount,
    sourceGroupCount: plan.sourceGroups.length,
    sourceGroups: plan.sourceGroups.map((group) => ({
      sourceId: group.sourceId,
      recordCount: group.recordCount,
      action: group.action,
    })),
  };

  if (!apply) {
    jsonLine(response);
  } else {
    const deletedCount = await runtime.store.deleteByIds(userId, plan.deleteMemoryIds);
    jsonLine({ ...response, deletedCount });
  }
} finally {
  await runtime.close();
}
