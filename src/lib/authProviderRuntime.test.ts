import { describe, expect, test } from 'vitest';
import { createPrivateVaultAuthRuntime } from './authProviderRuntime';

describe('private vault auth provider runtime', () => {
  test('defaults to local auth and resolves the configured local owner', () => {
    const runtime = createPrivateVaultAuthRuntime({
      env: {
        PMI_LOCAL_USER_ID: 'local-owner',
      },
    });

    const session = runtime.resolveSession({
      now: '2026-05-28T01:30:00.000Z',
    });

    expect(runtime.safeHealth).toEqual({
      providerName: 'local',
      authStatus: 'local-auth-boundary',
      ready: true,
      requiredHeaders: [],
    });
    expect(session).toEqual({
      authStatus: 'local-auth-boundary',
      vaultAccess: 'owner-only',
      providerName: 'local',
      sessionId: 'local-dev-session',
      ownerUserId: 'local-owner',
      vaultId: 'vault:local-owner',
      createdAt: '2026-05-28T01:30:00.000Z',
    });
  });

  test('resolves a trusted-header owner without exposing request values in health metadata', () => {
    const runtime = createPrivateVaultAuthRuntime({
      env: {
        PMI_AUTH_PROVIDER: 'trusted-header',
        PMI_AUTH_USER_HEADER: 'x-memory-owner',
        PMI_AUTH_SESSION_HEADER: 'x-memory-session',
      },
    });

    const session = runtime.resolveSession({
      headers: {
        'x-memory-owner': 'user-prod-a',
        'x-memory-session': 'session-prod-a',
        authorization: 'Bearer secret-token',
      },
      now: '2026-05-28T01:31:00.000Z',
    });

    expect(runtime.safeHealth).toEqual({
      providerName: 'trusted-header',
      authStatus: 'trusted-header-auth-boundary',
      ready: true,
      requiredHeaders: ['x-memory-owner'],
      optionalHeaders: ['x-memory-session'],
    });
    expect(JSON.stringify(runtime.safeHealth)).not.toContain('user-prod-a');
    expect(JSON.stringify(runtime.safeHealth)).not.toContain('secret-token');
    expect(session).toEqual({
      authStatus: 'trusted-header-auth-boundary',
      vaultAccess: 'owner-only',
      providerName: 'trusted-header',
      sessionId: 'session-prod-a',
      ownerUserId: 'user-prod-a',
      vaultId: 'vault:user-prod-a',
      createdAt: '2026-05-28T01:31:00.000Z',
    });
  });

  test('returns null for trusted-header auth when the owner header is missing', () => {
    const runtime = createPrivateVaultAuthRuntime({
      env: {
        PMI_AUTH_PROVIDER: 'trusted-header',
      },
    });

    expect(runtime.resolveSession({ headers: {}, now: '2026-05-28T01:32:00.000Z' })).toBeNull();
    expect(runtime.safeHealth).toEqual({
      providerName: 'trusted-header',
      authStatus: 'trusted-header-auth-boundary',
      ready: true,
      requiredHeaders: ['x-pmi-user-id'],
      optionalHeaders: ['x-pmi-session-id'],
    });
  });
});
