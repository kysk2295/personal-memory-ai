import { selectEvidenceCleanupMemoryIds } from '../src/lib/evidenceCleanup';
import type { MemoryRecord } from '../src/lib/memoryRecord';

const baseUrl = process.env.PMI_LOCAL_URL ?? 'http://127.0.0.1:3001';
const shouldApply = process.env.PMI_CLEANUP_APPLY === 'true';

async function readJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}${path}`, init);
  if (!response.ok) throw new Error(`${path} failed with ${response.status}`);
  return (await response.json()) as T;
}

const exported = await readJson<{ records?: MemoryRecord[] }>('/api/export');
const memoryIds = selectEvidenceCleanupMemoryIds(exported.records ?? []);

let deletedCount = 0;
if (shouldApply && memoryIds.length) {
  const deleted = await readJson<{ deletedCount: number }>('/api/delete', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ memoryIds }),
  });
  deletedCount = deleted.deletedCount;
}

console.log(
  JSON.stringify(
    {
      baseUrl,
      mode: shouldApply ? 'apply' : 'dry-run',
      selectedCount: memoryIds.length,
      deletedCount,
    },
    null,
    2,
  ),
);
