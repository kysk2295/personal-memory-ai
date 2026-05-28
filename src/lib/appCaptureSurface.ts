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

export interface AppCaptureRelatedPreviewMemory {
  id: string;
  title: string;
  reason: string;
}

export interface AppCaptureRelatedPreview {
  status: 'ready-after-save';
  count: number;
  memories: AppCaptureRelatedPreviewMemory[];
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
  relatedPreview: AppCaptureRelatedPreview;
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
  const relatedPreviewMemories: AppCaptureRelatedPreviewMemory[] = [
    {
      id: 'mem_launch_may_anxiety_scope_delay',
      title: '출시 직전 범위가 커져 일정이 밀렸던 기억',
      reason: '불안, 출시, 범위 확대가 현재 기록과 겹침',
    },
    {
      id: 'mem_launch_june_anxiety_scope_delay',
      title: '기능 추가 욕구가 출시 불안으로 번졌던 회고',
      reason: '비슷한 감정 흐름과 결정 패턴',
    },
    {
      id: 'mem_freeze_vs_feature_addition',
      title: '멈출지 더 만들지 고민했던 반복 패턴',
      reason: '결정 상황과 프로젝트 맥락이 연결됨',
    },
  ];

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
    relatedPreview: {
      status: 'ready-after-save',
      count: relatedPreviewMemories.length,
      memories: relatedPreviewMemories,
    },
  };
}
