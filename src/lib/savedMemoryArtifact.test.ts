import { describe, expect, test } from 'vitest';
import { askMyPastSelf } from './askMyPastSelf';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import { replayDecision } from './decisionReplay';
import { detectRepeatedPatterns } from './patternDetector';
import {
  createSavedAskArtifact,
  createSavedDecisionReplayArtifact,
  createSavedMemorySessionArtifact,
  createSavedWeeklyReportArtifact,
  saveArtifactAsMemoryRecord,
  savedArtifactToMemoryRecord,
} from './savedMemoryArtifact';
import { generateWeeklyReport } from './weeklyReport';

const createdAt = '2026-05-27T15:00:00.000Z';

function sufficientAskAnswer() {
  const patterns = detectRepeatedPatterns(personalMemoryRecords).patterns;
  return askMyPastSelf({
    question: '이번에도 기능을 더 넣어야 할까?',
    memories: personalMemoryRecords,
    patterns,
  });
}

describe('saved memory artifacts', () => {
  test('creates a private saved Ask artifact with citations and graph highlights', () => {
    const answer = sufficientAskAnswer();
    const artifact = createSavedAskArtifact({
      question: '이번에도 기능을 더 넣어야 할까?',
      answer,
      queryId: 'saved-ask-001',
      createdAt,
    });

    expect(artifact).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^artifact_ask_answer_sha-/),
        kind: 'ask_answer',
        title: 'Ask My Past Self: 이번에도 기능을 더 넣어야 할까?',
        evidenceLabel: 'sufficient_evidence',
        privacyScope: 'private',
        createdAt,
        queryId: 'saved-ask-001',
        citationMemoryIds: answer.citationMemoryIds,
        graphHighlightIds: answer.graphHighlightIds,
        confidence: answer.confidence,
      }),
    );
    expect(artifact.body).toContain(answer.recommendation);
  });

  test('converts a saved Ask artifact into a private citation-rich MemoryRecord', () => {
    const artifact = createSavedAskArtifact({
      question: '이번에도 기능을 더 넣어야 할까?',
      answer: sufficientAskAnswer(),
      createdAt,
    });

    const record = savedArtifactToMemoryRecord(artifact);

    expect(record).toEqual(
      expect.objectContaining({
        id: `mem_api_${artifact.id}`,
        sourceType: 'api',
        sourceRef: `personal-memory-ai://saved-artifacts/${artifact.id}`,
        createdAt,
        observedAt: '2026-05-27',
        memoryType: 'reflection',
        privacyScope: 'private',
        extractionStatus: 'ready',
        embeddingStatus: 'pending',
      }),
    );
    expect(record.rawText).toContain('Question: 이번에도 기능을 더 넣어야 할까?');
    expect(record.rawText).toContain('Citations: mem_freeze_vs_feature_addition');
    expect(record.topicTags).toEqual(expect.arrayContaining(['saved artifact', 'ask my past self']));
  });

  test('creates saved decision replay and weekly report artifacts with future-memory metadata', () => {
    const patterns = detectRepeatedPatterns(personalMemoryRecords).patterns;
    const replay = replayDecision({
      currentDecision: {
        id: 'decision_saved_artifact_scope',
        prompt: 'Should I add one more feature before review?',
        emotions: ['anxiety'],
        choices: ['add feature', 'freeze'],
        topicTags: ['launch', 'feature addition'],
      },
      memories: personalMemoryRecords,
      patterns,
    });
    const replayArtifact = createSavedDecisionReplayArtifact({ replay, createdAt });

    expect(replayArtifact.kind).toBe('decision_replay');
    expect(replayArtifact.citationMemoryIds).toEqual(replay.citationMemoryIds);
    expect(savedArtifactToMemoryRecord(replayArtifact)).toEqual(
      expect.objectContaining({
        memoryType: 'decision',
        decisionSignal: 'chosen',
      }),
    );

    const weeklyReport = generateWeeklyReport({
      records: personalMemoryRecords,
      startDate: '2026-05-01',
      endDate: '2026-05-20',
      generatedAt: createdAt,
    });
    const reportArtifact = createSavedWeeklyReportArtifact({ weeklyReport, createdAt });
    const reportRecord = savedArtifactToMemoryRecord(reportArtifact);

    expect(reportArtifact).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^artifact_weekly_report_sha-/),
        kind: 'weekly_report',
        title: 'Weekly Report: 2026-05-01 to 2026-05-20',
        citationMemoryIds: weeklyReport.includedMemoryIds,
        metadata: expect.objectContaining({
          startDate: '2026-05-01',
          endDate: '2026-05-20',
          totalMemoryRecords: 3,
        }),
      }),
    );
    expect(reportRecord.memoryType).toBe('pattern');
    expect(reportRecord.topicTags).toEqual(expect.arrayContaining(['saved artifact', 'weekly report']));
    expect(reportRecord.rawText).toContain('Included memories: mem_launch_may_anxiety_scope_delay');
  });

  test('creates a saved memory session artifact from source and related memories', () => {
    const artifact = createSavedMemorySessionArtifact({
      sourceMemoryId: 'mem_launch_may_anxiety_scope_delay',
      relatedMemoryIds: ['mem_freeze_vs_feature_addition', 'mem_launch_june_anxiety_scope_delay'],
      askCitationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
      replayCitationMemoryIds: ['mem_freeze_vs_feature_addition'],
      weeklyCitationMemoryIds: ['mem_launch_june_anxiety_scope_delay'],
      createdAt,
    });
    const record = savedArtifactToMemoryRecord(artifact);

    expect(artifact).toEqual(
      expect.objectContaining({
        id: expect.stringMatching(/^artifact_memory_session_sha-/),
        kind: 'memory_session',
        title: 'Guided Memory Session: mem_launch_may_anxiety_scope_delay',
        citationMemoryIds: [
          'mem_freeze_vs_feature_addition',
          'mem_launch_june_anxiety_scope_delay',
          'mem_launch_may_anxiety_scope_delay',
        ],
        metadata: expect.objectContaining({
          sourceMemoryId: 'mem_launch_may_anxiety_scope_delay',
          relatedMemoryCount: 2,
        }),
      }),
    );
    expect(record).toEqual(
      expect.objectContaining({
        id: `mem_api_${artifact.id}`,
        memoryType: 'reflection',
        sourceRef: `personal-memory-ai://saved-artifacts/${artifact.id}`,
      }),
    );
    expect(record.topicTags).toEqual(expect.arrayContaining(['saved artifact', 'memory session']));
    expect(record.rawText).toContain('Source memory: mem_launch_may_anxiety_scope_delay');
    expect(record.rawText).toContain('Related memories: mem_freeze_vs_feature_addition, mem_launch_june_anxiety_scope_delay');
  });

  test('saves artifact records through the user-scoped MemoryStore boundary', async () => {
    const store = createMemoryStore({ env: {} });
    const artifact = createSavedAskArtifact({
      question: '이번에도 기능을 더 넣어야 할까?',
      answer: sufficientAskAnswer(),
      createdAt,
    });

    const saved = await saveArtifactAsMemoryRecord({ store, userId: 'user-a', artifact });

    expect(saved.id).toBe(`mem_api_${artifact.id}`);
    expect((await store.listByUser('user-a')).map((record) => record.id)).toEqual([saved.id]);
    expect(await store.listByUser('user-b')).toEqual([]);
  });
});
