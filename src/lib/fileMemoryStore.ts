import { existsSync, readFileSync } from 'node:fs';
import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryEmbeddingRecord, MemoryQueryResult, MemoryStore } from './memoryStore';

interface LocalMemoryVaultFile {
  version: 1;
  recordsByUser: Record<string, MemoryRecord[]>;
  embeddingsByUser: Record<string, MemoryEmbeddingRecord[]>;
}

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

function emptyVault(): LocalMemoryVaultFile {
  return {
    version: 1,
    recordsByUser: {},
    embeddingsByUser: {},
  };
}

function parseVaultFile(path: string): LocalMemoryVaultFile {
  if (!existsSync(path)) return emptyVault();
  const parsed = JSON.parse(readFileSync(path, 'utf8')) as Partial<LocalMemoryVaultFile>;
  return {
    version: 1,
    recordsByUser: parsed.recordsByUser ?? {},
    embeddingsByUser: parsed.embeddingsByUser ?? {},
  };
}

export class FileMemoryStore implements MemoryStore {
  private readonly recordsByUser = new Map<string, Map<string, MemoryRecord>>();
  private readonly embeddingsByUser = new Map<string, Map<string, MemoryEmbeddingRecord>>();
  private persistChain: Promise<void> = Promise.resolve();

  constructor(private readonly path: string) {
    const vault = parseVaultFile(path);
    for (const [userId, records] of Object.entries(vault.recordsByUser)) {
      this.recordsByUser.set(userId, new Map(records.map((record) => [record.id, record])));
    }
    for (const [userId, embeddings] of Object.entries(vault.embeddingsByUser)) {
      this.embeddingsByUser.set(userId, new Map(embeddings.map((embedding) => [embedding.memoryId, embedding])));
    }
  }

  async create(userId: string, record: MemoryRecord): Promise<void> {
    const records = this.recordsByUser.get(userId) ?? new Map<string, MemoryRecord>();
    records.set(record.id, record);
    this.recordsByUser.set(userId, records);
    await this.persist();
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
    await this.persist();
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
    if (deletedCount) await this.persist();
    return deletedCount;
  }

  async hardDeleteUserData(userId: string): Promise<number> {
    const count = this.recordsByUser.get(userId)?.size ?? 0;
    this.recordsByUser.delete(userId);
    this.embeddingsByUser.delete(userId);
    if (count) await this.persist();
    return count;
  }

  async flush(): Promise<void> {
    await this.persistChain;
  }

  private async persist(): Promise<void> {
    this.persistChain = this.persistChain.then(() => this.writeVault());
    await this.persistChain;
  }

  private async writeVault(): Promise<void> {
    const vault: LocalMemoryVaultFile = {
      version: 1,
      recordsByUser: Object.fromEntries(
        [...this.recordsByUser.entries()].map(([userId, records]) => [userId, [...records.values()]]),
      ),
      embeddingsByUser: Object.fromEntries(
        [...this.embeddingsByUser.entries()].map(([userId, embeddings]) => [userId, [...embeddings.values()]]),
      ),
    };
    await mkdir(dirname(this.path), { recursive: true });
    const tempPath = `${this.path}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(vault, null, 2)}\n`, 'utf8');
    await rename(tempPath, this.path);
  }
}
