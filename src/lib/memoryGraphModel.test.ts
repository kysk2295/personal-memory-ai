import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildMemoryGraphModel } from './memoryGraphModel';
import type { MemoryRecord } from './memoryRecord';

describe('buildMemoryGraphModel', () => {
  test('builds Cytoscape nodes and edges from actual MemoryRecord data', () => {
    const graph = buildMemoryGraphModel(personalMemoryRecords);

    expect(graph.library).toBe('cytoscape');
    expect(graph.stats.memoryNodeCount).toBe(personalMemoryRecords.length);
    expect(graph.stats.graphNodeCount).toBeGreaterThan(personalMemoryRecords.length);
    expect(graph.stats.edgeCount).toBeGreaterThan(20);
    expect(graph.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'memory:mem_launch_may_anxiety_scope_delay',
            kind: 'memory',
            recordId: 'mem_launch_may_anxiety_scope_delay',
            label: 'Anxiety before the memory import demo led to graph filter scope expansion and a two-day launch delay.',
            graphLabel: 'Anxiety before the memory import demo led to...',
            searchText: expect.stringContaining('anxiety before the memory import demo'),
          }),
        }),
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'emotion:anxiety',
            kind: 'emotion',
            label: 'anxiety',
          }),
        }),
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'source:notion',
            kind: 'source',
            label: 'notion',
          }),
        }),
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'memory:mem_launch_may_anxiety_scope_delay->emotion:anxiety',
            source: 'memory:mem_launch_may_anxiety_scope_delay',
            target: 'emotion:anxiety',
            kind: 'emotion',
          }),
        }),
      ]),
    );
  });

  test('changes graph stats when a real new memory is added', () => {
    const extra: MemoryRecord = {
      ...personalMemoryRecords[0],
      id: 'mem_real_user_new_calm_launch_note',
      summary: 'Calm launch memory from the real user dataset.',
      rawText: 'I felt calm because I shipped from a smaller scope.',
      sourceType: 'mobile',
      sourceRef: 'mobile://diary/new-calm-launch-note',
      observedAt: '2026-05-27',
      emotionTags: ['calm'],
      topicTags: ['launch'],
      projectTags: ['personal-memory-ai'],
      decisionSignal: 'chosen',
      outcomeText: 'Smaller scope shipped.',
    };

    const base = buildMemoryGraphModel(personalMemoryRecords);
    const next = buildMemoryGraphModel([...personalMemoryRecords, extra]);

    expect(next.stats.memoryNodeCount).toBe(base.stats.memoryNodeCount + 1);
    expect(next.stats.graphNodeCount).toBeGreaterThan(base.stats.graphNodeCount);
    expect(next.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'memory:mem_real_user_new_calm_launch_note',
            kind: 'memory',
            recordId: 'mem_real_user_new_calm_launch_note',
          }),
        }),
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'outcome:smaller-scope-shipped',
            kind: 'outcome',
          }),
        }),
      ]),
    );
  });

  test('keeps memory node search text bounded for large imported pages', () => {
    const graph = buildMemoryGraphModel([
      {
        ...personalMemoryRecords[0],
        id: 'mem_large_notion_page',
        summary: 'Large Notion page summary.',
        rawText: 'Long Notion body '.repeat(5_000),
        topicTags: ['notion import'],
      },
    ]);
    const memoryNode = graph.elements.find((element) => element.data.id === 'memory:mem_large_notion_page');

    expect(memoryNode?.data.searchText?.length).toBeLessThanOrEqual(800);
    expect(memoryNode?.data.searchText).toContain('large notion page summary');
    expect(memoryNode?.data.searchText).toContain('notion import');
  });

  test('limits rendered memory elements while preserving total memory stats for large vaults', () => {
    const records = Array.from({ length: 350 }, (_, index) => ({
      ...personalMemoryRecords[0],
      id: `mem_large_graph_${index}`,
      summary: `Large graph memory ${index}`,
      rawText: `Large graph raw text ${index}`,
    }));
    const graph = buildMemoryGraphModel(records);
    const memoryNodeCount = graph.elements.filter((element) => element.group === 'nodes' && element.data.kind === 'memory').length;

    expect(graph.stats.memoryNodeCount).toBe(350);
    expect(memoryNodeCount).toBeLessThanOrEqual(300);
  });
});
