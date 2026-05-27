import { describe, expect, test } from 'vitest';
import { buildImportUploadDraft } from './importUploadDraft';

describe('buildImportUploadDraft', () => {
  test('converts markdown and text files into private import preview candidates', () => {
    const draft = buildImportUploadDraft({
      batchId: 'local-upload-001',
      createdAt: '2026-05-28T02:00:00.000Z',
      files: [
        {
          name: '2026-05-27.md',
          path: 'daily/2026-05-27.md',
          text: '# 2026-05-27\n\nI felt anxious and chose to freeze the launch scope.',
          lastModified: '2026-05-27T23:00:00.000Z',
        },
        {
          name: 'quick-note.txt',
          text: 'A plain note should still become an import candidate.',
        },
      ],
    });

    expect(draft).toEqual({
      batchId: 'local-upload-001',
      createdAt: '2026-05-28T02:00:00.000Z',
      requiresLiveOAuth: false,
      files: [
        {
          name: '2026-05-27.md',
          path: 'daily/2026-05-27.md',
          candidateCount: 1,
          blocked: false,
        },
        {
          name: 'quick-note.txt',
          candidateCount: 1,
          blocked: false,
        },
      ],
      candidates: [
        expect.objectContaining({
          sourceType: 'markdown',
          sourceRef: 'markdown://daily/2026-05-27.md',
          observedAt: '2026-05-27',
          rawText: 'I felt anxious and chose to freeze the launch scope.',
          provenance: {
            importer: 'local-file-upload',
            sourceName: '2026-05-27.md',
            sourcePath: 'daily/2026-05-27.md',
          },
        }),
        expect.objectContaining({
          sourceType: 'markdown',
          sourceRef: 'markdown://quick-note.txt',
          observedAt: '2026-05-28',
          rawText: 'A plain note should still become an import candidate.',
        }),
      ],
    });
  });

  test('expands JSON export arrays into candidates while preserving source metadata', () => {
    const draft = buildImportUploadDraft({
      batchId: 'json-upload',
      createdAt: '2026-05-28T02:05:00.000Z',
      files: [
        {
          name: 'notion-export.json',
          text: JSON.stringify([
            {
              sourceType: 'notion',
              sourceRef: 'notion://journal/1',
              observedAt: '2026-05-20',
              rawText: 'Notion journal entry about recurring scope anxiety.',
              summary: 'Scope anxiety from Notion.',
            },
            {
              text: 'Fallback JSON item should become markdown when source fields are missing.',
            },
          ]),
        },
      ],
    });

    expect(draft.files).toEqual([{ name: 'notion-export.json', candidateCount: 2, blocked: false }]);
    expect(draft.candidates).toEqual([
      expect.objectContaining({
        sourceType: 'notion',
        sourceRef: 'notion://journal/1',
        observedAt: '2026-05-20',
        rawText: 'Notion journal entry about recurring scope anxiety.',
        summary: 'Scope anxiety from Notion.',
      }),
      expect.objectContaining({
        sourceType: 'markdown',
        sourceRef: 'markdown://notion-export.json#2',
        observedAt: '2026-05-28',
        rawText: 'Fallback JSON item should become markdown when source fields are missing.',
      }),
    ]);
  });

  test('keeps empty files as blocked draft rows without import candidates', () => {
    const draft = buildImportUploadDraft({
      batchId: 'empty-upload',
      createdAt: '2026-05-28T02:10:00.000Z',
      files: [
        {
          name: 'empty.md',
          text: '   ',
        },
      ],
    });

    expect(draft).toEqual({
      batchId: 'empty-upload',
      createdAt: '2026-05-28T02:10:00.000Z',
      requiresLiveOAuth: false,
      files: [
        {
          name: 'empty.md',
          candidateCount: 0,
          blocked: true,
          reason: 'empty_file',
        },
      ],
      candidates: [],
    });
  });
});
