import { describe, expect, test } from 'vitest';
import { createMemoryStore } from './createMemoryStore';
import { createUserFeedbackMemoryRecord, saveUserFeedbackMemory } from './userFeedbackMemory';

describe('user feedback memory', () => {
  test('turns user correction into a private feedback MemoryRecord', () => {
    const record = createUserFeedbackMemoryRecord({
      feedbackId: 'feedback-001',
      createdAt: '2026-05-28T03:00:00.000Z',
      correctionText: '내가 원하는 건 조언이 아니라 과거 일기 근거를 먼저 보여주는 답변이다.',
      targetMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
      targetArtifactId: 'artifact_ask_answer_sha-test',
      emotionTags: ['frustration'],
      projectTags: ['personal-memory-ai'],
    });

    expect(record).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^mem_api_feedback_/),
        sourceType: 'api',
        sourceRef: 'personal-memory-ai://feedback/feedback-001',
        createdAt: '2026-05-28T03:00:00.000Z',
        observedAt: '2026-05-28',
        memoryType: 'reflection',
        privacyScope: 'private',
        extractionStatus: 'manual',
      }),
    );
    expect(record.summary).toBe('User correction: 내가 원하는 건 조언이 아니라 과거 일기 근거를 먼저 보여주는 답변이다.');
    expect(record.topicTags).toEqual(expect.arrayContaining(['agent feedback', 'correction']));
    expect(record.emotionTags).toEqual(['frustration']);
    expect(record.rawText).toContain('Target memories: mem_launch_may_anxiety_scope_delay');
    expect(record.rawText).toContain('Target artifact: artifact_ask_answer_sha-test');
  });

  test('saves feedback memory through the user-scoped MemoryStore boundary', async () => {
    const store = createMemoryStore({ env: {} });

    const saved = await saveUserFeedbackMemory({
      store,
      userId: 'user-a',
      input: {
        feedbackId: 'feedback-store-001',
        createdAt: '2026-05-28T03:05:00.000Z',
        correctionText: 'Decision Replay보다 먼저 citation을 보여줘야 한다.',
        targetMemoryIds: ['mem_freeze_vs_feature_addition'],
      },
    });

    expect(saved.createdMemoryIds).toEqual([expect.stringMatching(/^mem_api_feedback_/)]);
    expect(saved.record.rawText).toContain('Decision Replay보다 먼저 citation을 보여줘야 한다.');
    expect((await store.listByUser('user-a')).map((record) => record.id)).toEqual(saved.createdMemoryIds);
    expect(await store.listByUser('user-b')).toEqual([]);
  });
});
