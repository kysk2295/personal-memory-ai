import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { compileMemoryRecordsToWikiGraph } from './llmWikiCompiler';

const nodeById = (id: string) => {
  const graph = compileMemoryRecordsToWikiGraph(personalMemoryRecords);
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Missing compiled wiki node ${id}`);
  return node;
};

describe('compileMemoryRecordsToWikiGraph', () => {
  test('compiles deterministic wiki-like nodes from MemoryRecords', () => {
    const first = compileMemoryRecordsToWikiGraph(personalMemoryRecords);
    const second = compileMemoryRecordsToWikiGraph([...personalMemoryRecords].reverse());

    expect(first).toEqual(second);
    expect(first.corpusId).toBe('personal-memory-ai-fixture-corpus');
    expect(first.rawSourceCount).toBe(5);
    expect(first.nodeCount).toBeGreaterThan(10);
    expect(first.citationCount).toBe(5);
    expect(first.nodes.map((node) => node.id)).toEqual([...first.nodes.map((node) => node.id)].sort());
  });

  test('creates source, concept, decision, and pattern nodes with citations', () => {
    expect(nodeById('source:obsidian')).toMatchObject({
      type: 'source',
      title: 'obsidian raw source',
      citationIds: ['mem_launch_june_anxiety_scope_delay'],
    });

    expect(nodeById('concept:feature-addition')).toMatchObject({
      type: 'concept',
      title: 'feature addition',
      sourceMemoryIds: ['mem_freeze_vs_feature_addition', 'mem_launch_june_anxiety_scope_delay'],
      citationIds: ['mem_freeze_vs_feature_addition', 'mem_launch_june_anxiety_scope_delay'],
    });

    expect(nodeById('decision:chosen')).toMatchObject({
      type: 'decision',
      sourceMemoryIds: [
        'mem_captured_ship_note',
        'mem_launch_june_anxiety_scope_delay',
        'mem_launch_may_anxiety_scope_delay',
      ],
    });

    expect(nodeById('pattern:launch-delay-from-feature-expansion')).toEqual(
      expect.objectContaining({
        type: 'pattern',
        relatedNodeIds: expect.arrayContaining(['concept:feature-addition', 'concept:launch', 'decision:chosen']),
        citationIds: expect.arrayContaining([
          'mem_freeze_vs_feature_addition',
          'mem_launch_june_anxiety_scope_delay',
          'mem_launch_may_anxiety_scope_delay',
        ]),
      }),
    );
  });
});
