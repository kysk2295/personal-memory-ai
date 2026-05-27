import { describe, expect, test } from 'vitest';
import { buildNotionImportCandidates, queryNotionDatabaseImportCandidates } from './notionImport';

const notionQueryResponse = {
  results: [
    {
      id: 'page-1',
      url: 'https://www.notion.so/page-1',
      created_time: '2026-05-20T01:00:00.000Z',
      last_edited_time: '2026-05-22T03:00:00.000Z',
      properties: {
        Name: {
          type: 'title',
          title: [{ plain_text: 'Launch scope journal' }],
        },
        Date: {
          type: 'date',
          date: { start: '2026-05-21' },
        },
        Status: {
          type: 'select',
          select: { name: 'Journal' },
        },
        Tags: {
          type: 'multi_select',
          multi_select: [{ name: 'launch' }, { name: 'scope' }],
        },
        Reflection: {
          type: 'rich_text',
          rich_text: [{ plain_text: 'I felt anxious and chose to freeze the feature list.' }],
        },
      },
    },
  ],
};

describe('notion import connector', () => {
  test('maps Notion database pages into private import preview candidates', () => {
    const candidates = buildNotionImportCandidates({
      databaseId: 'db_launch',
      pages: notionQueryResponse.results,
      createdAt: '2026-05-28T00:00:00.000Z',
    });

    expect(candidates).toEqual([
      expect.objectContaining({
        sourceType: 'notion',
        sourceRef: 'notion://data-source/db_launch/page/page-1',
        observedAt: '2026-05-21',
        summary: 'Launch scope journal',
        rawText: expect.stringContaining('Reflection: I felt anxious and chose to freeze the feature list.'),
        topicTags: ['launch', 'scope', 'Journal'],
        provenance: {
          importer: 'live-notion-database',
          sourceName: 'Launch scope journal',
          sourceUrl: 'https://www.notion.so/page-1',
        },
      }),
    ]);
  });

  test('queries the Notion data source API without exposing the token in candidate metadata', async () => {
    const calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }> = [];
    const fetchNotion = async (url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => notionQueryResponse,
      };
    };

    const candidates = await queryNotionDatabaseImportCandidates({
      databaseId: 'db_launch',
      notionToken: 'secret_live_token',
      createdAt: '2026-05-28T00:00:00.000Z',
      fetchNotion,
    });

    expect(calls[0]).toEqual({
      url: 'https://api.notion.com/v1/data_sources/db_launch/query',
      init: expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer secret_live_token',
          'notion-version': '2025-09-03',
        }),
        body: JSON.stringify({ page_size: 25 }),
      }),
    });
    expect(JSON.stringify(candidates)).not.toContain('secret_live_token');
    expect(candidates[0]?.sourceRef).toBe('notion://data-source/db_launch/page/page-1');
  });
});
