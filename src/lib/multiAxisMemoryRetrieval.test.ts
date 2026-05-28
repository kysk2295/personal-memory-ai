import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import {
  retrieveMultiAxisMemories,
  retrieveMultiAxisMemoriesFromRecords,
} from './multiAxisMemoryRetrieval';
import { createUserFeedbackMemoryRecord } from './userFeedbackMemory';

describe('multi-axis memory retrieval router', () => {
  test('returns deterministic scored memories with per-axis explanations', () => {
    const first = retrieveMultiAxisMemoriesFromRecords({
      records: personalMemoryRecords,
      query: 'anxiety launch delay',
      limit: 3,
    });
    const second = retrieveMultiAxisMemoriesFromRecords({
      records: [...personalMemoryRecords].reverse(),
      query: 'anxiety launch delay',
      limit: 3,
    });

    expect(first).toEqual(second);
    expect(first.status).toBe('implemented');
    expect(first.evidenceLabel).toBe('sufficient_evidence');
    expect(first.ledgerCheckpointId).toMatch(/^checkpoint:sha-/);
    expect(first.axisWeights).toEqual({
      keyword: 1,
      semantic: 1.2,
      graph: 0.7,
      temporal: 0.15,
      feedback: 1.6,
    });
    expect(first.retrievedMemoryIds).toEqual([
      'mem_freeze_vs_feature_addition',
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
    ]);
    expect(first.retrievedMemories[0]).toEqual(
      expect.objectContaining({
        memory: expect.objectContaining({ id: 'mem_freeze_vs_feature_addition' }),
        axisScores: expect.objectContaining({
          keyword: expect.any(Number),
          semantic: expect.any(Number),
          graph: expect.any(Number),
          temporal: expect.any(Number),
          feedback: expect.any(Number),
        }),
        reasons: expect.arrayContaining([expect.stringContaining('keyword')]),
      }),
    );
  });

  test('uses ledger graph traversal to include linked memories that do not directly match the query text', () => {
    const result = retrieveMultiAxisMemoriesFromRecords({
      records: personalMemoryRecords,
      query: '온보딩 예시 결정 되짚기 제어',
      limit: 4,
    });

    expect(result.retrievedMemoryIds[0]).toBe('mem_launch_june_anxiety_scope_delay');
    expect(result.retrievedMemoryIds).toEqual(
      expect.arrayContaining([
        'mem_launch_may_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ]),
    );
    const graphOnly = result.retrievedMemories.find(
      (entry) => entry.memory.id === 'mem_freeze_vs_feature_addition',
    );
    expect(graphOnly?.axisScores.graph).toBeGreaterThan(0);
    expect(graphOnly?.supportingEdgeIds).toEqual(
      expect.arrayContaining([
        expect.stringContaining('reinforces-pattern'),
      ]),
    );
  });

  test('keeps retrieval user-scoped through MemoryStore and reports 근거 부족', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of personalMemoryRecords) {
      await store.create('user-a', record);
    }
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_onboarding_private',
      sourceRef: 'obsidian://other-user/onboarding',
    });

    const scoped = await retrieveMultiAxisMemories({
      store,
      userId: 'user-a',
      query: '온보딩 예시 결정 되짚기 제어',
      limit: 5,
    });

    expect(scoped.retrievedMemoryIds).toContain('mem_launch_june_anxiety_scope_delay');
    expect(scoped.retrievedMemoryIds).not.toContain('mem_other_user_onboarding_private');

    const insufficient = await retrieveMultiAxisMemories({
      store,
      userId: 'user-a',
      query: 'gardening nutrition',
      limit: 5,
    });

    expect(insufficient).toMatchObject({
      evidenceLabel: 'insufficient_evidence',
      retrievedMemoryIds: [],
      insufficientEvidenceReason: 'No user-scoped MemoryRecord matched semantic, keyword, graph, or temporal retrieval gates.',
    });
  });

  test('prioritizes matching feedback correction memories for future answers', () => {
    const feedback = createUserFeedbackMemoryRecord({
      feedbackId: 'feedback-retrieval-001',
      createdAt: '2026-05-28T04:00:00.000Z',
      correctionText: '다음 답변에서는 결론보다 citation first, 근거 기억 먼저 보여줘.',
      targetMemoryIds: ['mem_freeze_vs_feature_addition'],
      targetArtifactId: 'artifact_ask_answer_sha-test',
    });

    const result = retrieveMultiAxisMemoriesFromRecords({
      records: [...personalMemoryRecords, feedback],
      query: 'citation first 근거 먼저',
      limit: 3,
    });

    expect(result.axisWeights.feedback).toBe(1.6);
    expect(result.retrievedMemoryIds[0]).toBe(feedback.id);
    expect(result.retrievedMemories[0]).toEqual(
      expect.objectContaining({
        memory: expect.objectContaining({ id: feedback.id }),
        axisScores: expect.objectContaining({ feedback: expect.any(Number) }),
        reasons: expect.arrayContaining([expect.stringContaining('feedback correction')]),
      }),
    );
    expect(result.retrievedMemories[0].axisScores.feedback).toBeGreaterThan(0);
  });
});
