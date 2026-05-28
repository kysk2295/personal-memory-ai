import { describe, expect, test } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { createMemoryStoreRuntime, type PgPoolLike } from './memoryStoreRuntime';
import type { PgQueryResult } from './postgresMemoryStore';

class FakePgPool implements PgPoolLike {
  static readonly instances: FakePgPool[] = [];

  readonly calls: Array<{ text: string; values: readonly unknown[] | undefined }> = [];
  readonly options: unknown;
  ended = false;

  constructor(options: unknown) {
    this.options = options;
    FakePgPool.instances.push(this);
  }

  async query<Row = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<PgQueryResult<Row>> {
    this.calls.push({ text, values });
    return { rows: [], rowCount: 0 };
  }

  async end(): Promise<void> {
    this.ended = true;
  }
}

describe('createMemoryStoreRuntime', () => {
  test('uses fixture storage by default and seeds fixture memories for the local owner', async () => {
    const runtime = await createMemoryStoreRuntime({
      env: {},
      fixtureSeedRecords: personalMemoryRecords,
      seedUserId: 'local-user',
    });

    expect(runtime.backendMode).toBe('fixture');
    expect(runtime.migrationStatus).toBe('not_applicable');
    expect(runtime.databaseUrlPresence).toBe('missing');
    expect((await runtime.store.listByUser('local-user')).map((record) => record.id)).toEqual(
      personalMemoryRecords.map((record) => record.id),
    );

    await expect(runtime.close()).resolves.toBeUndefined();
  });

  test('requires DATABASE_URL when postgres mode is selected', async () => {
    await expect(
      createMemoryStoreRuntime({
        env: { MEMORY_BACKEND_MODE: 'postgres' },
        pgPool: FakePgPool,
      }),
    ).rejects.toThrow('DATABASE_URL is required when MEMORY_BACKEND_MODE=postgres');
  });

  test('creates a postgres pool, runs migration only when enabled, and closes the pool', async () => {
    FakePgPool.instances.length = 0;
    const runtime = await createMemoryStoreRuntime({
      env: {
        MEMORY_BACKEND_MODE: 'postgres',
        DATABASE_URL: 'postgres://user:secret@example.internal:5432/personal_memory',
        POSTGRES_AUTO_MIGRATE: 'true',
        PGSSLMODE: 'require',
      },
      pgPool: FakePgPool,
      migrationSql: 'CREATE EXTENSION IF NOT EXISTS vector; CREATE TABLE memory_records(memory_id text);',
    });

    const pool = FakePgPool.instances[0];
    expect(runtime.backendMode).toBe('postgres');
    expect(runtime.migrationStatus).toBe('applied');
    expect(runtime.databaseUrlPresence).toBe('present');
    expect(JSON.stringify(runtime)).not.toContain('secret');
    expect(pool.options).toEqual({
      connectionString: 'postgres://user:secret@example.internal:5432/personal_memory',
      ssl: { rejectUnauthorized: false },
    });
    expect(pool.calls[0].text).toContain('CREATE EXTENSION IF NOT EXISTS vector');

    await runtime.store.listByUser('local-user');
    expect(pool.calls.some((call) => call.text.includes('SELECT * FROM memory_records WHERE user_id = $1'))).toBe(true);

    await runtime.close();
    expect(pool.ended).toBe(true);
  });

  test('skips postgres migration unless POSTGRES_AUTO_MIGRATE is true', async () => {
    FakePgPool.instances.length = 0;
    const runtime = await createMemoryStoreRuntime({
      env: {
        MEMORY_BACKEND_MODE: 'postgres',
        DATABASE_URL: 'postgres://user:secret@example.internal:5432/personal_memory',
      },
      pgPool: FakePgPool,
      migrationSql: 'CREATE EXTENSION IF NOT EXISTS vector;',
    });

    const pool = FakePgPool.instances[0];
    expect(runtime.migrationStatus).toBe('skipped');
    expect(pool.calls).toEqual([]);
  });

  test('uses local-file storage and preserves imported memories across runtime restarts', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'personal-memory-ai-'));
    const localStorePath = join(dir, 'vault.json');
    try {
      const firstRuntime = await createMemoryStoreRuntime({
        env: {
          MEMORY_BACKEND_MODE: 'local-file',
          LOCAL_MEMORY_STORE_PATH: localStorePath,
        },
        fixtureSeedRecords: personalMemoryRecords.slice(0, 1),
        seedUserId: 'local-user',
      });
      expect(firstRuntime.backendMode).toBe('local-file');
      expect(firstRuntime.migrationStatus).toBe('not_applicable');
      expect(firstRuntime.databaseUrlPresence).toBe('missing');

      await firstRuntime.store.create('local-user', { ...personalMemoryRecords[1], id: 'mem_imported_001' });
      await firstRuntime.close();

      const secondRuntime = await createMemoryStoreRuntime({
        env: {
          MEMORY_BACKEND_MODE: 'local-file',
          LOCAL_MEMORY_STORE_PATH: localStorePath,
        },
        fixtureSeedRecords: personalMemoryRecords.slice(0, 1),
        seedUserId: 'local-user',
      });

      expect((await secondRuntime.store.listByUser('local-user')).map((record) => record.id)).toEqual([
        personalMemoryRecords[0].id,
        'mem_imported_001',
      ]);
      await secondRuntime.close();
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
