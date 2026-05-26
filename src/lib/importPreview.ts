import {
  getMemoryRecordDedupeKey,
  normalizeMemoryRecord,
  normalizeObservedAt,
  normalizeText,
  type MemoryRecord,
  type MemoryRecordInput,
  type MemorySourceType,
} from './memoryRecord';

export type ImportPreviewStatus = 'implemented' | 'partial' | 'skeleton' | 'fake/sample' | 'planned' | 'blocked';
export type ImportPreviewDuplicateState = 'duplicate' | 'new' | 'possible';

export interface ImportPreviewContract {
  surface: 'web';
  status: ImportPreviewStatus;
  label: 'import-preview contract/integration seam';
  appCaptureSurfaceStatus: 'separate_surface';
  liveOAuthRequired: false;
}

export interface ImportPreviewCandidateProvenance {
  importer?: MemorySourceType | string;
  sourceName?: string;
  sourceUrl?: string;
  sourcePath?: string;
}

export interface ImportPreviewCandidate
  extends Omit<MemoryRecordInput, 'sourceType' | 'sourceRef' | 'rawText' | 'createdAt' | 'importBatchId'> {
  sourceType: Extract<MemorySourceType, 'notion' | 'obsidian' | 'markdown'>;
  sourceRef: string;
  rawText: string;
  status?: ImportPreviewStatus;
  provenance?: ImportPreviewCandidateProvenance;
}

export interface ImportPreviewProvenance {
  importer: MemorySourceType | string;
  sourceType: MemorySourceType;
  sourceRef: string;
  sourceName?: string;
  sourceUrl?: string;
  sourcePath?: string;
  capturedAt: string;
  liveOAuthRequired: false;
}

export interface ImportPreviewDuplicate {
  state: ImportPreviewDuplicateState;
  existingRecordIds: string[];
}

export interface ImportPreviewApplyAction {
  type: 'apply_import_record';
  batchId: string;
  previewRecordId: string;
  memoryRecordId?: string;
  enabled: boolean;
  label: 'Apply import';
  reason?: string;
}

export interface ImportPreviewUndoAction {
  type: 'undo_import_batch';
  batchId: string;
  appliedMemoryRecordIds: string[];
  enabled: boolean;
  label: 'Undo import';
  reason?: string;
}

export interface ImportPreviewRecord {
  id: string;
  sourceType: MemorySourceType;
  sourceRef: string;
  observedDate: string;
  statusLabel: ImportPreviewStatus;
  duplicate: ImportPreviewDuplicate;
  provenance: ImportPreviewProvenance;
  memoryRecord?: MemoryRecord;
  applyAction: ImportPreviewApplyAction;
}

export interface ImportPreviewSummaryGroup {
  count: number;
  duplicates: number;
  statuses: Partial<Record<ImportPreviewStatus, number>>;
}

export interface ImportPreviewSourceSummary extends ImportPreviewSummaryGroup {
  sourceType: MemorySourceType;
}

export interface ImportPreviewDateSummary extends ImportPreviewSummaryGroup {
  date: string;
}

export interface ImportPreviewSummary {
  bySource: ImportPreviewSourceSummary[];
  byDate: ImportPreviewDateSummary[];
  duplicates: Record<ImportPreviewDuplicateState, number>;
  byStatus: Partial<Record<ImportPreviewStatus, number>>;
}

export interface ImportPreview {
  contract: ImportPreviewContract;
  batchId: string;
  createdAt: string;
  requiresLiveOAuth: false;
  records: ImportPreviewRecord[];
  summary: ImportPreviewSummary;
}

export interface BuildImportPreviewInput {
  batchId: string;
  createdAt?: string;
  existingRecords?: readonly MemoryRecord[];
  candidates: readonly ImportPreviewCandidate[];
}

export const IMPORT_PREVIEW_CONTRACT: ImportPreviewContract = {
  surface: 'web',
  status: 'partial',
  label: 'import-preview contract/integration seam',
  appCaptureSurfaceStatus: 'separate_surface',
  liveOAuthRequired: false,
};

const DUPLICATE_ZEROES: Record<ImportPreviewDuplicateState, number> = {
  duplicate: 0,
  new: 0,
  possible: 0,
};

function previewRecordId(batchId: string, index: number): string {
  return `import_preview_${batchId}_${index + 1}`;
}

function dateBucket(observedAt: string | undefined, createdAt: string): string {
  const normalized = normalizeObservedAt(observedAt) ?? createdAt;
  return normalized.slice(0, 10);
}

function buildProvenance(candidate: ImportPreviewCandidate, createdAt: string): ImportPreviewProvenance {
  const provenance: ImportPreviewProvenance = {
    importer: candidate.provenance?.importer ?? candidate.sourceType,
    sourceType: candidate.sourceType,
    sourceRef: candidate.sourceRef,
    capturedAt: createdAt,
    liveOAuthRequired: false,
  };

  if (candidate.provenance?.sourceName) provenance.sourceName = candidate.provenance.sourceName;
  if (candidate.provenance?.sourceUrl) provenance.sourceUrl = candidate.provenance.sourceUrl;
  if (candidate.provenance?.sourcePath) provenance.sourcePath = candidate.provenance.sourcePath;

  return provenance;
}

function addStatusCount(target: Partial<Record<ImportPreviewStatus, number>>, status: ImportPreviewStatus): void {
  target[status] = (target[status] ?? 0) + 1;
}

function duplicateForRecord(
  record: MemoryRecord,
  exactDedupeKeys: ReadonlyMap<string, string[]>,
  normalizedTextIndex: ReadonlyMap<string, string[]>,
): ImportPreviewDuplicate {
  const exactRecordIds = exactDedupeKeys.get(getMemoryRecordDedupeKey(record)) ?? [];
  if (exactRecordIds.length > 0) {
    return {
      state: 'duplicate',
      existingRecordIds: exactRecordIds,
    };
  }

  const possibleRecordIds = normalizedTextIndex.get(normalizeText(record.rawText).toLocaleLowerCase()) ?? [];
  if (possibleRecordIds.length > 0) {
    return {
      state: 'possible',
      existingRecordIds: possibleRecordIds,
    };
  }

  return {
    state: 'new',
    existingRecordIds: [],
  };
}

function buildSummary(records: readonly ImportPreviewRecord[]): ImportPreviewSummary {
  const bySource = new Map<MemorySourceType, ImportPreviewSummaryGroup>();
  const byDate = new Map<string, ImportPreviewSummaryGroup>();
  const duplicates: Record<ImportPreviewDuplicateState, number> = { ...DUPLICATE_ZEROES };
  const byStatus: Partial<Record<ImportPreviewStatus, number>> = {};

  for (const record of records) {
    const duplicateCount = record.duplicate.state === 'duplicate' ? 1 : 0;

    const sourceGroup = bySource.get(record.sourceType) ?? { count: 0, duplicates: 0, statuses: {} };
    sourceGroup.count += 1;
    sourceGroup.duplicates += duplicateCount;
    addStatusCount(sourceGroup.statuses, record.statusLabel);
    bySource.set(record.sourceType, sourceGroup);

    const dateGroup = byDate.get(record.observedDate) ?? { count: 0, duplicates: 0, statuses: {} };
    dateGroup.count += 1;
    dateGroup.duplicates += duplicateCount;
    addStatusCount(dateGroup.statuses, record.statusLabel);
    byDate.set(record.observedDate, dateGroup);

    duplicates[record.duplicate.state] += 1;
    addStatusCount(byStatus, record.statusLabel);
  }

  return {
    bySource: [...bySource.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([sourceType, group]) => ({ sourceType, ...group })),
    byDate: [...byDate.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([date, group]) => ({ date, ...group })),
    duplicates,
    byStatus,
  };
}

export function buildImportPreview(input: BuildImportPreviewInput): ImportPreview {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const exactDedupeKeys = new Map<string, string[]>();
  const normalizedTextIndex = new Map<string, string[]>();

  for (const existingRecord of input.existingRecords ?? []) {
    const exactKey = getMemoryRecordDedupeKey(existingRecord);
    exactDedupeKeys.set(exactKey, [...(exactDedupeKeys.get(exactKey) ?? []), existingRecord.id]);

    const textKey = normalizeText(existingRecord.rawText).toLocaleLowerCase();
    normalizedTextIndex.set(textKey, [...(normalizedTextIndex.get(textKey) ?? []), existingRecord.id]);
  }

  const records = input.candidates.map<ImportPreviewRecord>((candidate, index) => {
    const id = previewRecordId(input.batchId, index);
    const rawText = normalizeText(candidate.rawText);
    const observedDate = dateBucket(candidate.observedAt, createdAt);
    const statusLabel: ImportPreviewStatus = rawText ? candidate.status ?? 'implemented' : 'blocked';
    const provenance = buildProvenance(candidate, createdAt);

    if (!rawText) {
      return {
        id,
        sourceType: candidate.sourceType,
        sourceRef: candidate.sourceRef,
        observedDate,
        statusLabel,
        duplicate: {
          state: 'new',
          existingRecordIds: [],
        },
        provenance,
        applyAction: {
          type: 'apply_import_record',
          batchId: input.batchId,
          previewRecordId: id,
          enabled: false,
          label: 'Apply import',
          reason: 'MemoryRecord rawText is empty',
        },
      };
    }

    const memoryRecord = normalizeMemoryRecord({
      ...candidate,
      rawText,
      createdAt,
      importBatchId: input.batchId,
      extractionStatus: candidate.extractionStatus ?? 'pending',
      embeddingStatus: candidate.embeddingStatus ?? 'pending',
    });
    const duplicate = duplicateForRecord(memoryRecord, exactDedupeKeys, normalizedTextIndex);

    return {
      id,
      sourceType: candidate.sourceType,
      sourceRef: candidate.sourceRef,
      observedDate,
      statusLabel,
      duplicate,
      provenance,
      memoryRecord,
      applyAction: {
        type: 'apply_import_record',
        batchId: input.batchId,
        previewRecordId: id,
        memoryRecordId: memoryRecord.id,
        enabled: true,
        label: 'Apply import',
      },
    };
  });

  return {
    contract: IMPORT_PREVIEW_CONTRACT,
    batchId: input.batchId,
    createdAt,
    requiresLiveOAuth: false,
    records,
    summary: buildSummary(records),
  };
}

export function createImportPreviewUndoAction(
  preview: Pick<ImportPreview, 'batchId'>,
  appliedMemoryRecordIds: readonly string[],
): ImportPreviewUndoAction {
  const ids = [...appliedMemoryRecordIds];
  if (ids.length > 0) {
    return {
      type: 'undo_import_batch',
      batchId: preview.batchId,
      appliedMemoryRecordIds: ids,
      enabled: true,
      label: 'Undo import',
    };
  }

  return {
    type: 'undo_import_batch',
    batchId: preview.batchId,
    appliedMemoryRecordIds: ids,
    enabled: false,
    label: 'Undo import',
    reason: 'No applied MemoryRecord ids',
  };
}
