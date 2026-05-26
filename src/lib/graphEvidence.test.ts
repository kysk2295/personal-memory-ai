import { describe, expect, test } from 'vitest';
import {
  insufficientPatternMemoryRecords,
  personalMemoryRecords,
} from './__fixtures__/personalMemoryRecords';
import { askMyPastSelf } from './askMyPastSelf';
import { replayDecision } from './decisionReplay';
import { buildGraphEvidence, type GraphEvidencePayload } from './graphEvidence';
import { detectRepeatedPatterns } from './patternDetector';

function expectTraceableGraph(graph: GraphEvidencePayload, queryIds: readonly string[]): void {
  const memoryIds = new Set([...personalMemoryRecords, ...insufficientPatternMemoryRecords].map((memory) => memory.id));
  const currentQueryIds = new Set(queryIds);

  for (const node of graph.nodes.filter((item) => item.highlighted)) {
    expect(node.trace.length).toBeGreaterThan(0);
    for (const trace of node.trace) {
      if (trace.type === 'memory') expect(memoryIds.has(trace.id)).toBe(true);
      if (trace.type === 'query') expect(currentQueryIds.has(trace.id)).toBe(true);
    }
  }

  for (const edge of graph.edges.filter((item) => item.highlighted)) {
    expect(edge.trace.length).toBeGreaterThan(0);
    for (const trace of edge.trace) {
      if (trace.type === 'memory') expect(memoryIds.has(trace.id)).toBe(true);
      if (trace.type === 'query') expect(currentQueryIds.has(trace.id)).toBe(true);
    }
  }
}

function expectDrawerContract(graph: GraphEvidencePayload): void {
  for (const item of graph.drawerItems) {
    expect(item.source).toBeTruthy();
    expect(item.date).toBeTruthy();
    expect(item.citation).toBeTruthy();
    expect(item.status).toBe('implemented');
    expect(item.trace.length).toBeGreaterThan(0);
  }
}

describe('buildGraphEvidence', () => {
  test('builds stable Ask evidence nodes, edges, and drawer payloads', () => {
    const patterns = detectRepeatedPatterns(personalMemoryRecords).patterns;
    const askAnswer = askMyPastSelf({
      question: '이번에도 기능을 더 넣어야 할까?',
      memories: personalMemoryRecords,
      patterns,
    });

    const graph = buildGraphEvidence({
      currentQuery: {
        id: 'ask_current_more_features',
        text: '이번에도 기능을 더 넣어야 할까?',
        createdAt: '2026-05-26T10:00:00.000Z',
      },
      memories: personalMemoryRecords,
      askAnswer,
      patterns,
    });

    expect(graph.status).toBe('implemented');
    expect(graph.highlightIds).toEqual([
      'query:ask_current_more_features',
      'memory:mem_launch_may_anxiety_scope_delay',
      'memory:mem_launch_june_anxiety_scope_delay',
      'memory:mem_freeze_vs_feature_addition',
      'emotion:anxiety',
      'emotion:pressure',
      'emotion:avoidance',
      'decision:chosen',
      'decision:avoided',
      'outcome:launch-delayed-by-two-days-after-adding-graph-filters',
      'outcome:launch-delayed-after-onboarding-examples-and-replay-controls-were-added',
      'outcome:launches-keep-being-postponed-when-feature-addition-wins-over-cutting-scope',
      'pattern:pattern_anxiety_scope_expansion_launch_delay',
    ]);
    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'query:ask_current_more_features',
          kind: 'query',
          trace: [{ type: 'query', id: 'ask_current_more_features' }],
          drawer: expect.objectContaining({
            source: 'current_query',
            date: '2026-05-26T10:00:00.000Z',
            citation: '이번에도 기능을 더 넣어야 할까?',
            status: 'implemented',
          }),
        }),
        expect.objectContaining({
          id: 'memory:mem_launch_may_anxiety_scope_delay',
          kind: 'memory',
          trace: [{ type: 'memory', id: 'mem_launch_may_anxiety_scope_delay' }],
          drawer: expect.objectContaining({
            source: 'notion:notion://launch-journal/may',
            date: '2026-05-01',
            status: 'implemented',
          }),
        }),
        expect.objectContaining({
          id: 'pattern:pattern_anxiety_scope_expansion_launch_delay',
          kind: 'pattern',
        }),
      ]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'edge:query:ask_current_more_features->memory:mem_launch_may_anxiety_scope_delay:ask_citation',
          sourceId: 'query:ask_current_more_features',
          targetId: 'memory:mem_launch_may_anxiety_scope_delay',
          trace: [{ type: 'memory', id: 'mem_launch_may_anxiety_scope_delay' }],
          drawer: expect.objectContaining({
            source: 'notion:notion://launch-journal/may',
            date: '2026-05-01',
            status: 'implemented',
          }),
        }),
      ]),
    );
    expectTraceableGraph(graph, ['ask_current_more_features']);
    expectDrawerContract(graph);
  });

  test('builds pattern evidence without generic or untraceable highlights', () => {
    const result = detectRepeatedPatterns(insufficientPatternMemoryRecords);

    const graph = buildGraphEvidence({
      memories: insufficientPatternMemoryRecords,
      patterns: result.patterns,
    });

    expect(graph.highlightIds).toEqual(['pattern:pattern_insufficient_evidence']);
    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'pattern:pattern_insufficient_evidence',
          kind: 'pattern',
          trace: [{ type: 'memory', id: 'mem_single_anxiety_scope_delay' }],
          drawer: expect.objectContaining({
            source: 'memory_records',
            date: '2026-05-24',
            citation: expect.stringContaining('mem_single_anxiety_scope_delay'),
            status: 'implemented',
          }),
        }),
      ]),
    );
    expect(graph.edges).toEqual([
      expect.objectContaining({
        id: 'edge:memory:mem_single_anxiety_scope_delay->pattern:pattern_insufficient_evidence:pattern_support',
        trace: [{ type: 'memory', id: 'mem_single_anxiety_scope_delay' }],
      }),
    ]);
    expectTraceableGraph(graph, []);
    expectDrawerContract(graph);
  });

  test('builds Decision Replay evidence with current query and MemoryRecord traces', () => {
    const patterns = detectRepeatedPatterns(personalMemoryRecords).patterns;
    const replay = replayDecision({
      currentDecision: {
        id: 'decision_current_add_replay_polish',
        prompt: 'Should I add more Decision Replay polish before review?',
        emotions: ['anxiety', 'pressure'],
        choices: ['add polish', 'freeze for review'],
        topicTags: ['launch', 'feature addition', 'Decision Replay'],
      },
      memories: personalMemoryRecords,
      patterns,
    });

    const graph = buildGraphEvidence({
      currentQuery: {
        id: 'decision_current_add_replay_polish',
        text: replay.currentDecision.prompt,
      },
      memories: personalMemoryRecords,
      replay,
      patterns,
    });

    expect(graph.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'decision:decision_current_add_replay_polish',
          kind: 'decision',
          trace: [{ type: 'query', id: 'decision_current_add_replay_polish' }],
        }),
        expect.objectContaining({
          id: 'choice:add-polish',
          trace: [{ type: 'query', id: 'decision_current_add_replay_polish' }],
        }),
        expect.objectContaining({
          id: 'outcome:launch-delayed-by-two-days-after-adding-graph-filters',
          trace: expect.arrayContaining([{ type: 'memory', id: 'mem_launch_may_anxiety_scope_delay' }]),
        }),
      ]),
    );
    expect(graph.edges).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'edge:decision:decision_current_add_replay_polish->memory:mem_launch_may_anxiety_scope_delay:decision_replay',
          trace: [{ type: 'memory', id: 'mem_launch_may_anxiety_scope_delay' }],
        }),
      ]),
    );
    expectTraceableGraph(graph, ['decision_current_add_replay_polish']);
    expectDrawerContract(graph);
  });
});
