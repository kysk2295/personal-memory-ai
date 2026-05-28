import { FixtureMemoryStore } from './fixtureMemoryStore';
import { FileMemoryStore } from './fileMemoryStore';
import type { MemoryStore } from './memoryStore';
import { resolveMemoryBackendMode } from './memoryStore';
import { PostgresMemoryStore, type PgClient } from './postgresMemoryStore';

export interface CreateMemoryStoreInput {
  env: Record<string, string | undefined>;
  postgresClient?: PgClient;
}

export function createMemoryStore(input: CreateMemoryStoreInput): MemoryStore {
  const mode = resolveMemoryBackendMode(input.env);
  if (mode === 'postgres') {
    if (!input.postgresClient) throw new Error('postgresClient is required when MEMORY_BACKEND_MODE=postgres');
    return new PostgresMemoryStore(input.postgresClient);
  }
  if (mode === 'local-file') {
    const path = input.env.LOCAL_MEMORY_STORE_PATH;
    if (!path) throw new Error('LOCAL_MEMORY_STORE_PATH is required when MEMORY_BACKEND_MODE=local-file');
    return new FileMemoryStore(path);
  }
  return new FixtureMemoryStore();
}
