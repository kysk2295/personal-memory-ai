import type { PrivateVaultAuthRuntime } from './authProviderRuntime';
import type { MemoryStore } from './memoryStore';
import {
  handlePrivateVaultMemoryApiRequest,
  type PersonalMemoryApiMethod,
  type PersonalMemoryApiPath,
} from './personalMemoryApi';
import type { PrivateVaultSession } from './privateVault';

export interface LocalPersonalMemoryHttpRequest {
  method: string;
  path: string;
  headers?: Record<string, string | string[] | undefined>;
  bodyText?: string;
}

export interface LocalPersonalMemoryHttpResponse {
  statusCode: number;
  headers: Record<string, string>;
  bodyText: string;
}

export interface CreateLocalPersonalMemoryHttpHandlerInput {
  store: MemoryStore;
  session?: PrivateVaultSession;
  authRuntime?: PrivateVaultAuthRuntime;
}

export type LocalPersonalMemoryHttpHandler = (
  request: LocalPersonalMemoryHttpRequest,
) => Promise<LocalPersonalMemoryHttpResponse>;

function jsonResponse(
  statusCode: number,
  body: unknown,
  headers: Record<string, string> = {},
): LocalPersonalMemoryHttpResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
    bodyText: JSON.stringify(body),
  };
}

function parseBody(bodyText: string | undefined): unknown {
  if (!bodyText) return undefined;
  return JSON.parse(bodyText);
}

function normalizeMethod(method: string): PersonalMemoryApiMethod | null {
  if (method === 'GET' || method === 'POST') return method;
  return null;
}

export function createLocalPersonalMemoryHttpHandler(
  input: CreateLocalPersonalMemoryHttpHandlerInput,
): LocalPersonalMemoryHttpHandler {
  return async (request) => {
    const method = normalizeMethod(request.method);
    if (!method) return jsonResponse(405, { error: 'method_not_allowed' });

    let body: unknown;
    try {
      body = parseBody(request.bodyText);
    } catch {
      return jsonResponse(400, { error: 'invalid_json_body' });
    }

    const session = input.session ?? input.authRuntime?.resolveSession({ headers: request.headers });
    if (!session) return jsonResponse(401, { error: 'auth_required' });

    const apiResponse = await handlePrivateVaultMemoryApiRequest({
      store: input.store,
      session,
      request: {
        method,
        path: request.path as PersonalMemoryApiPath,
        body,
      },
    });

    return jsonResponse(apiResponse.statusCode, apiResponse.body, apiResponse.headers);
  };
}
