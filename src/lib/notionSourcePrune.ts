import type { MemoryRecord } from './memoryRecord';

export interface NotionSourceGroup {
  sourceId: string;
  recordCount: number;
}

export interface NotionSourcePruneGroup extends NotionSourceGroup {
  action: 'keep' | 'delete';
}

export interface BuildNotionSourcePrunePlanInput {
  records: readonly MemoryRecord[];
  keepSourceIds: readonly string[];
  mode?: 'dry-run';
}

export interface NotionSourcePrunePlan {
  mode: 'dry-run';
  notionDataSourceRecordCount: number;
  keepSourceIds: string[];
  keepRecordCount: number;
  deleteRecordCount: number;
  deleteMemoryIds: string[];
  sourceGroups: NotionSourcePruneGroup[];
}

const NOTION_DATA_SOURCE_REF = /^notion:\/\/data-source\/([^/]+)\/page\//;

function notionDataSourceId(record: MemoryRecord): string | null {
  if (record.sourceType !== 'notion') return null;
  const match = record.sourceRef.match(NOTION_DATA_SOURCE_REF);
  return match?.[1] ?? null;
}

export function listNotionSourceGroups(records: readonly MemoryRecord[]): NotionSourceGroup[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const sourceId = notionDataSourceId(record);
    if (!sourceId) continue;
    counts.set(sourceId, (counts.get(sourceId) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([sourceId, recordCount]) => ({ sourceId, recordCount }))
    .sort((left, right) => right.recordCount - left.recordCount || left.sourceId.localeCompare(right.sourceId));
}

export function buildNotionSourcePrunePlan(input: BuildNotionSourcePrunePlanInput): NotionSourcePrunePlan {
  const keepSourceIds = Array.from(new Set(input.keepSourceIds.map((sourceId) => sourceId.trim()).filter(Boolean))).sort();
  const keepSourceSet = new Set(keepSourceIds);
  const deleteMemoryIds: string[] = [];
  let notionDataSourceRecordCount = 0;
  let keepRecordCount = 0;

  for (const record of input.records) {
    const sourceId = notionDataSourceId(record);
    if (!sourceId) continue;
    notionDataSourceRecordCount += 1;
    if (keepSourceSet.has(sourceId)) {
      keepRecordCount += 1;
    } else {
      deleteMemoryIds.push(record.id);
    }
  }

  return {
    mode: input.mode ?? 'dry-run',
    notionDataSourceRecordCount,
    keepSourceIds,
    keepRecordCount,
    deleteRecordCount: deleteMemoryIds.length,
    deleteMemoryIds: deleteMemoryIds.sort(),
    sourceGroups: listNotionSourceGroups(input.records).map((group) => ({
      ...group,
      action: keepSourceSet.has(group.sourceId) ? 'keep' : 'delete',
    })),
  };
}
