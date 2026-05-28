import { describe, expect, test } from 'vitest';
import { normalizeMemoryRecord } from './memoryRecord';
import { selectEvidenceCleanupMemoryIds } from './evidenceCleanup';

describe('selectEvidenceCleanupMemoryIds', () => {
  test('selects only Playwright synthetic records by explicit evidence markers', () => {
    const records = [
      normalizeMemoryRecord({
        id: 'mem_playwright_import',
        sourceType: 'markdown',
        sourceRef: 'markdown://local-upload/playwright',
        rawText: 'Imported local memory playwright-123 says I should cut scope.',
      }),
      normalizeMemoryRecord({
        id: 'mem_saved_artifact',
        sourceType: 'api',
        sourceRef: 'personal-memory-ai://saved-artifacts/artifact_ask_answer_sha-test',
        rawText: 'Saved artifact smoke.',
      }),
      normalizeMemoryRecord({
        id: 'mem_feedback',
        sourceType: 'api',
        sourceRef: 'personal-memory-ai://feedback/feedback-test',
        rawText: 'User correction: Playwright feedback smoke.',
      }),
      normalizeMemoryRecord({
        id: 'mem_capture_playwright',
        sourceType: 'mobile',
        sourceRef: 'app-capture://pwa-local-device/2026-05-28T00%3A00%3A00.000Z',
        rawText: 'Playwright capture memory playwright-capture-123 with manual hints.',
      }),
      normalizeMemoryRecord({
        id: 'mem_real_notion',
        sourceType: 'notion',
        sourceRef: 'notion://data-source/journal/page/real',
        rawText: 'A real imported diary memory mentioning playwright as a metaphor should stay.',
      }),
    ];

    expect(selectEvidenceCleanupMemoryIds(records)).toEqual([
      'mem_playwright_import',
      'mem_saved_artifact',
      'mem_feedback',
      'mem_capture_playwright',
    ]);
  });
});
