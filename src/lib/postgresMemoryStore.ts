import type { MemoryRecord } from './memoryRecord';
import type { MemoryEmbeddingRecord, MemoryQueryResult, MemoryStore } from './memoryStore';

export interface PgQueryResult<Row> {
  rows: Row[];
  rowCount: number;
}

export interface PgClient {
  query<Row = Record<string, unknown>>(text: string, values?: readonly unknown[]): Promise<PgQueryResult<Row>>;
}

interface MemoryRow {
  memory_id: string;
  user_id: string;
  source_type: MemoryRecord['sourceType'];
  source_ref: string;
  import_batch_id: string | null;
  created_at: string;
  observed_at: string | null;
  raw_text: string;
  summary: string;
  memory_type: MemoryRecord['memoryType'];
  emotion_tags: string[];
  topic_tags: string[];
  project_tags: string[];
  people_tags: string[];
  decision_signal: MemoryRecord['decisionSignal'];
  outcome_text: string | null;
  privacy_scope: 'private';
  embedding_status: MemoryRecord['embeddingStatus'];
  extraction_status: MemoryRecord['extractionStatus'];
}

interface SearchRow extends MemoryRow {
  similarity: number;
}

function rowToMemoryRecord(row: MemoryRow): MemoryRecord {
  return {
    id: row.memory_id,
    sourceType: row.source_type,
    sourceRef: row.source_ref,
    importBatchId: row.import_batch_id ?? undefined,
    createdAt: row.created_at,
    observedAt: row.observed_at ?? undefined,
    rawText: row.raw_text,
    summary: row.summary,
    memoryType: row.memory_type,
    emotionTags: row.emotion_tags,
    topicTags: row.topic_tags,
    projectTags: row.project_tags,
    peopleTags: row.people_tags,
    decisionSignal: row.decision_signal,
    outcomeText: row.outcome_text ?? undefined,
    privacyScope: row.privacy_scope,
    embeddingStatus: row.embedding_status,
    extractionStatus: row.extraction_status,
  };
}

function toMemoryParams(userId: string, record: MemoryRecord): readonly unknown[] {
  return [
    record.id,
    userId,
    record.sourceType,
    record.sourceRef,
    record.importBatchId ?? null,
    record.createdAt,
    record.observedAt ?? null,
    record.rawText,
    record.summary,
    record.memoryType,
    record.emotionTags,
    record.topicTags,
    record.projectTags,
    record.peopleTags,
    record.decisionSignal,
    record.outcomeText ?? null,
    record.privacyScope,
    record.embeddingStatus,
    record.extractionStatus,
  ];
}

export class PostgresMemoryStore implements MemoryStore {
  constructor(private readonly client: PgClient) {}

  async create(userId: string, record: MemoryRecord): Promise<void> {
    await this.client.query(
      `INSERT INTO memory_records (
        memory_id, user_id, source_type, source_ref, import_batch_id, created_at, observed_at, raw_text,
        summary, memory_type, emotion_tags, topic_tags, project_tags, people_tags, decision_signal,
        outcome_text, privacy_scope, embedding_status, extraction_status
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15,
        $16, $17, $18, $19
      )`,
      toMemoryParams(userId, record),
    );
  }

  async update(userId: string, record: MemoryRecord): Promise<void> {
    await this.client.query(
      `UPDATE memory_records
       SET source_type = $3,
           source_ref = $4,
           import_batch_id = $5,
           created_at = $6,
           observed_at = $7,
           raw_text = $8,
           summary = $9,
           memory_type = $10,
           emotion_tags = $11,
           topic_tags = $12,
           project_tags = $13,
           people_tags = $14,
           decision_signal = $15,
           outcome_text = $16,
           privacy_scope = $17,
           embedding_status = $18,
           extraction_status = $19
       WHERE memory_id = $1 AND user_id = $2`,
      toMemoryParams(userId, record),
    );
  }

  async getById(userId: string, memoryId: string): Promise<MemoryRecord | null> {
    const result = await this.client.query<MemoryRow>(
      'SELECT * FROM memory_records WHERE user_id = $1 AND memory_id = $2 LIMIT 1',
      [userId, memoryId],
    );
    return result.rows[0] ? rowToMemoryRecord(result.rows[0]) : null;
  }

  async listByUser(userId: string): Promise<MemoryRecord[]> {
    const result = await this.client.query<MemoryRow>(
      'SELECT * FROM memory_records WHERE user_id = $1 ORDER BY created_at DESC',
      [userId],
    );
    return result.rows.map(rowToMemoryRecord);
  }

  async saveEmbedding(value: MemoryEmbeddingRecord): Promise<void> {
    await this.client.query(
      `INSERT INTO memory_embeddings (memory_id, user_id, embedding, model)
       VALUES ($1, $2, $3::vector, $4)
       ON CONFLICT (memory_id, user_id)
       DO UPDATE SET embedding = EXCLUDED.embedding, model = EXCLUDED.model, updated_at = NOW()`,
      [value.memoryId, value.userId, `[${value.embedding.join(',')}]`, value.model],
    );
  }

  async semanticSearch(userId: string, queryEmbedding: readonly number[], limit: number): Promise<MemoryQueryResult[]> {
    const result = await this.client.query<SearchRow>(
      `SELECT mr.*, 1 - (me.embedding <=> $2::vector) AS similarity
       FROM memory_embeddings me
       INNER JOIN memory_records mr ON mr.memory_id = me.memory_id AND mr.user_id = me.user_id
       WHERE me.user_id = $1
       ORDER BY me.embedding <=> $2::vector
       LIMIT $3`,
      [userId, `[${queryEmbedding.join(',')}]`, limit],
    );

    return result.rows.map((row) => ({
      memory: rowToMemoryRecord(row),
      similarity: row.similarity,
    }));
  }

  async graphEvidenceByMemoryIds(userId: string, memoryIds: readonly string[]): Promise<MemoryRecord[]> {
    if (!memoryIds.length) return [];
    const result = await this.client.query<MemoryRow>(
      'SELECT * FROM memory_records WHERE user_id = $1 AND memory_id = ANY($2::text[]) ORDER BY created_at DESC',
      [userId, memoryIds],
    );
    return result.rows.map(rowToMemoryRecord);
  }

  async exportUserData(userId: string): Promise<MemoryRecord[]> {
    return this.listByUser(userId);
  }

  async hardDeleteUserData(userId: string): Promise<number> {
    await this.client.query('DELETE FROM memory_embeddings WHERE user_id = $1', [userId]);
    const result = await this.client.query('DELETE FROM memory_records WHERE user_id = $1', [userId]);
    return result.rowCount;
  }
}
