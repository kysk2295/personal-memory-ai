import { buildMemoryDetailTimeline } from './memoryDetailTimeline';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryReviewLedgerEntry } from './memoryReviewLedger';

export interface MemoryProvenanceExport {
  exportType: 'memory_provenance';
  exportedAt: string;
  filename: string;
  memory: MemoryRecord;
  reviewHistory: MemoryReviewLedgerEntry[];
  relatedMemoryIds: string[];
  evidence: {
    citationMemoryIds: string[];
    sourceRefs: string[];
    reviewRevisionIds: string[];
  };
}

export interface BuildMemoryProvenanceExportInput {
  records: readonly MemoryRecord[];
  memoryId: string;
  exportedAt?: string;
}

export function buildMemoryProvenanceExportFilename(memoryId: string, exportedAt: string): string {
  return `memory-provenance-${memoryId}-${exportedAt.slice(0, 10)}.json`;
}

export function buildMemoryProvenanceExport(
  input: BuildMemoryProvenanceExportInput,
): MemoryProvenanceExport | null {
  const exportedAt = input.exportedAt ?? new Date().toISOString();
  const timeline = buildMemoryDetailTimeline(input.records, input.memoryId);
  const timelineEntry = timeline.entries.find((entry) => entry.memoryId === input.memoryId);
  const memory = input.records.find((record) => record.id === input.memoryId);

  if (!timelineEntry || !memory) return null;

  return {
    exportType: 'memory_provenance',
    exportedAt,
    filename: buildMemoryProvenanceExportFilename(input.memoryId, exportedAt),
    memory,
    reviewHistory: timelineEntry.reviewHistory,
    relatedMemoryIds: timelineEntry.relatedMemoryIds,
    evidence: {
      citationMemoryIds: [memory.id],
      sourceRefs: [memory.sourceRef],
      reviewRevisionIds: timelineEntry.reviewHistory.map((entry) => entry.id),
    },
  };
}
