import { describe, expect, test } from 'vitest';
import { buildAppCaptureSurfaceState } from './appCaptureSurface';
import { renderAppCaptureDocument } from '../AppCapture';

describe('app capture surface state', () => {
  test('models a mobile-first local private quick diary capture', () => {
    const state = buildAppCaptureSurfaceState({
      userId: 'local-user',
      capturedAt: '2026-05-27T15:00:00.000Z',
    });

    expect(state).toMatchObject({
      route: '/capture/',
      surfaceMode: 'mobile-first-capture',
      pwaStatus: 'installable-static-prototype',
      storageMode: 'local-first',
      privacyScope: 'private',
      syncTarget: 'web-second-brain',
      quickSaveAction: {
        method: 'POST',
        endpoint: '/api/capture',
        disabled: false,
      },
      draft: {
        text: '오늘은 그래프를 더 꾸미기보다 앱 캡처 흐름을 먼저 실제로 만들자.',
        emotionHints: ['resolve'],
        projectHints: ['personal-memory-ai'],
        topicHints: ['app capture', 'pwa', 'local-first'],
      },
      savedPreview: {
        sourceType: 'mobile',
        privacyScope: 'private',
        extractionStatus: 'manual',
      },
      graphSync: {
        status: 'ready-for-store-backed-graph',
        targetRoute: '/',
      },
    });
    expect(state.quickSaveAction.body).toEqual({
      text: state.draft.text,
      capturedAt: '2026-05-27T15:00:00.000Z',
      deviceId: 'pwa-local-device',
      emotionHints: ['resolve'],
      decisionHint: 'chosen',
      projectHints: ['personal-memory-ai'],
      topicHints: ['app capture', 'pwa', 'local-first'],
    });
    expect(state.savedPreview.id).toMatch(/^mem_mobile_/);
    expect(state.graphSync.targetNodeId).toBe(`memory:${state.savedPreview.id}`);
  });

  test('renders a standalone mobile PWA capture document with API and graph handoff evidence', () => {
    const html = renderAppCaptureDocument();

    expect(html).toContain('<!doctype html>');
    expect(html).toContain('<link rel="manifest" href="/manifest.webmanifest" />');
    expect(html).toContain('aria-label="Mobile app quick diary capture"');
    expect(html).toContain('data-surface-mode="mobile-first-capture"');
    expect(html).toContain('data-pwa-status="installable-static-prototype"');
    expect(html).toContain('data-storage-mode="local-first"');
    expect(html).toContain('data-privacy-scope="private"');
    expect(html).toContain('data-quick-save-endpoint="/api/capture"');
    expect(html).toContain('data-quick-save-method="POST"');
    expect(html).toContain('data-graph-sync-status="ready-for-store-backed-graph"');
    expect(html).toContain('data-graph-target-route="/"');
    expect(html).toContain('data-graph-target-node="memory:');
    expect(html).toContain('data-graph-handoff-url="/?memory=');
    expect(html).toContain('data-session-handoff-url="/?memory=');
    expect(html).toContain('data-capture-hints-panel="manual"');
    expect(html).toContain('name="emotionHints"');
    expect(html).toContain('name="projectHints"');
    expect(html).toContain('name="topicHints"');
    expect(html).toContain('name="decisionHint"');
    expect(html).toContain('name="outcomeHint"');
    expect(html).toContain('data-control="quick-diary-save"');
    expect(html).toContain('data-control="open-captured-memory-graph"');
    expect(html).toContain('data-control="open-captured-memory-session"');
    expect(html).toContain('세컨브레인에서 연관 기억 보기');
    expect(html).toContain('AI 세션 시작');
    expect(html).toContain("fetch(quickSaveEndpoint");
    expect(html).toContain("captureShell.setAttribute('data-graph-handoff-url', graphHandoffUrl)");
    expect(html).toContain("captureShell.setAttribute('data-session-handoff-url', sessionHandoffUrl)");
    expect(html).toContain("openGraphLink?.setAttribute('href', graphHandoffUrl)");
    expect(html).toContain("openSessionLink?.setAttribute('href', sessionHandoffUrl)");
    expect(html).toContain("captureShell.setAttribute('data-quick-save-state', 'saved')");
    expect(html).toContain('오늘은 그래프를 더 꾸미기보다 앱 캡처 흐름을 먼저 실제로 만들자.');
    expect(html).toContain('local-first');
    expect(html).toContain('private vault');
    expect(html).not.toContain('id="quick-diary-text" readonly');
    expect(html).not.toContain('public shared memory');
  });
});
