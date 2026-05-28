import type { MemoryRecord } from './memoryRecord';

function isEvidenceRecord(record: MemoryRecord): boolean {
  const sourceRef = record.sourceRef;
  const rawText = record.rawText;
  return (
    rawText.includes('Imported local memory playwright-') ||
    rawText.includes('playwright-capture-') ||
    rawText.includes('service-flow-') ||
    sourceRef.startsWith('personal-memory-ai://saved-artifacts/') ||
    sourceRef.startsWith('personal-memory-ai://feedback/')
  );
}

export function selectEvidenceCleanupMemoryIds(records: readonly MemoryRecord[]): string[] {
  return records.filter(isEvidenceRecord).map((record) => record.id);
}
