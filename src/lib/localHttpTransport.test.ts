import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStore } from './createMemoryStore';
import { createLocalPersonalMemoryHttpHandler } from './localHttpTransport';
import type { MemoryRecord } from './memoryRecord';
import { createLocalPrivateVaultSession } from './privateVault';

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
});
