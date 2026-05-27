import type { MemoryRecord } from './memoryRecord';
import { normalizeMemoryRecord } from './memoryRecord';

export type MemoryReviewChangedField =
  | 'summary'
  | 'rawText'
  | 'observedAt'
  | 'emotionTags'
  | 'topicTags'
  | 'projectTags'
  | 'peopleTags';

export interface MemoryReviewLedgerEntry {
  id: string;
  userId: string;
  memoryId: string;
  reviewedAt: string;
  changedFields: MemoryReviewChangedField[];
  beforeSummary: string;
  afterSummary: string;
  sourceRef: string;
}

export interface BuildMemoryReviewLedgerEntryInput {
  userId: string;
  before: MemoryRecord;
  after: MemoryRecord;
  reviewedAt?: string;
}

const REVIEW_LEDGER_SOURCE_PREFIX = 'personal-memory-ai://memory-review-ledger/';

const REVIEW_FIELDS: MemoryReviewChangedField[] = [
  'summary',
  'rawText',
  'observedAt',
  'emotionTags',
  'topicTags',
  'projectTags',
  'peopleTags',
];

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

function comparableValue(record: MemoryRecord, field: MemoryReviewChangedField): string {
  const value = record[field];
  return Array.isArray(value) ? JSON.stringify(value) : String(value ?? '');
}

export function buildMemoryReviewLedgerEntry(input: BuildMemoryReviewLedgerEntryInput): MemoryReviewLedgerEntry {
  const reviewedAt = input.reviewedAt ?? new Date().toISOString();
  const changedFields = REVIEW_FIELDS.filter(
    (field) => comparableValue(input.before, field) !== comparableValue(input.after, field),
  );
  const hash = stableHash(
    [
      input.userId,
      input.after.id,
      reviewedAt,
      changedFields.join(','),
      input.before.summary,
      input.after.summary,
      input.before.rawText,
      input.after.rawText,
    ].join('\u001f'),
  );

  return {
    id: `memory_review_${input.after.id}_${hash}`,
    userId: input.userId,
    memoryId: input.after.id,
    reviewedAt,
    changedFields,
    beforeSummary: input.before.summary,
    afterSummary: input.after.summary,
    sourceRef: input.after.sourceRef,
  };
}

export function buildMemoryReviewLedgerRecord(entry: MemoryReviewLedgerEntry): MemoryRecord {
  return normalizeMemoryRecord({
    id: entry.id,
    sourceType: 'api',
    sourceRef: `${REVIEW_LEDGER_SOURCE_PREFIX}${entry.memoryId}/${entry.id}`,
    createdAt: entry.reviewedAt,
    observedAt: entry.reviewedAt,
    rawText: JSON.stringify(entry),
    summary: `Reviewed memory ${entry.memoryId}: ${entry.changedFields.length ? entry.changedFields.join(', ') : 'no field changes'}.`,
    memoryType: 'reflection',
    topicTags: ['memory-review-ledger', entry.memoryId],
    privacyScope: 'private',
    embeddingStatus: 'skipped',
    extractionStatus: 'ready',
  });
}

export function isMemoryReviewLedgerRecord(record: MemoryRecord): boolean {
  return record.sourceType === 'api' && record.sourceRef.startsWith(REVIEW_LEDGER_SOURCE_PREFIX);
}

export function memoryReviewLedgerRecordToEntry(record: MemoryRecord): MemoryReviewLedgerEntry | null {
  if (!isMemoryReviewLedgerRecord(record)) return null;
  try {
    const value = JSON.parse(record.rawText) as Partial<MemoryReviewLedgerEntry>;
    if (
      typeof value.id !== 'string' ||
      typeof value.userId !== 'string' ||
      typeof value.memoryId !== 'string' ||
      typeof value.reviewedAt !== 'string' ||
      !Array.isArray(value.changedFields) ||
      typeof value.beforeSummary !== 'string' ||
      typeof value.afterSummary !== 'string' ||
      typeof value.sourceRef !== 'string'
    ) {
      return null;
    }
    return {
      id: value.id,
      userId: value.userId,
      memoryId: value.memoryId,
      reviewedAt: value.reviewedAt,
      changedFields: value.changedFields.filter((field): field is MemoryReviewChangedField =>
        REVIEW_FIELDS.includes(field as MemoryReviewChangedField),
      ),
      beforeSummary: value.beforeSummary,
      afterSummary: value.afterSummary,
      sourceRef: value.sourceRef,
    };
  } catch {
    return null;
  }
}

export function listMemoryReviewLedgerEntries(
  records: readonly MemoryRecord[],
  memoryId: string,
): MemoryReviewLedgerEntry[] {
  return records
    .map((record, index) => ({ entry: memoryReviewLedgerRecordToEntry(record), index }))
    .filter((item): item is { entry: MemoryReviewLedgerEntry; index: number } => {
      if (!item.entry) return false;
      return item.entry.memoryId === memoryId;
    })
    .sort((left, right) => {
      const reviewedAtComparison = right.entry.reviewedAt.localeCompare(left.entry.reviewedAt);
      if (reviewedAtComparison !== 0) return reviewedAtComparison;
      return right.index - left.index;
    })
    .map((item) => item.entry);
}
