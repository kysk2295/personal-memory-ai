import {
  createLocalPrivateVaultSession,
  createTrustedHeaderPrivateVaultSession,
  type PrivateVaultAuthStatus,
  type PrivateVaultProviderName,
  type PrivateVaultSession,
} from './privateVault';

export interface PrivateVaultAuthEnv {
  PMI_AUTH_PROVIDER?: string;
  PMI_LOCAL_USER_ID?: string;
  PMI_AUTH_USER_HEADER?: string;
  PMI_AUTH_SESSION_HEADER?: string;
}

export interface ResolvePrivateVaultSessionInput {
  headers?: Record<string, string | string[] | undefined>;
  now?: string;
}

export interface PrivateVaultAuthHealth {
  providerName: PrivateVaultProviderName;
  authStatus: PrivateVaultAuthStatus;
  ready: boolean;
  requiredHeaders: string[];
  optionalHeaders?: string[];
}

export interface PrivateVaultAuthRuntime {
  providerName: PrivateVaultProviderName;
  safeHealth: PrivateVaultAuthHealth;
  resolveSession(input?: ResolvePrivateVaultSessionInput): PrivateVaultSession | null;
}

export interface CreatePrivateVaultAuthRuntimeInput {
  env: PrivateVaultAuthEnv;
}

const DEFAULT_LOCAL_USER_ID = 'local-user';
const DEFAULT_LOCAL_SESSION_ID = 'local-dev-session';
const DEFAULT_USER_HEADER = 'x-pmi-user-id';
const DEFAULT_SESSION_HEADER = 'x-pmi-session-id';

function normalizeProviderName(value: string | undefined): PrivateVaultProviderName {
  return value?.trim() === 'trusted-header' ? 'trusted-header' : 'local';
}

function normalizeHeaderName(value: string | undefined, fallback: string): string {
  const normalized = value?.trim().toLowerCase();
  return normalized || fallback;
}

function normalizeHeaderValue(value: string | string[] | undefined): string | null {
  const candidate = Array.isArray(value) ? value[0] : value;
  const normalized = candidate?.trim();
  return normalized ? normalized : null;
}

function headerValue(
  headers: Record<string, string | string[] | undefined> | undefined,
  headerName: string,
): string | null {
  if (!headers) return null;
  const direct = normalizeHeaderValue(headers[headerName]);
  if (direct) return direct;
  const foundKey = Object.keys(headers).find((key) => key.toLowerCase() === headerName);
  return foundKey ? normalizeHeaderValue(headers[foundKey]) : null;
}

export function createPrivateVaultAuthRuntime(
  input: CreatePrivateVaultAuthRuntimeInput,
): PrivateVaultAuthRuntime {
  const providerName = normalizeProviderName(input.env.PMI_AUTH_PROVIDER);

  if (providerName === 'trusted-header') {
    const userHeader = normalizeHeaderName(input.env.PMI_AUTH_USER_HEADER, DEFAULT_USER_HEADER);
    const sessionHeader = normalizeHeaderName(input.env.PMI_AUTH_SESSION_HEADER, DEFAULT_SESSION_HEADER);

    return {
      providerName,
      safeHealth: {
        providerName,
        authStatus: 'trusted-header-auth-boundary',
        ready: true,
        requiredHeaders: [userHeader],
        optionalHeaders: [sessionHeader],
      },
      resolveSession(request = {}) {
        const userId = headerValue(request.headers, userHeader);
        if (!userId) return null;
        const sessionId = headerValue(request.headers, sessionHeader) ?? `trusted-header:${userId}`;
        return createTrustedHeaderPrivateVaultSession({
          userId,
          sessionId,
          createdAt: request.now,
        });
      },
    };
  }

  const userId = input.env.PMI_LOCAL_USER_ID?.trim() || DEFAULT_LOCAL_USER_ID;
  return {
    providerName,
    safeHealth: {
      providerName,
      authStatus: 'local-auth-boundary',
      ready: true,
      requiredHeaders: [],
    },
    resolveSession(request = {}) {
      return createLocalPrivateVaultSession({
        userId,
        sessionId: DEFAULT_LOCAL_SESSION_ID,
        createdAt: request.now,
      });
    },
  };
}
