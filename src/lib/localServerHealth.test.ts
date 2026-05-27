import { describe, expect, test } from 'vitest';
import { buildLiveHealthPayload } from './localServerHealth';

describe('buildLiveHealthPayload', () => {
  test('returns safe runtime metadata without exposing database secrets', () => {
    const payload = buildLiveHealthPayload({
      backendMode: 'postgres',
      migrationStatus: 'applied',
      databaseUrlPresence: 'present',
    });

    expect(payload).toEqual({
      status: 'ok',
      service: 'personal-memory-ai-web',
      memoryBackend: 'postgres',
      migrationStatus: 'applied',
      databaseUrl: 'present',
    });
    expect(JSON.stringify(payload)).not.toContain('postgres://');
    expect(JSON.stringify(payload)).not.toContain('secret');
  });
});
