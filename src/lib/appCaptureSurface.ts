import { captureFastDiaryMemory, type FastDiaryCaptureFlatInput } from './fastDiaryCapture';
import type { MemoryRecord } from './memoryRecord';

export interface AppCaptureDraft extends FastDiaryCaptureFlatInput {
  text: string;
  capturedAt: string;
  deviceId: string;
  emotionHints: string[];
  decisionHint: 'chosen';
  projectHints: string[];
  topicHints: string[];
}

export interface AppCaptureQuickSaveAction {
  method: 'POST';
  endpoint: '/api/capture';
  disabled: boolean;
  body: AppCaptureDraft;
}

export interface AppCaptureGraphSync {
  status: 'ready-for-store-backed-graph';
  targetRoute: '/';
  targetNodeId: string;
}

export interface AppCaptureSurfaceState {
  route: '/capture/';
  surfaceMode: 'mobile-first-capture';
  pwaStatus: 'installable-static-prototype';
  storageMode: 'local-first';
  privacyScope: 'private';
  syncTarget: 'web-second-brain';
  ownerUserId: string;
  draft: AppCaptureDraft;
  quickSaveAction: AppCaptureQuickSaveAction;
  savedPreview: MemoryRecord;
  graphSync: AppCaptureGraphSync;
}

export interface BuildAppCaptureSurfaceStateInput {
  userId: string;
  capturedAt?: string;
}

export function buildAppCaptureSurfaceState(input: BuildAppCaptureSurfaceStateInput): AppCaptureSurfaceState {
  const draft: AppCaptureDraft = {
    text: '오늘은 그래프를 더 꾸미기보다 앱 캡처 흐름을 먼저 실제로 만들자.',
    capturedAt: input.capturedAt ?? '2026-05-27T15:00:00.000Z',
    deviceId: 'pwa-local-device',
    emotionHints: ['resolve'],
    decisionHint: 'chosen',
    projectHints: ['personal-memory-ai'],
    topicHints: ['app capture', 'pwa', 'local-first'],
  };
  const savedPreview = captureFastDiaryMemory(draft);

  return {
    route: '/capture/',
    surfaceMode: 'mobile-first-capture',
    pwaStatus: 'installable-static-prototype',
    storageMode: 'local-first',
    privacyScope: 'private',
    syncTarget: 'web-second-brain',
    ownerUserId: input.userId,
    draft,
    quickSaveAction: {
      method: 'POST',
      endpoint: '/api/capture',
      disabled: false,
      body: draft,
    },
    savedPreview,
    graphSync: {
      status: 'ready-for-store-backed-graph',
      targetRoute: '/',
      targetNodeId: `memory:${savedPreview.id}`,
    },
  };
}
