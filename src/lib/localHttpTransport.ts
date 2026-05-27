import type { MemoryStore } from './memoryStore';
import {
  handlePrivateVaultMemoryApiRequest,
  type PersonalMemoryApiMethod,
  type PersonalMemoryApiPath,
} from './personalMemoryApi';
import type { LocalPrivateVaultSession } from './privateVault';

export interface LocalPersonalMemoryHttpRequest {
  method: string;
  path: string;
  bodyText?: string;
}

export interface LocalPersonalMemoryHttpResponse {
  statusCode: number;
  headers: { 'content-type': 'application/json; charset=utf-8' };
  bodyText: string;
}

export interface CreateLocalPersonalMemoryHttpHandlerInput {
  store: MemoryStore;
  session: LocalPrivateVaultSession;
}

export type LocalPersonalMemoryHttpHandler = (
  request: LocalPersonalMemoryHttpRequest,
) => Promise<LocalPersonalMemoryHttpResponse>;

function jsonResponse(statusCode: number, body: unknown): LocalPersonalMemoryHttpResponse {
  return {
    statusCode,
    headers: { 'content-type': 'application/json; charset=utf-8' },
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

    const apiResponse = await handlePrivateVaultMemoryApiRequest({
      store: input.store,
      session: input.session,
      request: {
        method,
        path: request.path as PersonalMemoryApiPath,
        body,
      },
    });

    return jsonResponse(apiResponse.statusCode, apiResponse.body);
  };
}
