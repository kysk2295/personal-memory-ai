import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createPrivateVaultAuthRuntime } from './authProviderRuntime';
import { createMemoryStore } from './createMemoryStore';
import { createLocalPersonalMemoryHttpHandler } from './localHttpTransport';
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
});
