import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import type { ImportPreview } from './importPreview';
import type { ApplyImportPreviewResult } from './memoryIngestion';
import type { MemoryRecord } from './memoryRecord';
import { handlePersonalMemoryApiRequest, handlePrivateVaultMemoryApiRequest } from './personalMemoryApi';
import type { PersonalMemoryAgentResult } from './personalMemoryAgent';
import { createLocalPrivateVaultSession } from './privateVault';
import { createSavedAskArtifact } from './savedMemoryArtifact';
import type { WeeklyReport } from './weeklyReport';

describe('personal memory API boundary', () => {
  test('handles capture and import preview/apply through a user-scoped store', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);

    const capture = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/capture',
        body: {
          text: '오늘은 weekly report를 먼저 마무리했다.',
          capturedAt: '2026-05-27T13:00:00.000Z',
          emotionHints: ['resolve'],
          projectHints: ['personal-memory-ai'],
        },
      },
    });

    expect(capture.statusCode).toBe(201);
    expect(capture.body).toEqual(
      expect.objectContaining({
        createdMemoryIds: [expect.stringMatching(/^mem_mobile_/)],
      }),
    );

    const preview = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/import/preview',
        body: {
          batchId: 'api-import',
          createdAt: '2026-05-27T13:05:00.000Z',
          candidates: [
            {
              sourceType: 'notion',
              sourceRef: personalMemoryRecords[0].sourceRef,
              observedAt: personalMemoryRecords[0].observedAt,
              rawText: personalMemoryRecords[0].rawText,
            },
            {
              sourceType: 'markdown',
              sourceRef: 'markdown://api/new.md',
              observedAt: '2026-05-27',
              rawText: 'API endpoint should apply only new private memories.',
              summary: 'API endpoint applies new private memories.',
            },
          ],
        },
      },
    });

    expect(preview.statusCode).toBe(200);
    const previewBody = preview.body as { preview: ImportPreview };
    expect(previewBody.preview.summary.duplicates).toEqual({ duplicate: 1, new: 1, possible: 0 });

    const applied = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/import/apply',
        body: {
          preview: previewBody.preview,
        },
      },
    });

    expect(applied.statusCode).toBe(201);
    const appliedBody = applied.body as ApplyImportPreviewResult;
    expect(appliedBody.createdMemoryIds).toHaveLength(1);
    expect(appliedBody.skippedPreviewRecordIds).toEqual(['import_preview_api-import_1']);
  });

  test('persists saved artifacts through the capture endpoint as private memories', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_saved_artifact_guard',
      sourceRef: 'obsidian://other-user/saved-artifact-guard',
    });
    const artifact = createSavedAskArtifact({
      question: '이번에도 기능을 더 넣어야 할까?',
      createdAt: '2026-05-28T02:00:00.000Z',
      answer: {
        status: 'implemented',
        evidenceLabel: 'sufficient_evidence',
        answer: 'Freeze scope based on cited memories.',
        recommendation: 'Freeze scope before adding another feature.',
        evidenceBullets: [],
        citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
        confidence: 0.87,
        graphHighlightIds: ['memory:mem_launch_may_anxiety_scope_delay'],
      },
    });

    const saved = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/capture',
        body: { artifact },
      },
    });

    expect(saved.statusCode).toBe(201);
    expect(saved.body).toEqual(
      expect.objectContaining({
        createdMemoryIds: [expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/)],
        record: expect.objectContaining({
          id: expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/),
          sourceRef: expect.stringContaining('personal-memory-ai://saved-artifacts/'),
          memoryType: 'reflection',
        }),
      }),
    );
    const userARecords = await store.listByUser('user-a');
    expect(userARecords.map((record) => record.id)).toEqual(
      expect.arrayContaining([expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/)]),
    );
    expect((await store.listByUser('user-b')).map((record) => record.id)).toEqual([
      'mem_other_user_saved_artifact_guard',
    ]);
  });

  test('handles ask, replay, and weekly report without leaking another user memory', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of personalMemoryRecords.slice(0, 3)) {
      await store.create('user-a', record);
    }
    await store.create('user-b', {
      ...personalMemoryRecords[0],
      id: 'mem_other_user_api_private',
      sourceRef: 'notion://other-user/private',
    });

    const ask = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/ask',
        body: {
          question: '이번에도 기능을 더 넣어야 할까?',
          queryId: 'api-ask-001',
        },
      },
    });

    expect(ask.statusCode).toBe(200);
    const askBody = ask.body as PersonalMemoryAgentResult;
    expect(askBody.ask.evidenceLabel).toBe('sufficient_evidence');
    expect(JSON.stringify(ask.body)).not.toContain('mem_other_user_api_private');

    const replay = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/replay',
        body: {
          question: 'Decision replay',
          currentDecision: {
            id: 'api-decision',
            prompt: 'Should I add another feature?',
            emotions: ['anxiety'],
            choices: ['add feature', 'freeze'],
            topicTags: ['launch', 'feature addition'],
          },
        },
      },
    });

    expect(replay.statusCode).toBe(200);
    const replayBody = replay.body as { replay: NonNullable<PersonalMemoryAgentResult['replay']> };
    expect(replayBody.replay.evidenceLabel).toBe('sufficient_evidence');

    const report = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/report/weekly',
        body: {
          startDate: '2026-05-01',
          endDate: '2026-05-20',
          generatedAt: '2026-05-27T13:10:00.000Z',
        },
      },
    });

    expect(report.statusCode).toBe(200);
    const reportBody = report.body as { weeklyReport: WeeklyReport };
    expect(reportBody.weeklyReport.includedMemoryIds).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
    ]);
    expect(JSON.stringify(report.body)).not.toContain('mem_other_user_api_private');
  });

  test('handles export and delete within one private user scope', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-a', personalMemoryRecords[1]);
    await store.create('user-b', {
      ...personalMemoryRecords[0],
      id: 'mem_other_user_delete_guard',
      sourceRef: 'notion://other-user/delete-guard',
    });

    const exported = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'GET',
        path: '/api/export',
      },
    });

    expect(exported.statusCode).toBe(200);
    const exportedBody = exported.body as { records: MemoryRecord[] };
    expect(exportedBody.records.map((record) => record.id).sort()).toEqual([
      'mem_launch_june_anxiety_scope_delay',
      'mem_launch_may_anxiety_scope_delay',
    ]);

    const deleted = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/delete',
        body: {
          memoryIds: ['mem_launch_may_anxiety_scope_delay'],
        },
      },
    });

    expect(deleted.body).toEqual({ deletedCount: 1 });
    expect((await store.listByUser('user-a')).map((record) => record.id)).toEqual([
      'mem_launch_june_anxiety_scope_delay',
    ]);
    expect((await store.listByUser('user-b')).map((record) => record.id)).toEqual([
      'mem_other_user_delete_guard',
    ]);

    const hardDeleted = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/delete',
        body: {
          hardDeleteUserData: true,
        },
      },
    });

    expect(hardDeleted.body).toEqual({ deletedCount: 1 });
    expect(await store.listByUser('user-a')).toEqual([]);
    expect((await store.listByUser('user-b')).map((record) => record.id)).toEqual([
      'mem_other_user_delete_guard',
    ]);
  });

  test('handles API requests through the private vault session owner and ignores caller supplied user ids', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_user_b_should_not_export',
      sourceRef: 'obsidian://other-user/private',
    });

    const exported = await handlePrivateVaultMemoryApiRequest({
      store,
      session: createLocalPrivateVaultSession({
        userId: 'user-a',
        sessionId: 'session-user-a',
        createdAt: '2026-05-27T16:00:00.000Z',
      }),
      request: {
        method: 'GET',
        path: '/api/export',
        body: {
          userId: 'user-b',
        },
      },
    });

    expect(exported.statusCode).toBe(200);
    const exportedBody = exported.body as { records: MemoryRecord[] };
    expect(exportedBody.records.map((record) => record.id)).toEqual(['mem_launch_may_anxiety_scope_delay']);
    expect(JSON.stringify(exported.body)).not.toContain('mem_user_b_should_not_export');
  });
});
