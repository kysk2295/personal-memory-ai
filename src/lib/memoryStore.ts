import type { MemoryRecord } from './memoryRecord';

export type MemoryBackendMode = 'fixture' | 'postgres';

export interface MemoryEmbeddingRecord {
  memoryId: string;
  userId: string;
  embedding: readonly number[];
  model: string;
}

export interface MemoryQueryResult {
  memory: MemoryRecord;
  similarity: number;
}

export interface MemoryStore {
  create(userId: string, record: MemoryRecord): Promise<void>;
  update(userId: string, record: MemoryRecord): Promise<void>;
  getById(userId: string, memoryId: string): Promise<MemoryRecord | null>;
  listByUser(userId: string): Promise<MemoryRecord[]>;
  saveEmbedding(value: MemoryEmbeddingRecord): Promise<void>;
  semanticSearch(userId: string, queryEmbedding: readonly number[], limit: number): Promise<MemoryQueryResult[]>;
  graphEvidenceByMemoryIds(userId: string, memoryIds: readonly string[]): Promise<MemoryRecord[]>;
  exportUserData(userId: string): Promise<MemoryRecord[]>;
  deleteByIds(userId: string, memoryIds: readonly string[]): Promise<number>;
  hardDeleteUserData(userId: string): Promise<number>;
}

export function resolveMemoryBackendMode(env: Record<string, string | undefined>): MemoryBackendMode {
  return env.MEMORY_BACKEND_MODE === 'postgres' ? 'postgres' : 'fixture';
}
