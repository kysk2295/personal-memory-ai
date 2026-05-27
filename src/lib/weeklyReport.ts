import { detectRepeatedPatterns, type DetectedPattern } from './patternDetector';
import type { DecisionSignal, MemoryRecord } from './memoryRecord';

export type WeeklyReportStatus = 'implemented';
export type WeeklyReportEvidenceLabel = 'sufficient_evidence' | 'insufficient_evidence';

export interface WeeklyReportWindow {
  startDate: string;
  endDate: string;
}

export interface WeeklyReportAggregate {
  value: string;
  count: number;
  supportingMemoryIds: string[];
}

export interface WeeklyReportAggregates {
  emotions: WeeklyReportAggregate[];
  decisions: WeeklyReportAggregate[];
  outcomes: WeeklyReportAggregate[];
  projects: WeeklyReportAggregate[];
}

export interface GenerateWeeklyReportInput {
  records: readonly MemoryRecord[];
  startDate: string;
  endDate: string;
  generatedAt?: string;
  minimumEvidenceCount?: number;
}

export interface WeeklyReport {
  id: string;
  status: WeeklyReportStatus;
  generatedAt: string;
  window: WeeklyReportWindow;
  evidenceLabel: WeeklyReportEvidenceLabel;
  totalMemoryRecords: number;
  includedMemoryIds: string[];
  insufficientEvidenceReason?: string;
  aggregates: WeeklyReportAggregates;
  patternInsights: DetectedPattern[];
}

const DEFAULT_MINIMUM_EVIDENCE_COUNT = 2;

function recordDate(record: MemoryRecord): string {
  return (record.observedAt ?? record.createdAt).slice(0, 10);
}

function compareRecordsByReportOrder(left: MemoryRecord, right: MemoryRecord): number {
  const dateComparison = recordDate(left).localeCompare(recordDate(right));
  if (dateComparison !== 0) return dateComparison;
  return left.id.localeCompare(right.id);
}

function isInWindow(record: MemoryRecord, window: WeeklyReportWindow): boolean {
  const date = recordDate(record);
  return date >= window.startDate && date <= window.endDate;
}

function addAggregateValue(
  target: Map<string, string[]>,
  value: string | undefined,
  memoryId: string,
): void {
  if (!value || value === 'none') return;
  target.set(value, [...(target.get(value) ?? []), memoryId]);
}

function buildAggregates(values: ReadonlyMap<string, string[]>): WeeklyReportAggregate[] {
  return [...values.entries()]
    .map(([value, supportingMemoryIds]) => ({
      value,
      count: supportingMemoryIds.length,
      supportingMemoryIds,
    }))
    .sort((left, right) => {
      const countComparison = right.count - left.count;
      if (countComparison !== 0) return countComparison;
      return left.value.localeCompare(right.value);
    });
}

function aggregateRecords(records: readonly MemoryRecord[]): WeeklyReportAggregates {
  const emotions = new Map<string, string[]>();
  const decisions = new Map<DecisionSignal, string[]>();
  const outcomes = new Map<string, string[]>();
  const projects = new Map<string, string[]>();

  for (const record of records) {
    for (const emotion of record.emotionTags) addAggregateValue(emotions, emotion, record.id);
    addAggregateValue(decisions, record.decisionSignal, record.id);
    addAggregateValue(outcomes, record.outcomeText, record.id);
    for (const project of record.projectTags) addAggregateValue(projects, project, record.id);
  }

  return {
    emotions: buildAggregates(emotions),
    decisions: buildAggregates(decisions),
    outcomes: buildAggregates(outcomes),
    projects: buildAggregates(projects),
  };
}

export function generateWeeklyReport(input: GenerateWeeklyReportInput): WeeklyReport {
  const window = {
    startDate: input.startDate,
    endDate: input.endDate,
  };
  const includedRecords = input.records
    .filter((record) => isInWindow(record, window))
    .slice()
    .sort(compareRecordsByReportOrder);
  const minimumEvidenceCount = input.minimumEvidenceCount ?? DEFAULT_MINIMUM_EVIDENCE_COUNT;
  const evidenceLabel =
    includedRecords.length >= minimumEvidenceCount ? 'sufficient_evidence' : 'insufficient_evidence';

  return {
    id: `weekly_report_${window.startDate}_${window.endDate}`,
    status: 'implemented',
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    window,
    evidenceLabel,
    totalMemoryRecords: includedRecords.length,
    includedMemoryIds: includedRecords.map((record) => record.id),
    insufficientEvidenceReason:
      evidenceLabel === 'insufficient_evidence'
        ? `Need at least ${minimumEvidenceCount} MemoryRecord citations in the weekly window.`
        : undefined,
    aggregates: aggregateRecords(includedRecords),
    patternInsights: detectRepeatedPatterns(includedRecords).patterns,
  };
}
