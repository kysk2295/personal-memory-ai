import type { MemoryRecord } from './memoryRecord';

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
