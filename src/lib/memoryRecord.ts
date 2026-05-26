export type MemorySourceType =
  | 'mobile'
  | 'telegram'
  | 'web'
  | 'notion'
  | 'obsidian'
  | 'apple_notes'
  | 'markdown'
  | 'csv'
  | 'json'
  | 'paste'
  | 'api';

export type MemoryRecordType =
  | 'diary'
  | 'episodic'
  | 'decision'
  | 'reflection'
  | 'project'
  | 'person'
  | 'emotion'
  | 'pattern'
  | 'outcome';

export type DecisionSignal = 'none' | 'pending' | 'chosen' | 'avoided' | 'reversed';

export type MemoryRecordStatus = 'pending' | 'ready' | 'failed' | 'skipped';
export type MemoryExtractionStatus = 'pending' | 'ready' | 'failed' | 'manual';

export interface MemoryRecordInput {
  id?: string;
  sourceType: MemorySourceType;
  sourceRef: string;
  importBatchId?: string;
  createdAt?: string;
  observedAt?: string;
  rawText: string;
  summary?: string;
  memoryType?: MemoryRecordType;
  emotionTags?: string[];
  topicTags?: string[];
  projectTags?: string[];
  peopleTags?: string[];
  decisionSignal?: DecisionSignal;
  outcomeText?: string;
  privacyScope?: 'private';
  embeddingStatus?: MemoryRecordStatus;
  extractionStatus?: MemoryExtractionStatus;
}

export interface MemoryRecord {
  id: string;
  sourceType: MemorySourceType;
  sourceRef: string;
  importBatchId?: string;
  createdAt: string;
  observedAt?: string;
  rawText: string;
  summary: string;
  memoryType: MemoryRecordType;
  emotionTags: string[];
  topicTags: string[];
  projectTags: string[];
  peopleTags: string[];
  decisionSignal: DecisionSignal;
  outcomeText?: string;
  privacyScope: 'private';
  embeddingStatus: MemoryRecordStatus;
  extractionStatus: MemoryExtractionStatus;
}

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function normalizeText(value: string): string {
  return value.replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').trim();
}

export function normalizeTag(value: string): string {
  return value.trim().replace(/^#/, '').replace(/\s+/g, ' ');
}

export function uniqueTags(values: readonly string[] | undefined): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values ?? []) {
    const normalized = normalizeTag(value);
    if (!normalized) continue;
    const key = normalized.toLocaleLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(normalized);
  }
  return result;
}

export function summarizeRawText(rawText: string, maxLength = 120): string {
  const normalized = normalizeText(rawText).replace(/\s+/g, ' ');
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

export function createMemoryRecordId(
  sourceType: MemorySourceType,
  sourceRef: string,
  rawText: string,
  observedAt?: string,
): string {
  const basis = [sourceType, sourceRef, observedAt ?? '', normalizeText(rawText).slice(0, 2_000)].join('\u001f');
  return `mem_${sourceType}_${stableHash(basis)}`;
}

export function normalizeObservedAt(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (DATE_ONLY.test(trimmed)) return trimmed;
  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return trimmed;
  return parsed.toISOString();
}

export function normalizeMemoryRecord(input: MemoryRecordInput): MemoryRecord {
  const rawText = normalizeText(input.rawText);
  const observedAt = normalizeObservedAt(input.observedAt);
  const createdAt = input.createdAt ?? new Date().toISOString();
  const summary = normalizeText(input.summary ?? summarizeRawText(rawText));
  const id = input.id ?? createMemoryRecordId(input.sourceType, input.sourceRef, rawText, observedAt);

  return {
    id,
    sourceType: input.sourceType,
    sourceRef: input.sourceRef,
    importBatchId: input.importBatchId,
    createdAt,
    observedAt,
    rawText,
    summary,
    memoryType: input.memoryType ?? 'diary',
    emotionTags: uniqueTags(input.emotionTags),
    topicTags: uniqueTags(input.topicTags),
    projectTags: uniqueTags(input.projectTags),
    peopleTags: uniqueTags(input.peopleTags),
    decisionSignal: input.decisionSignal ?? 'none',
    outcomeText: input.outcomeText ? normalizeText(input.outcomeText) : undefined,
    privacyScope: 'private',
    embeddingStatus: input.embeddingStatus ?? 'pending',
    extractionStatus: input.extractionStatus ?? 'pending',
  };
}

export function getMemoryRecordDedupeKey(record: Pick<MemoryRecord, 'sourceType' | 'sourceRef' | 'observedAt' | 'rawText'>): string {
  return [
    record.sourceType,
    record.sourceRef,
    record.observedAt ?? '',
    stableHash(normalizeText(record.rawText)),
  ].join(':');
}
