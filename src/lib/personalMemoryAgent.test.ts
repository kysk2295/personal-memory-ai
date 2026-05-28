import { describe, expect, test } from 'vitest';
import { createMemoryStore } from './createMemoryStore';
import { normalizeMemoryRecord, type MemoryRecord } from './memoryRecord';
import { answerPersonalMemoryQuestion } from './personalMemoryAgent';

function memory(input: Partial<MemoryRecord> & Pick<MemoryRecord, 'id' | 'sourceType' | 'sourceRef' | 'rawText'>): MemoryRecord {
  return normalizeMemoryRecord({
    sourceType: input.sourceType,
    sourceRef: input.sourceRef,
    rawText: input.rawText,
    id: input.id,
    createdAt: input.createdAt ?? '2026-05-27T00:00:00.000Z',
    observedAt: input.observedAt,
    summary: input.summary,
    memoryType: input.memoryType,
    emotionTags: input.emotionTags,
    topicTags: input.topicTags,
    projectTags: input.projectTags,
    peopleTags: input.peopleTags,
    decisionSignal: input.decisionSignal,
    outcomeText: input.outcomeText,
    embeddingStatus: input.embeddingStatus,
    extractionStatus: input.extractionStatus,
  });
}

const sufficientMemories = [
  memory({
    id: 'mem_agent_may_scope_delay',
    sourceType: 'notion',
    sourceRef: 'notion://launch/may',
    observedAt: '2026-05-01',
    rawText: 'Anxiety before launch led to scope expansion, adding graph filters, and launch delayed by two days.',
    summary: 'Anxiety led to graph filter scope expansion and a two-day launch delay.',
    memoryType: 'decision',
    emotionTags: ['anxiety'],
    topicTags: ['scope expansion', 'launch'],
    projectTags: ['personal-memory-ai'],
    decisionSignal: 'chosen',
    outcomeText: 'Launch delayed by two days after adding graph filters.',
  }),
  memory({
    id: 'mem_agent_june_scope_delay',
    sourceType: 'obsidian',
    sourceRef: 'obsidian://daily/2026-06-02',
    observedAt: '2026-06-02',
    rawText: 'Felt anxious and added onboarding examples as feature addition; launch delayed after the extra polish.',
    summary: 'Anxiety caused feature addition and delayed launch again.',
    memoryType: 'reflection',
    emotionTags: ['anxiety'],
    topicTags: ['feature addition', 'launch'],
    projectTags: ['personal-memory-ai'],
    decisionSignal: 'chosen',
    outcomeText: 'Launch delayed after onboarding examples were added.',
  }),
];

describe('answerPersonalMemoryQuestion', () => {
  test('answers from one user memories with ask, replay, pattern, and graph evidence citations', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of sufficientMemories) {
      await store.create('user-a', record);
    }
    await store.create(
      'user-a',
      memory({
        id: 'mem_agent_same_user_calm_unrelated',
        sourceType: 'markdown',
        sourceRef: 'markdown://daily/calm-unrelated.md',
        observedAt: '2026-06-03',
        rawText: 'Calm note about a walk and lunch after sending email.',
        summary: 'Calm walk and lunch note.',
        memoryType: 'diary',
        emotionTags: ['calm'],
        topicTags: ['walk', 'lunch'],
      }),
    );
    await store.create(
      'user-b',
      memory({
        ...sufficientMemories[0],
        id: 'mem_other_user_should_not_leak',
        sourceRef: 'notion://other-user/private',
      }),
    );

    const result = await answerPersonalMemoryQuestion({
      store,
      userId: 'user-a',
      question: '이번에도 기능을 더 넣어야 할까?',
      currentDecision: {
        id: 'decision_agent_scope',
        prompt: 'MVP에 기능을 더 넣을지, 지금 배포할지',
        emotions: ['anxiety'],
        choices: ['add features', 'ship now'],
        topicTags: ['launch', 'feature addition'],
      },
      queryId: 'agent-query-001',
      createdAt: '2026-05-27T12:00:00.000Z',
    });

    expect(result.privacyScope).toBe('private');
    expect(result.loadedMemoryIds.sort()).toEqual(['mem_agent_june_scope_delay', 'mem_agent_may_scope_delay']);
    expect(result.loadedMemoryIds).not.toContain('mem_agent_same_user_calm_unrelated');
    expect(result.loadedMemoryIds).not.toContain('mem_other_user_should_not_leak');
    expect(result.retrievalQuery.expandedQuery).toContain('feature addition');
    expect(result.retrieval.retrievedMemoryIds.slice().sort()).toEqual(result.loadedMemoryIds.slice().sort());
    expect(result.ask.evidenceLabel).toBe('sufficient_evidence');
    expect(result.ask.citationMemoryIds.sort()).toEqual(result.loadedMemoryIds.slice().sort());
    expect(result.coachingBrief.evidenceLabel).toBe('sufficient_evidence');
    expect(result.coachingBrief.recommendation).toBe(result.ask.recommendation);
    expect(result.coachingBrief.citationCount).toBe(2);
    expect(result.coachingBrief.nextActions.join(' ')).toContain('freeze');
    expect(result.coachingBrief.nextActions.join(' ')).toContain('user feedback');
    expect(result.coachingBrief.nextActions.join(' ')).toContain('citation');
    expect(result.coachingBrief.boundary).toContain('cited personal memories');
    expect(result.coachingBrief.evidenceCoverage.memoryTypes.sort()).toEqual(['decision', 'reflection']);
    expect(result.coachingBrief.evidenceCoverage.sourceTypes.sort()).toEqual(['notion', 'obsidian']);
    expect(result.coachingBrief.evidenceCoverage.observedRange).toEqual({
      start: '2026-05-01',
      end: '2026-06-02',
    });
    expect(result.savedArtifact).toEqual(
      expect.objectContaining({
        kind: 'ask_answer',
        title: 'Ask My Past Self: 이번에도 기능을 더 넣어야 할까?',
        citationMemoryIds: expect.arrayContaining(result.loadedMemoryIds),
        metadata: expect.objectContaining({
          citationCount: 2,
          recommendation: result.ask.recommendation,
        }),
      }),
    );
    expect(result.replay?.evidenceLabel).toBe('sufficient_evidence');
    expect(result.replay?.citationMemoryIds.sort()).toEqual(result.loadedMemoryIds.slice().sort());
    expect(result.graphEvidence.highlightIds).toEqual(expect.arrayContaining(['query:agent-query-001']));
    expect(result.graphEvidence.drawerItems.map((item) => item.citation).join(' ')).not.toContain(
      'mem_other_user_should_not_leak',
    );
  });

  test('returns explicit insufficient evidence instead of generic advice when user memories are weak', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create(
      'user-a',
      memory({
        id: 'mem_agent_calm_note',
        sourceType: 'markdown',
        sourceRef: 'markdown://daily/calm.md',
        observedAt: '2026-05-20',
        rawText: 'Calm note about taking a walk after lunch.',
        summary: 'Calm walk after lunch.',
        memoryType: 'diary',
        emotionTags: ['calm'],
      }),
    );

    const result = await answerPersonalMemoryQuestion({
      store,
      userId: 'user-a',
      question: '이번에도 기능을 더 넣어야 할까?',
      queryId: 'agent-query-weak',
    });

    expect(result.ask.evidenceLabel).toBe('insufficient_evidence');
    expect(result.retrieval.evidenceLabel).toBe('insufficient_evidence');
    expect(result.loadedMemoryIds).toEqual([]);
    expect(result.coachingBrief.evidenceLabel).toBe('insufficient_evidence');
    expect(result.coachingBrief.nextActions).toEqual([
      'Import or write at least two relevant memories before asking for a personal recommendation.',
      'Capture the current decision, emotion, options, and expected outcome as a diary memory.',
    ]);
    expect(result.ask.answer).toContain('insufficient evidence');
    expect(result.ask.answer).toContain('No generic advice was generated.');
    expect(result.replay).toBeUndefined();
    expect(result.graphEvidence.highlightIds).toEqual(expect.arrayContaining(['query:agent-query-weak']));
  });

  test('anchors vague follow-up questions to previous cited memories', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of sufficientMemories) {
      await store.create('user-a', record);
    }

    const result = await answerPersonalMemoryQuestion({
      store,
      userId: 'user-a',
      question: '그럼 오늘 뭘 먼저 해야 해?',
      queryId: 'agent-follow-up-001',
      followUpContext: {
        previousQuestion: '이번에도 기능을 더 넣어야 할까?',
        previousRecommendation: '이번에는 기능을 더 넣기보다 freeze하고 사용자 피드백을 먼저 받으세요.',
        previousCitationMemoryIds: ['mem_agent_may_scope_delay', 'mem_agent_june_scope_delay'],
      },
    });

    expect(result.conversationContext).toEqual(
      expect.objectContaining({
        mode: 'follow_up',
        previousQuestion: '이번에도 기능을 더 넣어야 할까?',
        anchoredCitationMemoryIds: ['mem_agent_june_scope_delay', 'mem_agent_may_scope_delay'],
      }),
    );
    expect(result.loadedMemoryIds.slice().sort()).toEqual(['mem_agent_june_scope_delay', 'mem_agent_may_scope_delay']);
    expect(result.retrievalQuery.sourceTerms).toEqual(
      expect.arrayContaining(['그럼 오늘 뭘 먼저 해야 해?', '이번에도 기능을 더 넣어야 할까?']),
    );
    expect(result.retrievalQuery.expandedQuery).toContain('freeze');
    expect(result.ask.evidenceLabel).toBe('sufficient_evidence');
    expect(result.savedArtifact.metadata.followUpMode).toBe('follow_up');
  });
});
