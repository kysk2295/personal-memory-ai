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
            label: '불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다.',
            graphLabel: '불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다.',
            searchText: expect.stringContaining('불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다'),
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
      createdAt: `2026-05-${String((index % 28) + 1).padStart(2, '0')}T00:00:00.000Z`,
      observedAt: `2026-05-${String((index % 28) + 1).padStart(2, '0')}`,
    }));
    const graph = buildMemoryGraphModel(records);
    const memoryNodeCount = graph.elements.filter((element) => element.group === 'nodes' && element.data.kind === 'memory').length;

    expect(graph.stats.memoryNodeCount).toBe(350);
    expect(graph.stats.renderedMemoryNodeCount).toBe(300);
    expect(memoryNodeCount).toBeLessThanOrEqual(300);
  });

  test('renders newest captured memories inside the large-vault graph window', () => {
    const oldRecords = Array.from({ length: 350 }, (_, index) => ({
      ...personalMemoryRecords[0],
      id: `mem_old_graph_${index}`,
      summary: `Old graph memory ${index}`,
      rawText: `Old graph raw text ${index}`,
      createdAt: '2026-04-01T00:00:00.000Z',
      observedAt: '2026-04-01',
    }));
    const newestCapture: MemoryRecord = {
      ...personalMemoryRecords[0],
      id: 'mem_newest_service_flow_capture',
      summary: 'Newest service flow diary capture.',
      rawText: 'Newest service flow diary capture should appear in the graph window.',
      sourceType: 'mobile',
      sourceRef: 'app-capture://pwa-local-device/newest',
      createdAt: '2026-05-28T03:00:00.000Z',
      observedAt: '2026-05-28',
      emotionTags: ['resolve'],
      topicTags: ['service flow'],
      projectTags: ['personal-memory-ai'],
    };

    const graph = buildMemoryGraphModel([...oldRecords, newestCapture]);

    expect(graph.elements).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'memory:mem_newest_service_flow_capture',
            recordId: 'mem_newest_service_flow_capture',
          }),
        }),
        expect.objectContaining({
          data: expect.objectContaining({
            source: 'memory:mem_newest_service_flow_capture',
            target: 'topic:service-flow',
          }),
        }),
      ]),
    );
  });
});
