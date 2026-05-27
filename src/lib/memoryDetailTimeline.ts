import type { MemoryRecord } from './memoryRecord';
import {
  isMemoryReviewLedgerRecord,
  listMemoryReviewLedgerEntries,
  type MemoryReviewLedgerEntry,
} from './memoryReviewLedger';

export interface MemoryDetailTimelineEntry {
  memoryId: string;
  observedAt: string;
  sourceLabel: string;
  title: string;
  rawExcerpt: string;
  privacyScope: MemoryRecord['privacyScope'];
  memoryType: MemoryRecord['memoryType'];
  facetLabels: string[];
  relatedMemoryIds: string[];
  reviewHistory: MemoryReviewLedgerEntry[];
  reviewComparisons: MemoryReviewComparison[];
  reviewHistoryCount: number;
  latestReviewRevisionId?: string;
  active: boolean;
}

export interface MemoryReviewComparison {
  revisionId: string;
  reviewedAt: string;
  changedFieldLabels: string[];
  sourceRef: string;
  beforeSummary: string;
  afterSummary: string;
  deltaLabel: string;
}

export interface MemoryDetailTimelineSummary {
  totalMemoryCount: number;
  startDate: string;
  endDate: string;
  selectedMemoryId?: string;
}

export interface MemoryDetailTimeline {
  summary: MemoryDetailTimelineSummary;
  entries: MemoryDetailTimelineEntry[];
}

function recordDate(record: MemoryRecord): string {
  return (record.observedAt ?? record.createdAt).slice(0, 10);
}

function compactExcerpt(value: string, maxLength = 180): string {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`;
}

function compareNewestFirst(left: MemoryRecord, right: MemoryRecord): number {
  const dateComparison = recordDate(right).localeCompare(recordDate(left));
  if (dateComparison !== 0) return dateComparison;
  return left.id.localeCompare(right.id);
}

function facetLabelsForRecord(record: MemoryRecord): string[] {
  return [
    ...record.emotionTags.map((emotion) => `emotion:${emotion}`),
    ...record.topicTags.map((topic) => `topic:${topic}`),
    ...record.projectTags.map((project) => `project:${project}`),
    record.decisionSignal === 'none' ? '' : `decision:${record.decisionSignal}`,
    `source:${record.sourceType}`,
  ].filter(Boolean);
}

function relatedMemoryIdsForRecord(record: MemoryRecord, records: readonly MemoryRecord[]): string[] {
  const ownFacets = new Set(facetLabelsForRecord(record));
  return records
    .filter((candidate) => candidate.id !== record.id)
    .map((candidate) => {
      const sharedFacetCount = facetLabelsForRecord(candidate).filter((facet) => ownFacets.has(facet)).length;
      const patternBoost = candidate.memoryType === 'pattern' ? 3 : 0;
      return {
        id: candidate.id,
        score: sharedFacetCount + patternBoost,
        observedAt: recordDate(candidate),
      };
    })
    .filter((candidate) => candidate.score > 0)
    .sort((left, right) => {
      const scoreComparison = right.score - left.score;
      if (scoreComparison !== 0) return scoreComparison;
      const dateComparison = right.observedAt.localeCompare(left.observedAt);
      if (dateComparison !== 0) return dateComparison;
      return left.id.localeCompare(right.id);
    })
    .map((candidate) => candidate.id);
}

function reviewChangedFieldLabel(field: MemoryReviewLedgerEntry['changedFields'][number]): string {
  if (field === 'rawText') return 'raw text';
  if (field === 'observedAt') return 'observed date';
  if (field === 'emotionTags') return 'emotion tags';
  if (field === 'topicTags') return 'topic tags';
  if (field === 'projectTags') return 'project tags';
  if (field === 'peopleTags') return 'people tags';
  return field;
}

function reviewComparisonForEntry(entry: MemoryReviewLedgerEntry): MemoryReviewComparison {
  const changedFieldLabels = entry.changedFields.map(reviewChangedFieldLabel);
  return {
    revisionId: entry.id,
    reviewedAt: entry.reviewedAt,
    changedFieldLabels,
    sourceRef: entry.sourceRef,
    beforeSummary: entry.beforeSummary,
    afterSummary: entry.afterSummary,
    deltaLabel: changedFieldLabels.length ? `${changedFieldLabels.join(', ')} changed` : 'no field changes',
  };
}

export function buildMemoryDetailTimeline(
  records: readonly MemoryRecord[],
  selectedMemoryId?: string,
): MemoryDetailTimeline {
  const memoryRecords = records.filter((record) => !isMemoryReviewLedgerRecord(record));
  const orderedRecords = [...memoryRecords].sort(compareNewestFirst);
  const dates = orderedRecords.map(recordDate).sort((left, right) => left.localeCompare(right));

  return {
    summary: {
      totalMemoryCount: orderedRecords.length,
      startDate: dates[0] ?? '',
      endDate: dates[dates.length - 1] ?? '',
      selectedMemoryId,
    },
    entries: orderedRecords.map((record) => {
      const reviewHistory = listMemoryReviewLedgerEntries(records, record.id);
      const reviewComparisons = reviewHistory.map(reviewComparisonForEntry);
      return {
        memoryId: record.id,
        observedAt: recordDate(record),
        sourceLabel: `${record.sourceType} · ${record.sourceRef}`,
        title: record.summary,
        rawExcerpt: compactExcerpt(record.rawText),
        privacyScope: record.privacyScope,
        memoryType: record.memoryType,
        facetLabels: facetLabelsForRecord(record),
        relatedMemoryIds: relatedMemoryIdsForRecord(record, memoryRecords),
        reviewHistory,
        reviewComparisons,
        reviewHistoryCount: reviewHistory.length,
        latestReviewRevisionId: reviewHistory[0]?.id,
        active: record.id === selectedMemoryId,
      };
    }),
  };
}
