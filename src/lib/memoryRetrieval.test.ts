import { describe, expect, test } from 'vitest';
import { askMyPastSelf } from './askMyPastSelf';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import { replayDecision } from './decisionReplay';
import { detectRepeatedPatterns } from './patternDetector';
import {
  retrieveRelevantMemories,
  retrieveRelevantMemoriesFromRecords,
} from './memoryRetrieval';
import { generateWeeklyReport } from './weeklyReport';

describe('memory retrieval contract', () => {
  test('ranks memories by deterministic query relevance and excludes zero-score records', () => {
    const result = retrieveRelevantMemoriesFromRecords({
      records: personalMemoryRecords,
      query: 'anxiety launch delay',
      limit: 3,
    });

    expect(result.status).toBe('implemented');
    expect(result.evidenceLabel).toBe('sufficient_evidence');
    expect(result.retrievedMemoryIds).toEqual([
      'mem_launch_june_anxiety_scope_delay',
      'mem_launch_may_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(result.retrievedMemories[0]).toMatchObject({
      memory: expect.objectContaining({ id: 'mem_launch_june_anxiety_scope_delay' }),
      matchedTerms: expect.arrayContaining(['anxiety', 'launch']),
    });
    expect(result.retrievedMemoryIds).not.toContain('mem_unrelated_calm_import');
  });

  test('retrieves only one user memories from MemoryStore and reports insufficient evidence explicitly', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of personalMemoryRecords) {
      await store.create('user-a', record);
    }
    await store.create('user-b', {
      ...personalMemoryRecords[0],
      id: 'mem_other_user_matching_private_memory',
      sourceRef: 'notion://other-user/private-launch',
    });

    const scoped = await retrieveRelevantMemories({
      store,
      userId: 'user-a',
      query: 'anxiety launch delay',
      limit: 5,
    });

    expect(scoped.retrievedMemoryIds).toContain('mem_launch_may_anxiety_scope_delay');
    expect(scoped.retrievedMemoryIds).not.toContain('mem_other_user_matching_private_memory');

    const insufficient = await retrieveRelevantMemories({
      store,
      userId: 'user-a',
      query: 'gardening nutrition',
      limit: 5,
    });

    expect(insufficient).toMatchObject({
      evidenceLabel: 'insufficient_evidence',
      retrievedMemoryIds: [],
      insufficientEvidenceReason: 'No user-scoped MemoryRecord matched the retrieval query.',
    });
  });

  test('retrieved memories can feed Ask, Decision Replay, and Weekly Report without unrelated records', () => {
    const retrieval = retrieveRelevantMemoriesFromRecords({
      records: personalMemoryRecords,
      query: 'anxiety feature addition launch delay',
      limit: 3,
    });
    const patterns = detectRepeatedPatterns(retrieval.memories);
    const ask = askMyPastSelf({
      question: '이번에도 기능을 더 넣어야 할까?',
      memories: retrieval.memories,
      patterns: patterns.patterns,
    });
    const replay = replayDecision({
      currentDecision: {
        id: 'decision_retrieval_scope',
        prompt: 'Should I add one more feature before review?',
        emotions: ['anxiety'],
        choices: ['add feature', 'freeze'],
        topicTags: ['launch', 'feature addition'],
      },
      memories: retrieval.memories,
      patterns: patterns.patterns,
    });
    const weeklyReport = generateWeeklyReport({
      records: retrieval.memories,
      startDate: '2026-05-01',
      endDate: '2026-05-20',
      generatedAt: '2026-05-27T12:00:00.000Z',
    });

    expect(patterns.patterns[0].evidenceLabel).toBe('sufficient_evidence');
    expect(ask.citationMemoryIds.slice().sort()).toEqual(retrieval.retrievedMemoryIds.slice().sort());
    expect(replay.citationMemoryIds.slice().sort()).toEqual(retrieval.retrievedMemoryIds.slice().sort());
    expect(weeklyReport.includedMemoryIds.slice().sort()).toEqual(retrieval.retrievedMemoryIds.slice().sort());
  });
});
