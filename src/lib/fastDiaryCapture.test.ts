import { describe, expect, test } from 'vitest';
import {
  FAST_DIARY_CAPTURE_CONTRACT,
  createFastDiaryMemoryRecord,
} from './fastDiaryCapture';

describe('createFastDiaryMemoryRecord', () => {
  test('turns text-first app diary capture into a MemoryRecord-compatible record', () => {
    const record = createFastDiaryMemoryRecord({
      text: '  Felt anxious after the import preview review, so I decided to freeze graph polish today.  ',
      capturedAt: '2026-05-26T07:30:00.000Z',
      source: {
        surface: 'mobile',
        deviceLabel: 'ios-shortcut',
        localCaptureId: 'capture-001',
      },
      hints: {
        emotions: ['anxiety', '#focus', 'anxiety'],
        decision: 'chosen',
        projects: ['personal-memory-ai'],
        topics: ['import preview', 'graph evidence'],
      },
    });

    expect(record.sourceType).toBe('mobile');
    expect(record.sourceRef).toBe('app-capture://mobile/ios-shortcut/capture-001');
    expect(record.createdAt).toBe('2026-05-26T07:30:00.000Z');
    expect(record.observedAt).toBe('2026-05-26T07:30:00.000Z');
    expect(record.rawText).toBe(
      'Felt anxious after the import preview review, so I decided to freeze graph polish today.',
    );
    expect(record.summary).toBe(record.rawText);
    expect(record.memoryType).toBe('diary');
    expect(record.emotionTags).toEqual(['anxiety', 'focus']);
    expect(record.projectTags).toEqual(['personal-memory-ai']);
    expect(record.topicTags).toEqual([
      'import preview',
      'graph evidence',
      'app-capture contract/prototype',
    ]);
    expect(record.decisionSignal).toBe('chosen');
    expect(record.embeddingStatus).toBe('pending');
    expect(record.extractionStatus).toBe('manual');
    expect(record.privacyScope).toBe('private');
    expect(record.id).toMatch(/^mem_mobile_/);
  });

  test('labels the current implementation as an app-capture contract prototype', () => {
    const record = createFastDiaryMemoryRecord({
      text: 'Quick note from the future native app capture sheet.',
      capturedAt: '2026-05-26T08:00:00.000Z',
    });

    expect(FAST_DIARY_CAPTURE_CONTRACT).toEqual({
      surface: 'app',
      status: 'partial',
      label: 'app-capture contract/prototype',
      nativeStatus: 'planned',
      webGraphWorkspaceStatus: 'separate_surface',
    });
    expect(record.sourceRef).toContain('app-capture://');
    expect(record.topicTags).toContain('app-capture contract/prototype');
    expect(record.topicTags).not.toContain('web graph workspace');
  });

  test('rejects empty text so graph evidence cannot be created from blank captures', () => {
    expect(() =>
      createFastDiaryMemoryRecord({
        text: '   ',
        capturedAt: '2026-05-26T08:00:00.000Z',
      }),
    ).toThrow('Fast diary capture requires non-empty text');
  });
});
