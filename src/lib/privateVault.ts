export interface LocalPrivateVaultSession {
  authStatus: 'local-auth-boundary';
  vaultAccess: 'owner-only';
  sessionId: string;
  ownerUserId: string;
  vaultId: string;
  createdAt: string;
}

export interface CreateLocalPrivateVaultSessionInput {
  userId: string;
  sessionId: string;
  createdAt?: string;
}

export type PrivateVaultAccessResult =
  | {
      allowed: true;
      userId: string;
      vaultId: string;
    }
  | {
      allowed: false;
      reason: 'cross_user_vault_denied';
      userId: string;
      vaultId: string;
    };

export interface ResolvePrivateVaultAccessInput {
  session: LocalPrivateVaultSession;
  requestedUserId?: string;
}

export function createLocalPrivateVaultSession(
  input: CreateLocalPrivateVaultSessionInput,
): LocalPrivateVaultSession {
  return {
    authStatus: 'local-auth-boundary',
    vaultAccess: 'owner-only',
    sessionId: input.sessionId,
    ownerUserId: input.userId,
    vaultId: `vault:${input.userId}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function resolvePrivateVaultAccess(
  input: ResolvePrivateVaultAccessInput,
): PrivateVaultAccessResult {
  if (input.requestedUserId && input.requestedUserId !== input.session.ownerUserId) {
    return {
      allowed: false,
      reason: 'cross_user_vault_denied',
      userId: input.session.ownerUserId,
      vaultId: input.session.vaultId,
    };
  }

  return {
    allowed: true,
    userId: input.session.ownerUserId,
    vaultId: input.session.vaultId,
  };
}
