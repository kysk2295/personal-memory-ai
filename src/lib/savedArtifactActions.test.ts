import { describe, expect, test } from 'vitest';
import { buildInitialAppShellEvidenceLayout } from './appShellEvidenceLayout';
import { buildSavedArtifactActions } from './savedArtifactActions';

describe('buildSavedArtifactActions', () => {
  test('builds deterministic save actions for Ask, Decision Replay, and Weekly Report artifacts', () => {
    const layout = buildInitialAppShellEvidenceLayout();
    const actions = buildSavedArtifactActions({
      askQuestion: layout.askQuestion,
      ask: layout.ask,
      replay: layout.replay,
      weeklyReport: layout.weeklyReport,
      createdAt: '2026-05-28T00:00:00.000Z',
    });

    expect(actions.map((action) => action.kind)).toEqual(['ask_answer', 'decision_replay', 'weekly_report']);
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          kind: 'ask_answer',
          label: 'Save answer',
          endpoint: '/api/capture',
          method: 'POST',
          initialState: 'ready',
          citationCount: layout.ask.citationMemoryIds.length,
          sourceRef: expect.stringMatching(/^personal-memory-ai:\/\/saved-artifacts\/artifact_ask_answer_sha-/),
          futureMemoryId: expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/),
        }),
        expect.objectContaining({
          kind: 'decision_replay',
          label: 'Save replay',
          citationCount: layout.replay.citationMemoryIds.length,
          sourceRef: expect.stringMatching(/^personal-memory-ai:\/\/saved-artifacts\/artifact_decision_replay_sha-/),
        }),
        expect.objectContaining({
          kind: 'weekly_report',
          label: 'Save report',
          citationCount: layout.weeklyReport.includedMemoryIds.length,
          sourceRef: expect.stringMatching(/^personal-memory-ai:\/\/saved-artifacts\/artifact_weekly_report_sha-/),
        }),
      ]),
    );
  });
});
