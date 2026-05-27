import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import type { ImportPreview } from './importPreview';
import type { ApplyImportPreviewResult, UndoAppliedMemoryRecordsResult } from './memoryIngestion';
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

  test('undoes applied imports through the private API without crossing users', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_import_undo_shared',
      sourceRef: 'obsidian://other-user/import-undo-guard',
    });

    const preview = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/import/preview',
        body: {
          batchId: 'api-import-undo',
          createdAt: '2026-05-28T04:00:00.000Z',
          candidates: [
            {
              sourceType: 'markdown',
              sourceRef: 'markdown://api/undo.md',
              observedAt: '2026-05-28',
              rawText: 'Undoable imports should disappear from the private memory graph.',
              summary: 'Undoable import memory.',
            },
          ],
        },
      },
    });
    const previewBody = preview.body as { preview: ImportPreview };
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
    const appliedBody = applied.body as ApplyImportPreviewResult;
    expect(appliedBody.createdMemoryIds).toHaveLength(1);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: appliedBody.createdMemoryIds[0],
      sourceRef: 'obsidian://other-user/same-applied-id',
    });

    const undone = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/import/undo',
        body: {
          appliedMemoryRecordIds: appliedBody.createdMemoryIds,
        },
      },
    });

    expect(undone.statusCode).toBe(200);
    const undoneBody = undone.body as UndoAppliedMemoryRecordsResult;
    expect(undoneBody).toEqual({
      deletedCount: 1,
      appliedMemoryRecordIds: appliedBody.createdMemoryIds,
    });
    expect((await store.listByUser('user-a')).map((record) => record.id)).not.toContain(
      appliedBody.createdMemoryIds[0],
    );
    expect((await store.listByUser('user-b')).map((record) => record.id)).toEqual(
      expect.arrayContaining(['mem_import_undo_shared', appliedBody.createdMemoryIds[0]]),
    );
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

  test('reviews and updates one owner-scoped memory without crossing users', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_freeze_vs_feature_addition',
      sourceRef: 'obsidian://other-user/source-review-guard',
      summary: 'Other user private source review guard.',
    });

    const detail = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'GET',
        path: '/api/memory/detail',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
        },
      },
    });

    expect(detail.statusCode).toBe(200);
    expect(detail.body).toEqual({
      memory: expect.objectContaining({
        id: 'mem_freeze_vs_feature_addition',
        sourceRef: 'markdown://retros/freezing-vs-features.md',
        privacyScope: 'private',
      }),
      reviewHistory: [],
    });

    const updated = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/memory/update',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
          summary: 'Edited source-backed freeze decision.',
          rawText: 'Edited raw source text that keeps citation provenance.',
          observedAt: '2026-05-19',
          emotionTags: ['resolve', 'trust'],
          topicTags: ['launch', 'review'],
        },
      },
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.body).toEqual({
      memory: expect.objectContaining({
        id: 'mem_freeze_vs_feature_addition',
        summary: 'Edited source-backed freeze decision.',
        rawText: 'Edited raw source text that keeps citation provenance.',
        observedAt: '2026-05-19',
        emotionTags: ['resolve', 'trust'],
        topicTags: ['launch', 'review'],
        sourceRef: 'markdown://retros/freezing-vs-features.md',
      }),
      reviewLedgerEntry: expect.objectContaining({
        id: expect.stringMatching(/^memory_review_mem_freeze_vs_feature_addition_/),
        userId: 'user-a',
        memoryId: 'mem_freeze_vs_feature_addition',
        changedFields: ['summary', 'rawText', 'observedAt', 'emotionTags', 'topicTags'],
        beforeSummary: 'Anxiety creates a freeze-vs-feature-addition choice, and feature addition postpones launches.',
        afterSummary: 'Edited source-backed freeze decision.',
        sourceRef: 'markdown://retros/freezing-vs-features.md',
      }),
      reviewHistory: [
        expect.objectContaining({
          userId: 'user-a',
          memoryId: 'mem_freeze_vs_feature_addition',
          changedFields: ['summary', 'rawText', 'observedAt', 'emotionTags', 'topicTags'],
        }),
      ],
    });
    const userARecords = await store.listByUser('user-a');
    expect(userARecords).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: expect.stringMatching(/^memory_review_mem_freeze_vs_feature_addition_/),
          sourceRef: expect.stringContaining('personal-memory-ai://memory-review-ledger/'),
        }),
      ]),
    );
    expect(await store.getById('user-a', 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({
        summary: 'Edited source-backed freeze decision.',
        rawText: 'Edited raw source text that keeps citation provenance.',
      }),
    );
    expect(await store.getById('user-b', 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({
        sourceRef: 'obsidian://other-user/source-review-guard',
        summary: 'Other user private source review guard.',
      }),
    );

    const missing = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/memory/update',
        body: {
          memoryId: 'mem_missing_source_review',
          summary: 'Should not create a missing memory.',
        },
      },
    });

    expect(missing).toEqual({
      statusCode: 404,
      body: { error: 'memory_not_found' },
    });
  });

  test('returns owner-scoped memory review history from detail and history endpoints', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_freeze_vs_feature_addition',
      sourceRef: 'obsidian://other-user/review-history-guard',
      summary: 'Other user private review history guard.',
    });

    const first = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/memory/update',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
          summary: 'First review history edit.',
        },
      },
    });
    expect(first.statusCode).toBe(200);

    const second = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/memory/update',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
          summary: 'Second review history edit.',
        },
      },
    });
    expect(second.statusCode).toBe(200);

    const detail = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'GET',
        path: '/api/memory/detail',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
        },
      },
    });
    const history = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'GET',
        path: '/api/memory/review-history',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
        },
      },
    });

    expect(detail.statusCode).toBe(200);
    expect(detail.body).toEqual({
      memory: expect.objectContaining({ summary: 'Second review history edit.' }),
      reviewHistory: [
        expect.objectContaining({ afterSummary: 'Second review history edit.' }),
        expect.objectContaining({ afterSummary: 'First review history edit.' }),
      ],
    });
    expect(history.statusCode).toBe(200);
    expect(history.body).toEqual({
      reviewHistory: [
        expect.objectContaining({ userId: 'user-a', afterSummary: 'Second review history edit.' }),
        expect.objectContaining({ userId: 'user-a', afterSummary: 'First review history edit.' }),
      ],
    });
    expect(JSON.stringify(history.body)).not.toContain('Other user private review history guard.');
  });

  test('returns owner-scoped memory provenance export for one selected memory', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_freeze_vs_feature_addition',
      sourceRef: 'obsidian://other-user/provenance-export-guard',
      summary: 'Other user provenance export guard.',
    });

    const updated = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/memory/update',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
          summary: 'Edited before provenance export.',
        },
      },
    });
    expect(updated.statusCode).toBe(200);

    const exported = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'GET',
        path: '/api/memory/provenance-export',
        body: {
          memoryId: 'mem_freeze_vs_feature_addition',
          exportedAt: '2026-05-28T07:10:00.000Z',
        },
      },
    });

    expect(exported.statusCode).toBe(200);
    expect(exported.body).toEqual({
      export: expect.objectContaining({
        exportType: 'memory_provenance',
        exportedAt: '2026-05-28T07:10:00.000Z',
        filename: 'memory-provenance-mem_freeze_vs_feature_addition-2026-05-28.json',
        memory: expect.objectContaining({
          id: 'mem_freeze_vs_feature_addition',
          summary: 'Edited before provenance export.',
          sourceRef: 'markdown://retros/freezing-vs-features.md',
        }),
        reviewHistory: [
          expect.objectContaining({
            userId: 'user-a',
            afterSummary: 'Edited before provenance export.',
          }),
        ],
        evidence: expect.objectContaining({
          citationMemoryIds: ['mem_freeze_vs_feature_addition'],
          sourceRefs: ['markdown://retros/freezing-vs-features.md'],
        }),
      }),
    });
    expect(JSON.stringify(exported.body)).not.toContain('Other user provenance export guard.');
    expect(JSON.stringify(exported.body)).not.toContain('obsidian://other-user/provenance-export-guard');
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

  test('evaluates due weekly report schedule with owner-scoped memories and in-app notification', async () => {
    const store = createMemoryStore({ env: {} });
    for (const record of personalMemoryRecords.slice(0, 3)) {
      await store.create('user-a', record);
    }
    await store.create('user-b', {
      ...personalMemoryRecords[0],
      id: 'mem_other_user_schedule_guard',
      sourceRef: 'notion://other-user/schedule-guard',
    });

    const response = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/report/weekly/schedule/evaluate',
        body: {
          nowLocalDateTime: '2026-05-25T09:05:00',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.body as {
      evaluation: unknown;
      weeklyReport?: WeeklyReport;
    };
    expect(body).toEqual(
      expect.objectContaining({
        evaluation: expect.objectContaining({
          due: true,
          reportId: 'weekly_report_2026-05-18_2026-05-24',
          notification: expect.objectContaining({
            channel: 'in-app',
            reportId: 'weekly_report_2026-05-18_2026-05-24',
          }),
        }),
        weeklyReport: expect.objectContaining({
          id: 'weekly_report_2026-05-18_2026-05-24',
          includedMemoryIds: ['mem_freeze_vs_feature_addition'],
        }),
      }),
    );
    expect(JSON.stringify(response.body)).not.toContain('mem_other_user_schedule_guard');
  });

  test('suppresses already generated weekly report schedules', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);

    const response = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/report/weekly/schedule/evaluate',
        body: {
          nowLocalDateTime: '2026-05-25T09:05:00',
          lastGeneratedReportId: 'weekly_report_2026-05-18_2026-05-24',
        },
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      evaluation: {
        due: false,
        reason: 'already_generated',
        reportId: 'weekly_report_2026-05-18_2026-05-24',
        reportWindow: {
          startDate: '2026-05-18',
          endDate: '2026-05-24',
        },
        scheduledForLocal: '2026-05-25T09:00:00',
      },
    });
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

  test('returns an owner-scoped app shell layout for rehydrating after imports', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_app_shell_guard',
      sourceRef: 'obsidian://other-user/app-shell-guard',
    });

    const response = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'GET',
        path: '/api/app-shell',
      },
    });

    expect(response.statusCode).toBe(200);
    const body = response.body as {
      appShell: { records: MemoryRecord[]; primaryNodes: Array<{ recordId: string }> };
      memoryGraph: { library: 'cytoscape'; stats: { memoryNodeCount: number }; elements: unknown[] };
    };
    expect(body.appShell.records.map((record) => record.id)).toEqual(
      expect.arrayContaining(['mem_launch_may_anxiety_scope_delay']),
    );
    expect(body.appShell.primaryNodes.map((node) => node.recordId)).toEqual(
      expect.arrayContaining(['mem_launch_may_anxiety_scope_delay']),
    );
    expect(body.memoryGraph).toEqual(
      expect.objectContaining({
        library: 'cytoscape',
        stats: expect.objectContaining({
          memoryNodeCount: body.appShell.records.length,
        }),
        elements: expect.arrayContaining([
          expect.objectContaining({
            data: expect.objectContaining({
              id: 'memory:mem_launch_may_anxiety_scope_delay',
            }),
          }),
        ]),
      }),
    );
    expect(JSON.stringify(response.body)).not.toContain('mem_other_user_app_shell_guard');
  });

  test('persists user feedback corrections inside one private memory scope', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_feedback_guard',
      sourceRef: 'obsidian://other-user/feedback-guard',
    });

    const feedback = await handlePersonalMemoryApiRequest({
      store,
      userId: 'user-a',
      request: {
        method: 'POST',
        path: '/api/feedback',
        body: {
          feedbackId: 'api-feedback-001',
          createdAt: '2026-05-28T03:10:00.000Z',
          correctionText: '내가 원하는 건 답변보다 근거 기억을 먼저 보는 것이다.',
          targetMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
          targetArtifactId: 'artifact_ask_answer_sha-api',
        },
      },
    });

    expect(feedback.statusCode).toBe(201);
    expect(feedback.body).toEqual(
      expect.objectContaining({
        createdMemoryIds: [expect.stringMatching(/^mem_api_feedback_/)],
        record: expect.objectContaining({
          sourceRef: 'personal-memory-ai://feedback/api-feedback-001',
          memoryType: 'reflection',
        }),
      }),
    );
    expect((await store.listByUser('user-a')).map((record) => record.id)).toEqual(
      expect.arrayContaining(['mem_launch_may_anxiety_scope_delay', expect.stringMatching(/^mem_api_feedback_/)]),
    );
    expect((await store.listByUser('user-b')).map((record) => record.id)).toEqual(['mem_other_user_feedback_guard']);
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
