import {
  normalizeMemoryRecord,
  normalizeText,
  type DecisionSignal,
  type MemoryRecord,
  type MemorySourceType,
} from './memoryRecord';

export type FastDiaryCaptureStatus = 'implemented' | 'partial' | 'skeleton' | 'fake/sample' | 'planned' | 'blocked';
export type FastDiaryCaptureSurface = 'mobile' | 'desktop' | 'web-prototype' | 'api-prototype';

export interface FastDiaryCaptureContract {
  surface: 'app';
  status: FastDiaryCaptureStatus;
  label: 'app-capture contract/prototype';
  nativeStatus: FastDiaryCaptureStatus;
  webGraphWorkspaceStatus: 'separate_surface';
}

export interface FastDiaryCaptureSource {
  surface?: FastDiaryCaptureSurface;
  deviceLabel?: string;
  localCaptureId?: string;
}

export interface FastDiaryCaptureHints {
  emotions?: string[];
  decision?: DecisionSignal;
  projects?: string[];
  topics?: string[];
  people?: string[];
  observedAt?: string;
  outcome?: string;
}

export interface FastDiaryCaptureInput {
  text: string;
  capturedAt?: string;
  source?: FastDiaryCaptureSource;
  sourceRef?: string;
  hints?: FastDiaryCaptureHints;
}

export interface FastDiaryCaptureFlatInput {
  text: string;
  capturedAt?: string;
  observedAt?: string;
  deviceId?: string;
  sourceRef?: string;
  emotionHints?: string[];
  decisionHint?: DecisionSignal;
  projectHints?: string[];
  topicHints?: string[];
  peopleHints?: string[];
  outcomeHint?: string;
}

export const FAST_DIARY_CAPTURE_CONTRACT: FastDiaryCaptureContract = {
  surface: 'app',
  status: 'partial',
  label: 'app-capture contract/prototype',
  nativeStatus: 'planned',
  webGraphWorkspaceStatus: 'separate_surface',
};

function sourceTypeForSurface(surface: FastDiaryCaptureSurface): MemorySourceType {
  if (surface === 'web-prototype') return 'web';
  if (surface === 'api-prototype') return 'api';
  return 'mobile';
}

function encodeSourceRefSegment(value: string | undefined, fallback: string): string {
  const normalized = normalizeText(value ?? '');
  return encodeURIComponent(normalized || fallback);
}

function buildSourceRef(source: FastDiaryCaptureSource | undefined): string {
  const surface = source?.surface ?? 'mobile';
  const deviceLabel = encodeSourceRefSegment(source?.deviceLabel, 'unknown-device');
  const localCaptureId = encodeSourceRefSegment(source?.localCaptureId, 'unsynced');
  return `app-capture://${surface}/${deviceLabel}/${localCaptureId}`;
}

export function createFastDiaryMemoryRecord(input: FastDiaryCaptureInput): MemoryRecord {
  const rawText = normalizeText(input.text);
  if (!rawText) {
    throw new Error('Fast diary capture requires non-empty text');
  }

  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const sourceSurface = input.source?.surface ?? 'mobile';
  const topics = [...(input.hints?.topics ?? []), FAST_DIARY_CAPTURE_CONTRACT.label];

  return normalizeMemoryRecord({
    sourceType: sourceTypeForSurface(sourceSurface),
    sourceRef: input.sourceRef ?? buildSourceRef(input.source),
    createdAt: capturedAt,
    observedAt: input.hints?.observedAt ?? capturedAt,
    rawText,
    memoryType: 'diary',
    emotionTags: input.hints?.emotions,
    topicTags: topics,
    projectTags: input.hints?.projects,
    peopleTags: input.hints?.people,
    decisionSignal: input.hints?.decision ?? 'none',
    outcomeText: input.hints?.outcome,
    embeddingStatus: 'pending',
    extractionStatus: 'manual',
  });
}

export function captureFastDiaryMemory(input: FastDiaryCaptureFlatInput): MemoryRecord {
  const capturedAt = input.capturedAt ?? new Date().toISOString();
  const sourceRef =
    input.sourceRef ??
    `app-capture://${encodeSourceRefSegment(input.deviceId, 'unknown-device')}/${encodeSourceRefSegment(
      capturedAt,
      'unsynced',
    )}`;

  return createFastDiaryMemoryRecord({
    text: input.text,
    capturedAt,
    sourceRef,
    source: {
      surface: 'mobile',
      deviceLabel: input.deviceId,
      localCaptureId: capturedAt,
    },
    hints: {
      emotions: input.emotionHints,
      decision: input.decisionHint,
      projects: input.projectHints,
      topics: input.topicHints,
      people: input.peopleHints,
      observedAt: input.observedAt,
      outcome: input.outcomeHint,
    },
  });
}
