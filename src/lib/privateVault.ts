export type PrivateVaultAuthStatus = 'local-auth-boundary' | 'trusted-header-auth-boundary';
export type PrivateVaultProviderName = 'local' | 'trusted-header';

export interface PrivateVaultSession {
  authStatus: PrivateVaultAuthStatus;
  vaultAccess: 'owner-only';
  providerName: PrivateVaultProviderName;
  sessionId: string;
  ownerUserId: string;
  vaultId: string;
  createdAt: string;
}

export interface LocalPrivateVaultSession extends PrivateVaultSession {
  authStatus: 'local-auth-boundary';
  providerName: 'local';
}

export interface TrustedHeaderPrivateVaultSession extends PrivateVaultSession {
  authStatus: 'trusted-header-auth-boundary';
  providerName: 'trusted-header';
}

export interface CreateLocalPrivateVaultSessionInput {
  userId: string;
  sessionId: string;
  createdAt?: string;
}

export interface CreateTrustedHeaderPrivateVaultSessionInput {
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
  session: PrivateVaultSession;
  requestedUserId?: string;
}

export function createLocalPrivateVaultSession(
  input: CreateLocalPrivateVaultSessionInput,
): LocalPrivateVaultSession {
  return {
    authStatus: 'local-auth-boundary',
    vaultAccess: 'owner-only',
    providerName: 'local',
    sessionId: input.sessionId,
    ownerUserId: input.userId,
    vaultId: `vault:${input.userId}`,
    createdAt: input.createdAt ?? new Date().toISOString(),
  };
}

export function createTrustedHeaderPrivateVaultSession(
  input: CreateTrustedHeaderPrivateVaultSessionInput,
): TrustedHeaderPrivateVaultSession {
  return {
    authStatus: 'trusted-header-auth-boundary',
    vaultAccess: 'owner-only',
    providerName: 'trusted-header',
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
