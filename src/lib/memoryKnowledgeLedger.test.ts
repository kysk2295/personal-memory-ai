import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildMemoryKnowledgeLedger } from './memoryKnowledgeLedger';

const ledger = () => buildMemoryKnowledgeLedger(personalMemoryRecords);

describe('buildMemoryKnowledgeLedger', () => {
  test('builds a deterministic canonical ledger independent of input order', () => {
    const first = buildMemoryKnowledgeLedger(personalMemoryRecords);
    const second = buildMemoryKnowledgeLedger([...personalMemoryRecords].reverse());

    expect(first).toEqual(second);
    expect(first.stats).toEqual(
      expect.objectContaining({
        rawArchiveCount: 5,
        canonicalThoughtCount: 5,
        staleEdgeCount: expect.any(Number),
      }),
    );
    expect(first.stats.typedEdgeCount).toBeGreaterThan(40);
    expect(first.checkpoint).toEqual(
      expect.objectContaining({
        operation: 'atomize-dedup-apply',
        safeToApply: true,
        rawArchiveCount: 5,
        canonicalThoughtCount: 5,
      }),
    );
  });

  test('preserves immutable raw archive entries and source provenance', () => {
    const raw = ledger().rawArchiveEntries.find((entry) => entry.id === 'raw:mem_launch_may_anxiety_scope_delay');

    expect(raw).toEqual(
      expect.objectContaining({
        id: 'raw:mem_launch_may_anxiety_scope_delay',
        memoryId: 'mem_launch_may_anxiety_scope_delay',
        sourceType: 'notion',
        sourceRef: 'notion://launch-journal/may',
        rawText: 'Felt anxious before shipping the memory import demo, so I expanded scope with graph filters and extra polish. Launch slipped by two days.',
        rawTextFingerprint: expect.stringMatching(/^sha-/),
        confidentiality: 'private',
        immutable: true,
      }),
    );
  });

  test('creates canonical thoughts linked to raw archive entries, citations, and freshness', () => {
    const thought = ledger().canonicalThoughts.find(
      (entry) => entry.id === 'thought:mem_launch_may_anxiety_scope_delay',
    );

    expect(thought).toEqual(
      expect.objectContaining({
        id: 'thought:mem_launch_may_anxiety_scope_delay',
        atomId: 'atom:mem_launch_may_anxiety_scope_delay',
        canonicalClaim: 'Anxiety before the memory import demo led to graph filter scope expansion and a two-day launch delay.',
        sourceArchiveIds: ['raw:mem_launch_may_anxiety_scope_delay'],
        citationIds: ['mem_launch_may_anxiety_scope_delay'],
        sourceMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
        meaningVersion: 1,
        freshness: 'stale',
        confidentiality: 'private',
      }),
    );
  });

  test('creates typed edges for raw citations, facets, and architecture-level pattern links', () => {
    const edges = ledger().typedEdges;

    expect(edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'edge:cites-raw:atom:mem_launch_may_anxiety_scope_delay->raw:mem_launch_may_anxiety_scope_delay',
          kind: 'cites-raw',
          sourceId: 'atom:mem_launch_may_anxiety_scope_delay',
          targetId: 'raw:mem_launch_may_anxiety_scope_delay',
          citationIds: ['mem_launch_may_anxiety_scope_delay'],
          status: 'stale',
          confidence: 1,
        }),
        expect.objectContaining({
          kind: 'has-topic',
          sourceId: 'atom:mem_launch_may_anxiety_scope_delay',
          targetId: 'concept:launch',
          citationIds: ['mem_launch_may_anxiety_scope_delay'],
        }),
        expect.objectContaining({
          kind: 'has-emotion',
          sourceId: 'atom:mem_launch_may_anxiety_scope_delay',
          targetId: 'emotion:anxiety',
        }),
        expect.objectContaining({
          kind: 'supports-decision',
          sourceId: 'atom:mem_launch_may_anxiety_scope_delay',
          targetId: 'decision:chosen',
        }),
        expect.objectContaining({
          kind: 'produced-outcome',
          sourceId: 'atom:mem_launch_may_anxiety_scope_delay',
          targetId: 'outcome:launch-delayed-by-two-days-after-adding-graph-filters',
        }),
        expect.objectContaining({
          kind: 'reinforces-pattern',
          sourceId: 'atom:mem_freeze_vs_feature_addition',
          targetId: 'pattern:launch-delay-from-feature-expansion',
          citationIds: ['mem_freeze_vs_feature_addition'],
        }),
      ]),
    );
  });
});
