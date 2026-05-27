import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createMemoryStore } from './createMemoryStore';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryBackendMode, MemoryStore } from './memoryStore';
import { resolveMemoryBackendMode } from './memoryStore';
import type { PgClient } from './postgresMemoryStore';

export type RuntimeMigrationStatus = 'not_applicable' | 'skipped' | 'applied';
export type RuntimeSecretPresence = 'missing' | 'present';

export interface PgPoolLike extends PgClient {
  end(): Promise<void>;
}

export interface PgPoolOptions {
  connectionString: string;
  ssl?: {
    rejectUnauthorized: false;
  };
}

export interface PgPoolConstructor {
  new (options: PgPoolOptions): PgPoolLike;
}

export interface MemoryStoreRuntime {
  backendMode: MemoryBackendMode;
  migrationStatus: RuntimeMigrationStatus;
  databaseUrlPresence: RuntimeSecretPresence;
  store: MemoryStore;
  close(): Promise<void>;
  toJSON(): {
    backendMode: MemoryBackendMode;
    migrationStatus: RuntimeMigrationStatus;
    databaseUrlPresence: RuntimeSecretPresence;
  };
}

export interface CreateMemoryStoreRuntimeInput {
  env: Record<string, string | undefined>;
  pgPool?: PgPoolConstructor;
  migrationSql?: string;
  fixtureSeedRecords?: readonly MemoryRecord[];
  seedUserId?: string;
}

const defaultMigrationPath = join(process.cwd(), 'db/migrations/0001_memory_records_pgvector.sql');

function shouldUsePostgresSsl(env: Record<string, string | undefined>): boolean {
  return env.PGSSLMODE === 'require' || env.DATABASE_SSL === 'true';
}

function shouldRunMigrations(env: Record<string, string | undefined>): boolean {
  return env.POSTGRES_AUTO_MIGRATE === 'true';
}

async function loadMigrationSql(input: CreateMemoryStoreRuntimeInput): Promise<string> {
  if (input.migrationSql !== undefined) return input.migrationSql;
  return readFile(defaultMigrationPath, 'utf8');
}

function buildRuntime(
  backendMode: MemoryBackendMode,
  migrationStatus: RuntimeMigrationStatus,
  databaseUrlPresence: RuntimeSecretPresence,
  store: MemoryStore,
  close: () => Promise<void>,
): MemoryStoreRuntime {
  return {
    backendMode,
    migrationStatus,
    databaseUrlPresence,
    store,
    close,
    toJSON: () => ({
      backendMode,
      migrationStatus,
      databaseUrlPresence,
    }),
  };
}

export async function createMemoryStoreRuntime(input: CreateMemoryStoreRuntimeInput): Promise<MemoryStoreRuntime> {
  const backendMode = resolveMemoryBackendMode(input.env);
  if (backendMode === 'fixture') {
    const store = createMemoryStore({ env: {} });
    const seedUserId = input.seedUserId ?? 'local-user';
    for (const record of input.fixtureSeedRecords ?? []) {
      await store.create(seedUserId, record);
    }
    return buildRuntime('fixture', 'not_applicable', 'missing', store, async () => {});
  }

  const databaseUrl = input.env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL is required when MEMORY_BACKEND_MODE=postgres');
  if (!input.pgPool) throw new Error('pgPool is required when MEMORY_BACKEND_MODE=postgres');

  const poolOptions: PgPoolOptions = shouldUsePostgresSsl(input.env)
    ? { connectionString: databaseUrl, ssl: { rejectUnauthorized: false } }
    : { connectionString: databaseUrl };
  const pool = new input.pgPool(poolOptions);
  let migrationStatus: RuntimeMigrationStatus = 'skipped';

  if (shouldRunMigrations(input.env)) {
    await pool.query(await loadMigrationSql(input));
    migrationStatus = 'applied';
  }

  const store = createMemoryStore({
    env: input.env,
    postgresClient: pool,
  });

  return buildRuntime('postgres', migrationStatus, 'present', store, () => pool.end());
}
