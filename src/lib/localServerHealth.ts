import type { MemoryStoreRuntime } from './memoryStoreRuntime';

export interface LiveHealthPayload {
  status: 'ok';
  service: 'personal-memory-ai-web';
  memoryBackend: MemoryStoreRuntime['backendMode'];
  migrationStatus: MemoryStoreRuntime['migrationStatus'];
  databaseUrl: MemoryStoreRuntime['databaseUrlPresence'];
  localDurableStore: 'enabled' | 'disabled';
}

export function buildLiveHealthPayload(
  runtime: Pick<MemoryStoreRuntime, 'backendMode' | 'migrationStatus' | 'databaseUrlPresence'>,
): LiveHealthPayload {
  return {
    status: 'ok',
    service: 'personal-memory-ai-web',
    memoryBackend: runtime.backendMode,
    migrationStatus: runtime.migrationStatus,
    databaseUrl: runtime.databaseUrlPresence,
    localDurableStore: runtime.backendMode === 'local-file' ? 'enabled' : 'disabled',
  };
}
