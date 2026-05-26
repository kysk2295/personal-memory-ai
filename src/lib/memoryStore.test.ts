import { describe, expect, test } from 'vitest';
import { createMemoryStore } from './createMemoryStore';
import { normalizeMemoryRecord } from './memoryRecord';
import { PostgresMemoryStore, type PgClient, type PgQueryResult } from './postgresMemoryStore';

class FakePgClient implements PgClient {
  readonly calls: Array<{ text: string; values: readonly unknown[] | undefined }> = [];
  private readonly queue: PgQueryResult<any>[] = [];

  enqueue<Row>(result: PgQueryResult<Row>): void {
    this.queue.push(result);
  }

  async query<Row = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<PgQueryResult<Row>> {
    this.calls.push({ text, values });
    return (this.queue.shift() ?? { rows: [], rowCount: 0 }) as PgQueryResult<Row>;
  }
}

const record = normalizeMemoryRecord({
  id: 'mem_db_001',
  sourceType: 'markdown',
  sourceRef: 'markdown://weekly-note#1',
  createdAt: '2026-05-26T00:00:00.000Z',
  observedAt: '2026-05-26T00:00:00.000Z',
  rawText: 'Keep scope fixed before launch.',
  summary: 'Keep scope fixed before launch.',
  memoryType: 'decision',
  decisionSignal: 'chosen',
  emotionTags: ['calm'],
  topicTags: ['launch'],
  projectTags: ['personal-memory-ai'],
  peopleTags: ['ko'],
  embeddingStatus: 'ready',
  extractionStatus: 'ready',
});

describe('createMemoryStore', () => {
  test('uses fixture mode by default and enforces user isolation for CRUD/export/delete', async () => {
    const store = createMemoryStore({ env: {} });

    await store.create('user-a', record);
    await store.create('user-b', { ...record, id: 'mem_db_002' });

    expect((await store.listByUser('user-a')).map((item) => item.id)).toEqual(['mem_db_001']);
    expect((await store.listByUser('user-b')).map((item) => item.id)).toEqual(['mem_db_002']);

    expect((await store.exportUserData('user-a')).map((item) => item.id)).toEqual(['mem_db_001']);
    expect(await store.hardDeleteUserData('user-a')).toBe(1);
    expect(await store.listByUser('user-a')).toEqual([]);
    expect((await store.listByUser('user-b')).map((item) => item.id)).toEqual(['mem_db_002']);
  });

  test('requires postgres client when postgres mode is enabled', () => {
    expect(() => createMemoryStore({ env: { MEMORY_BACKEND_MODE: 'postgres' } })).toThrow(
      'postgresClient is required when MEMORY_BACKEND_MODE=postgres',
    );
  });
});

describe('PostgresMemoryStore', () => {
  test('uses user-scoped queries for semantic search, graph evidence, export, and hard delete', async () => {
    const client = new FakePgClient();
    const store = new PostgresMemoryStore(client);

    client.enqueue({ rows: [], rowCount: 1 });
    await store.create('user-a', record);

    await store.saveEmbedding({ memoryId: record.id, userId: 'user-a', embedding: [0.1, 0.2, 0.3], model: 'text-embedding-3-small' });

    client.enqueue({
      rows: [
        {
          memory_id: record.id,
          user_id: 'user-a',
          source_type: record.sourceType,
          source_ref: record.sourceRef,
          import_batch_id: null,
          created_at: record.createdAt,
          observed_at: record.observedAt ?? null,
          raw_text: record.rawText,
          summary: record.summary,
          memory_type: record.memoryType,
          emotion_tags: record.emotionTags,
          topic_tags: record.topicTags,
          project_tags: record.projectTags,
          people_tags: record.peopleTags,
          decision_signal: record.decisionSignal,
          outcome_text: record.outcomeText ?? null,
          privacy_scope: 'private' as const,
          embedding_status: record.embeddingStatus,
          extraction_status: record.extractionStatus,
          similarity: 0.88,
        },
      ],
      rowCount: 1,
    });
    const semantic = await store.semanticSearch('user-a', [0.1, 0.2, 0.3], 5);
    expect(semantic[0].memory.id).toBe(record.id);
    expect(semantic[0].similarity).toBeCloseTo(0.88);

    client.enqueue({
      rows: [
        {
          memory_id: record.id,
          user_id: 'user-a',
          source_type: record.sourceType,
          source_ref: record.sourceRef,
          import_batch_id: null,
          created_at: record.createdAt,
          observed_at: record.observedAt ?? null,
          raw_text: record.rawText,
          summary: record.summary,
          memory_type: record.memoryType,
          emotion_tags: record.emotionTags,
          topic_tags: record.topicTags,
          project_tags: record.projectTags,
          people_tags: record.peopleTags,
          decision_signal: record.decisionSignal,
          outcome_text: record.outcomeText ?? null,
          privacy_scope: 'private' as const,
          embedding_status: record.embeddingStatus,
          extraction_status: record.extractionStatus,
        },
      ],
      rowCount: 1,
    });
    const graph = await store.graphEvidenceByMemoryIds('user-a', [record.id]);
    expect(graph).toHaveLength(1);

    client.enqueue({
      rows: [
        {
          memory_id: record.id,
          user_id: 'user-a',
          source_type: record.sourceType,
          source_ref: record.sourceRef,
          import_batch_id: null,
          created_at: record.createdAt,
          observed_at: record.observedAt ?? null,
          raw_text: record.rawText,
          summary: record.summary,
          memory_type: record.memoryType,
          emotion_tags: record.emotionTags,
          topic_tags: record.topicTags,
          project_tags: record.projectTags,
          people_tags: record.peopleTags,
          decision_signal: record.decisionSignal,
          outcome_text: record.outcomeText ?? null,
          privacy_scope: 'private' as const,
          embedding_status: record.embeddingStatus,
          extraction_status: record.extractionStatus,
        },
      ],
      rowCount: 1,
    });
    const exported = await store.exportUserData('user-a');
    expect(exported).toHaveLength(1);

    client.enqueue({ rows: [], rowCount: 0 });
    client.enqueue({ rows: [], rowCount: 1 });
    expect(await store.hardDeleteUserData('user-a')).toBe(1);

    expect(client.calls.some((call) => call.text.includes('WHERE me.user_id = $1'))).toBe(true);
    expect(client.calls.some((call) => call.text.includes('WHERE user_id = $1 AND memory_id = ANY'))).toBe(true);
    expect(client.calls.some((call) => call.text.includes('DELETE FROM memory_embeddings WHERE user_id = $1'))).toBe(true);
    expect(client.calls.some((call) => call.text.includes('DELETE FROM memory_records WHERE user_id = $1'))).toBe(true);
    expect(client.calls.some((call) => call.text.includes('$3::vector'))).toBe(true);
  });
});
