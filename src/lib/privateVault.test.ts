import { describe, expect, test } from 'vitest';
import {
  createLocalPrivateVaultSession,
  resolvePrivateVaultAccess,
} from './privateVault';

describe('private vault boundary', () => {
  test('resolves only the session owner vault without exposing provider secrets', () => {
    const session = createLocalPrivateVaultSession({
      userId: 'user-a',
      sessionId: 'session-local-a',
      createdAt: '2026-05-27T16:00:00.000Z',
    });

    expect(session).toEqual({
      authStatus: 'local-auth-boundary',
      vaultAccess: 'owner-only',
      sessionId: 'session-local-a',
      ownerUserId: 'user-a',
      vaultId: 'vault:user-a',
      createdAt: '2026-05-27T16:00:00.000Z',
    });
    expect(JSON.stringify(session)).not.toContain('token');
    expect(JSON.stringify(session)).not.toContain('secret');

    expect(resolvePrivateVaultAccess({ session, requestedUserId: 'user-a' })).toEqual({
      allowed: true,
      userId: 'user-a',
      vaultId: 'vault:user-a',
    });
    expect(resolvePrivateVaultAccess({ session, requestedUserId: 'user-b' })).toEqual({
      allowed: false,
      reason: 'cross_user_vault_denied',
      userId: 'user-a',
      vaultId: 'vault:user-a',
    });
  });
});
