import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { compileMemoryRecordsToWikiGraph } from './llmWikiCompiler';

const nodeById = (id: string) => {
  const graph = compileMemoryRecordsToWikiGraph(personalMemoryRecords);
  const node = graph.nodes.find((candidate) => candidate.id === id);
  if (!node) throw new Error(`Missing compiled wiki node ${id}`);
  return node;
};

const atomById = (id: string) => {
  const graph = compileMemoryRecordsToWikiGraph(personalMemoryRecords);
  const atom = graph.atoms.find((candidate) => candidate.id === id);
  if (!atom) throw new Error(`Missing compiled atom ${id}`);
  return atom;
};

describe('compileMemoryRecordsToWikiGraph', () => {
  test('compiles deterministic wiki-like nodes and canonical memory atoms from MemoryRecords', () => {
    const first = compileMemoryRecordsToWikiGraph(personalMemoryRecords);
    const second = compileMemoryRecordsToWikiGraph([...personalMemoryRecords].reverse());

    expect(first).toEqual(second);
    expect(first.corpusId).toBe('personal-memory-ai-fixture-corpus');
    expect(first.rawSourceCount).toBe(5);
    expect(first.nodeCount).toBeGreaterThan(10);
    expect(first.atomCount).toBe(5);
    expect(first.citationCount).toBe(5);
    expect(first.operationCounts).toEqual({ retain: 5, recall: 5, reflect: 3 });
    expect(first.freshnessCounts).toEqual({ strengthening: 2, stable: 2, stale: 1 });
    expect(first.nodes.map((node) => node.id)).toEqual([...first.nodes.map((node) => node.id)].sort());
    expect(first.atoms.map((atom) => atom.id)).toEqual([...first.atoms.map((atom) => atom.id)].sort());
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

  test('preserves provenance, freshness, and retain/recall/reflect markers on canonical atoms', () => {
    expect(atomById('atom:mem_launch_may_anxiety_scope_delay')).toMatchObject({
      canonicalClaim: '불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다.',
      origin: 'imported',
      meaningVersion: 1,
      confidentiality: 'private',
      freshness: 'stale',
      operations: ['retain', 'recall', 'reflect'],
      sourceRefs: ['notion://launch-journal/may'],
      citationIds: ['mem_launch_may_anxiety_scope_delay'],
    });

    expect(atomById('atom:mem_freeze_vs_feature_addition')).toMatchObject({
      origin: 'synthesized',
      meaningVersion: 2,
      freshness: 'stable',
      operations: ['retain', 'recall', 'reflect'],
    });

    expect(atomById('atom:mem_captured_ship_note')).toEqual(
      expect.objectContaining({
        origin: 'captured',
        freshness: 'strengthening',
        operations: ['retain', 'recall'],
        claimFingerprint: expect.stringMatching(/^sha-/),
      }),
    );
  });
});
