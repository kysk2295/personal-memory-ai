import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createPrivateVaultAuthRuntime } from './authProviderRuntime';
import { createMemoryStore } from './createMemoryStore';
import { createLocalPersonalMemoryHttpHandler } from './localHttpTransport';
import type { ApplyImportPreviewResult } from './memoryIngestion';
import type { MemoryRecord } from './memoryRecord';
import { createLocalPrivateVaultSession } from './privateVault';
import { createSavedAskArtifact } from './savedMemoryArtifact';

describe('local personal memory HTTP transport', () => {
  test('handles capture and export through the private vault session owner', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('local-user', personalMemoryRecords[0]);
    await store.create('other-user', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_transport_guard',
      sourceRef: 'obsidian://other-user/transport-guard',
    });

    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      session: createLocalPrivateVaultSession({
        userId: 'local-user',
        sessionId: 'session-local-http',
        createdAt: '2026-05-27T17:00:00.000Z',
      }),
    });

    const captured = await handle({
      method: 'POST',
      path: '/api/capture',
      bodyText: JSON.stringify({
        text: 'HTTP quick save should become local private memory.',
        capturedAt: '2026-05-27T17:05:00.000Z',
        emotionHints: ['resolve'],
        projectHints: ['personal-memory-ai'],
      }),
    });

    expect(captured.statusCode).toBe(201);
    expect(captured.headers['content-type']).toBe('application/json; charset=utf-8');
    expect(JSON.parse(captured.bodyText)).toEqual(
      expect.objectContaining({
        createdMemoryIds: [expect.stringMatching(/^mem_mobile_/)],
      }),
    );

    const exported = await handle({
      method: 'GET',
      path: '/api/export',
    });

    expect(exported.statusCode).toBe(200);
    const exportedBody = JSON.parse(exported.bodyText) as { records: MemoryRecord[] };
    expect(exportedBody.records.map((record) => record.id)).toHaveLength(2);
    expect(exported.bodyText).toContain('HTTP quick save should become local private memory.');
    expect(exported.bodyText).not.toContain('mem_other_user_transport_guard');
  });

  test('persists saved artifacts through HTTP capture without crossing private vaults', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('local-user', personalMemoryRecords[0]);
    await store.create('other-user', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_http_saved_artifact_guard',
      sourceRef: 'obsidian://other-user/http-saved-artifact-guard',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      session: createLocalPrivateVaultSession({
        userId: 'local-user',
        sessionId: 'session-local-http-artifact',
        createdAt: '2026-05-28T02:05:00.000Z',
      }),
    });
    const artifact = createSavedAskArtifact({
      question: '이번에도 기능을 더 넣어야 할까?',
      createdAt: '2026-05-28T02:05:00.000Z',
      answer: {
        status: 'implemented',
        evidenceLabel: 'sufficient_evidence',
        answer: 'Save this answer as private memory.',
        recommendation: 'Freeze scope before adding another feature.',
        evidenceBullets: [],
        citationMemoryIds: ['mem_launch_may_anxiety_scope_delay'],
        confidence: 0.91,
        graphHighlightIds: ['memory:mem_launch_may_anxiety_scope_delay'],
      },
    });

    const saved = await handle({
      method: 'POST',
      path: '/api/capture',
      bodyText: JSON.stringify({ artifact }),
    });

    expect(saved.statusCode).toBe(201);
    expect(JSON.parse(saved.bodyText)).toEqual(
      expect.objectContaining({
        createdMemoryIds: [expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/)],
      }),
    );

    const exported = await handle({
      method: 'GET',
      path: '/api/export',
    });

    expect(exported.statusCode).toBe(200);
    expect(exported.bodyText).toContain('personal-memory-ai://saved-artifacts/');
    expect(exported.bodyText).toContain('Save this answer as private memory.');
    expect(exported.bodyText).not.toContain('mem_other_user_http_saved_artifact_guard');
  });

  test('undoes applied imports through HTTP without crossing private vaults', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('other-user', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_http_import_undo_guard',
      sourceRef: 'obsidian://other-user/http-import-undo-guard',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      session: createLocalPrivateVaultSession({
        userId: 'local-user',
        sessionId: 'session-local-http-import-undo',
        createdAt: '2026-05-28T04:10:00.000Z',
      }),
    });

    const preview = await handle({
      method: 'POST',
      path: '/api/import/preview',
      bodyText: JSON.stringify({
        batchId: 'http-import-undo',
        createdAt: '2026-05-28T04:10:00.000Z',
        candidates: [
          {
            sourceType: 'markdown',
            sourceRef: 'markdown://http/undo.md',
            observedAt: '2026-05-28',
            rawText: 'HTTP imported memory should be removable through undo.',
            summary: 'HTTP undo import memory.',
          },
        ],
      }),
    });
    const applied = await handle({
      method: 'POST',
      path: '/api/import/apply',
      bodyText: JSON.stringify({
        preview: JSON.parse(preview.bodyText).preview,
      }),
    });
    const appliedBody = JSON.parse(applied.bodyText) as ApplyImportPreviewResult;
    expect(appliedBody.createdMemoryIds).toHaveLength(1);

    const undone = await handle({
      method: 'POST',
      path: '/api/import/undo',
      bodyText: JSON.stringify({
        appliedMemoryRecordIds: appliedBody.createdMemoryIds,
      }),
    });

    expect(undone.statusCode).toBe(200);
    expect(JSON.parse(undone.bodyText)).toEqual({
      deletedCount: 1,
      appliedMemoryRecordIds: appliedBody.createdMemoryIds,
    });
    const exported = await handle({
      method: 'GET',
      path: '/api/export',
    });
    expect(exported.statusCode).toBe(200);
    expect(exported.bodyText).not.toContain('HTTP undo import memory.');
    expect(exported.bodyText).not.toContain('mem_other_user_http_import_undo_guard');
  });

  test('reviews and updates memories through HTTP without crossing private vaults', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_user_b_source_review_guard',
      sourceRef: 'obsidian://other-user/http-source-review-guard',
      summary: 'Other private source should stay hidden.',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      authRuntime: createPrivateVaultAuthRuntime({
        env: {
          PMI_AUTH_PROVIDER: 'trusted-header',
        },
      }),
    });

    const detail = await handle({
      method: 'GET',
      path: '/api/memory/detail',
      headers: {
        'x-pmi-user-id': 'user-a',
      },
      bodyText: JSON.stringify({
        memoryId: 'mem_freeze_vs_feature_addition',
      }),
    });

    expect(detail.statusCode).toBe(200);
    expect(detail.bodyText).toContain('markdown://retros/freezing-vs-features.md');
    expect(detail.bodyText).not.toContain('mem_user_b_source_review_guard');

    const updated = await handle({
      method: 'POST',
      path: '/api/memory/update',
      headers: {
        'x-pmi-user-id': 'user-a',
      },
      bodyText: JSON.stringify({
        memoryId: 'mem_freeze_vs_feature_addition',
        summary: 'HTTP edited review summary.',
        rawText: 'HTTP edited raw source text.',
      }),
    });

    expect(updated.statusCode).toBe(200);
    expect(updated.bodyText).toContain('HTTP edited review summary.');
    expect(updated.bodyText).toContain('reviewHistory');
    expect(updated.bodyText).not.toContain('mem_user_b_source_review_guard');
    const history = await handle({
      method: 'GET',
      path: '/api/memory/review-history',
      headers: {
        'x-pmi-user-id': 'user-a',
      },
      bodyText: JSON.stringify({
        memoryId: 'mem_freeze_vs_feature_addition',
      }),
    });

    expect(history.statusCode).toBe(200);
    expect(history.bodyText).toContain('HTTP edited review summary.');
    expect(history.bodyText).not.toContain('Other private source should stay hidden.');
    expect(await store.getById('user-a', 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({
        summary: 'HTTP edited review summary.',
        rawText: 'HTTP edited raw source text.',
      }),
    );
    expect(await store.getById('user-b', 'mem_user_b_source_review_guard')).toEqual(
      expect.objectContaining({
        summary: 'Other private source should stay hidden.',
      }),
    );
  });

  test('exports selected memory provenance through HTTP without crossing private vaults', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_freeze_vs_feature_addition',
      sourceRef: 'obsidian://other-user/http-provenance-export-guard',
      summary: 'Other private provenance export guard.',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      authRuntime: createPrivateVaultAuthRuntime({
        env: {
          PMI_AUTH_PROVIDER: 'trusted-header',
        },
      }),
    });

    const response = await handle({
      method: 'GET',
      path: '/api/memory/provenance-export',
      headers: {
        'x-pmi-user-id': 'user-a',
      },
      bodyText: JSON.stringify({
        memoryId: 'mem_freeze_vs_feature_addition',
        exportedAt: '2026-05-28T07:15:00.000Z',
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(response.bodyText).toContain('"exportType":"memory_provenance"');
    expect(response.bodyText).toContain('"filename":"memory-provenance-mem_freeze_vs_feature_addition-2026-05-28.json"');
    expect(response.bodyText).toContain('markdown://retros/freezing-vs-features.md');
    expect(response.bodyText).not.toContain('Other private provenance export guard.');
    expect(response.bodyText).not.toContain('obsidian://other-user/http-provenance-export-guard');
  });

  test('returns safe JSON errors for invalid request bodies', async () => {
    const handle = createLocalPersonalMemoryHttpHandler({
      store: createMemoryStore({ env: {} }),
      session: createLocalPrivateVaultSession({
        userId: 'local-user',
        sessionId: 'session-local-http',
      }),
    });

    const response = await handle({
      method: 'POST',
      path: '/api/capture',
      bodyText: '{',
    });

    expect(response).toEqual({
      statusCode: 400,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      bodyText: JSON.stringify({ error: 'invalid_json_body' }),
    });
  });

  test('scopes requests through trusted-header auth runtime owners', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_user_b_trusted_header_guard',
      sourceRef: 'obsidian://user-b/trusted-header-guard',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      authRuntime: createPrivateVaultAuthRuntime({
        env: {
          PMI_AUTH_PROVIDER: 'trusted-header',
        },
      }),
    });

    const exportedA = await handle({
      method: 'GET',
      path: '/api/export',
      headers: {
        'x-pmi-user-id': 'user-a',
        authorization: 'Bearer should-not-leak',
      },
    });
    const exportedB = await handle({
      method: 'GET',
      path: '/api/export',
      headers: {
        'x-pmi-user-id': 'user-b',
        'x-pmi-session-id': 'session-user-b',
      },
    });

    expect(exportedA.statusCode).toBe(200);
    expect(exportedA.bodyText).toContain(personalMemoryRecords[0].id);
    expect(exportedA.bodyText).not.toContain('mem_user_b_trusted_header_guard');
    expect(exportedA.bodyText).not.toContain('should-not-leak');
    expect(exportedB.statusCode).toBe(200);
    expect(exportedB.bodyText).toContain('mem_user_b_trusted_header_guard');
    expect(exportedB.bodyText).not.toContain(personalMemoryRecords[0].id);
  });

  test('returns auth_required when trusted-header auth has no owner header', async () => {
    const handle = createLocalPersonalMemoryHttpHandler({
      store: createMemoryStore({ env: {} }),
      authRuntime: createPrivateVaultAuthRuntime({
        env: {
          PMI_AUTH_PROVIDER: 'trusted-header',
        },
      }),
    });

    const response = await handle({
      method: 'GET',
      path: '/api/export',
      headers: {},
    });

    expect(response).toEqual({
      statusCode: 401,
      headers: { 'content-type': 'application/json; charset=utf-8' },
      bodyText: JSON.stringify({ error: 'auth_required' }),
    });
  });

  test('evaluates scheduled weekly reports through the HTTP private vault owner', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-b', {
      ...personalMemoryRecords[2],
      id: 'mem_other_user_http_schedule_guard',
      sourceRef: 'obsidian://other-user/http-schedule-guard',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      authRuntime: createPrivateVaultAuthRuntime({
        env: {
          PMI_AUTH_PROVIDER: 'trusted-header',
        },
      }),
    });

    const response = await handle({
      method: 'POST',
      path: '/api/report/weekly/schedule/evaluate',
      headers: {
        'x-pmi-user-id': 'user-a',
      },
      bodyText: JSON.stringify({
        nowLocalDateTime: '2026-05-25T09:05:00',
      }),
    });

    expect(response.statusCode).toBe(200);
    expect(response.bodyText).toContain('weekly_report_2026-05-18_2026-05-24');
    expect(response.bodyText).toContain('mem_freeze_vs_feature_addition');
    expect(response.bodyText).not.toContain('mem_other_user_http_schedule_guard');
  });

  test('serves owner-scoped app shell rehydration through HTTP auth', async () => {
    const store = createMemoryStore({ env: {} });
    await store.create('user-a', personalMemoryRecords[0]);
    await store.create('user-b', {
      ...personalMemoryRecords[1],
      id: 'mem_other_user_http_app_shell_guard',
      sourceRef: 'obsidian://other-user/http-app-shell-guard',
    });
    const handle = createLocalPersonalMemoryHttpHandler({
      store,
      authRuntime: createPrivateVaultAuthRuntime({
        env: {
          PMI_AUTH_PROVIDER: 'trusted-header',
        },
      }),
    });

    const response = await handle({
      method: 'GET',
      path: '/api/app-shell',
      headers: {
        'x-pmi-user-id': 'user-a',
      },
    });

    expect(response.statusCode).toBe(200);
    expect(response.bodyText).toContain('mem_launch_may_anxiety_scope_delay');
    expect(response.bodyText).not.toContain('mem_other_user_http_app_shell_guard');
  });
});
