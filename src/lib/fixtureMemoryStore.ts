import type { MemoryRecord } from './memoryRecord';
import type { MemoryEmbeddingRecord, MemoryQueryResult, MemoryStore } from './memoryStore';

function cosineSimilarity(left: readonly number[], right: readonly number[]): number {
  const length = Math.min(left.length, right.length);
  if (!length) return 0;

  let dot = 0;
  let leftNorm = 0;
  let rightNorm = 0;
  for (let i = 0; i < length; i += 1) {
    dot += left[i] * right[i];
    leftNorm += left[i] * left[i];
    rightNorm += right[i] * right[i];
  }
  if (!leftNorm || !rightNorm) return 0;
  return dot / Math.sqrt(leftNorm * rightNorm);
}

export class FixtureMemoryStore implements MemoryStore {
  private readonly recordsByUser = new Map<string, Map<string, MemoryRecord>>();
  private readonly embeddingsByUser = new Map<string, Map<string, MemoryEmbeddingRecord>>();

  async create(userId: string, record: MemoryRecord): Promise<void> {
    const records = this.recordsByUser.get(userId) ?? new Map<string, MemoryRecord>();
    records.set(record.id, record);
    this.recordsByUser.set(userId, records);
  }

  async update(userId: string, record: MemoryRecord): Promise<void> {
    await this.create(userId, record);
  }

  async getById(userId: string, memoryId: string): Promise<MemoryRecord | null> {
    return this.recordsByUser.get(userId)?.get(memoryId) ?? null;
  }

  async listByUser(userId: string): Promise<MemoryRecord[]> {
    return [...(this.recordsByUser.get(userId)?.values() ?? [])];
  }

  async saveEmbedding(value: MemoryEmbeddingRecord): Promise<void> {
    const embeddings = this.embeddingsByUser.get(value.userId) ?? new Map<string, MemoryEmbeddingRecord>();
    embeddings.set(value.memoryId, value);
    this.embeddingsByUser.set(value.userId, embeddings);
  }

  async semanticSearch(userId: string, queryEmbedding: readonly number[], limit: number): Promise<MemoryQueryResult[]> {
    const records = this.recordsByUser.get(userId);
    const embeddings = this.embeddingsByUser.get(userId);
    if (!records || !embeddings) return [];

    return [...embeddings.values()]
      .map((embedding) => {
        const memory = records.get(embedding.memoryId);
        if (!memory) return null;
        return {
          memory,
          similarity: cosineSimilarity(embedding.embedding, queryEmbedding),
        };
      })
      .filter((entry): entry is MemoryQueryResult => Boolean(entry))
      .sort((left, right) => right.similarity - left.similarity)
      .slice(0, limit);
  }

  async graphEvidenceByMemoryIds(userId: string, memoryIds: readonly string[]): Promise<MemoryRecord[]> {
    const records = this.recordsByUser.get(userId);
    if (!records) return [];
    return memoryIds
      .map((id) => records.get(id))
      .filter((record): record is MemoryRecord => Boolean(record));
  }

  async exportUserData(userId: string): Promise<MemoryRecord[]> {
    return this.listByUser(userId);
  }

  async deleteByIds(userId: string, memoryIds: readonly string[]): Promise<number> {
    const records = this.recordsByUser.get(userId);
    const embeddings = this.embeddingsByUser.get(userId);
    if (!records || !memoryIds.length) return 0;

    let deletedCount = 0;
    for (const memoryId of memoryIds) {
      if (records.delete(memoryId)) deletedCount += 1;
      embeddings?.delete(memoryId);
    }
    return deletedCount;
  }

  async hardDeleteUserData(userId: string): Promise<number> {
    const count = this.recordsByUser.get(userId)?.size ?? 0;
    this.recordsByUser.delete(userId);
    this.embeddingsByUser.delete(userId);
    return count;
  }
}
