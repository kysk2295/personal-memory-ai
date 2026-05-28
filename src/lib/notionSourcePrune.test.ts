import { describe, expect, test } from 'vitest';
import { normalizeMemoryRecord } from './memoryRecord';
import { buildNotionSourcePrunePlan, listNotionSourceGroups } from './notionSourcePrune';

describe('notion source prune planning', () => {
  const records = [
    normalizeMemoryRecord({
      id: 'mem_habit_1',
      sourceType: 'notion',
      sourceRef: 'notion://data-source/source_habit/page/page-1',
      rawText: 'Private habit diary row.',
    }),
    normalizeMemoryRecord({
      id: 'mem_habit_2',
      sourceType: 'notion',
      sourceRef: 'notion://data-source/source_habit/page/page-2',
      rawText: 'Another private habit diary row.',
    }),
    normalizeMemoryRecord({
      id: 'mem_task_1',
      sourceType: 'notion',
      sourceRef: 'notion://data-source/source_tasks/page/page-3',
      rawText: 'Task database row that should be pruned.',
    }),
    normalizeMemoryRecord({
      id: 'mem_fixture',
      sourceType: 'notion',
      sourceRef: 'notion://launch-journal/may',
      rawText: 'Fixture record without a live data source id.',
    }),
  ];

  test('lists Notion data-source groups without exposing page body text', () => {
    expect(listNotionSourceGroups(records)).toEqual([
      { sourceId: 'source_habit', recordCount: 2 },
      { sourceId: 'source_tasks', recordCount: 1 },
    ]);
    expect(JSON.stringify(listNotionSourceGroups(records))).not.toContain('Private habit diary row');
  });

  test('plans a dry-run prune that keeps only the selected diary source', () => {
    const plan = buildNotionSourcePrunePlan({
      records,
      keepSourceIds: ['source_habit'],
    });

    expect(plan).toEqual({
      mode: 'dry-run',
      notionDataSourceRecordCount: 3,
      keepSourceIds: ['source_habit'],
      keepRecordCount: 2,
      deleteRecordCount: 1,
      deleteMemoryIds: ['mem_task_1'],
      sourceGroups: [
        { sourceId: 'source_habit', recordCount: 2, action: 'keep' },
        { sourceId: 'source_tasks', recordCount: 1, action: 'delete' },
      ],
    });
    expect(JSON.stringify(plan)).not.toContain('Task database row');
  });
});
