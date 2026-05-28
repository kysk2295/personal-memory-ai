import { describe, expect, test } from 'vitest';
import { buildNotionImportCandidates, queryNotionDatabaseImportCandidates, queryNotionImportSources } from './notionImport';

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

  test('includes Notion page child block text in import candidates without exposing the token', async () => {
    const calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }> = [];
    const fetchNotion = async (url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) => {
      calls.push({ url, init });
      if (url.includes('/blocks/page-1/children')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: [
              {
                object: 'block',
                type: 'paragraph',
                paragraph: {
                  rich_text: [{ plain_text: 'The full diary body lives in a Notion page block.' }],
                },
              },
              {
                object: 'block',
                type: 'bulleted_list_item',
                bulleted_list_item: {
                  rich_text: [{ plain_text: 'Evidence note: I chose to keep the scope frozen.' }],
                },
              },
            ],
          }),
        };
      }
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

    expect(calls.map((call) => call.url)).toEqual([
      'https://api.notion.com/v1/data_sources/db_launch/query',
      'https://api.notion.com/v1/blocks/page-1/children?page_size=50',
    ]);
    expect(calls[1]?.init).toEqual(
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          authorization: 'Bearer secret_live_token',
          'notion-version': '2025-09-03',
        }),
      }),
    );
    expect(candidates[0]?.rawText).toContain('Launch scope journal');
    expect(candidates[0]?.rawText).toContain('Reflection: I felt anxious and chose to freeze the feature list.');
    expect(candidates[0]?.rawText).toContain('The full diary body lives in a Notion page block.');
    expect(candidates[0]?.rawText).toContain('Evidence note: I chose to keep the scope frozen.');
    expect(JSON.stringify(candidates)).not.toContain('secret_live_token');
  });

  test('lists accessible Notion import sources without exposing the token', async () => {
    const calls: Array<{ url: string; init: { method?: string; headers?: Record<string, string>; body?: string } }> = [];
    const fetchNotion = async (url: string, init: { method?: string; headers?: Record<string, string>; body?: string }) => {
      calls.push({ url, init });
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              object: 'data_source',
              id: 'source_journal',
              title: [{ plain_text: 'Journal database' }],
              url: 'https://www.notion.so/source_journal',
            },
            {
              object: 'page',
              id: 'page_ignore',
              properties: { title: { title: [{ plain_text: 'Regular page' }] } },
            },
            {
              object: 'database',
              id: 'database_legacy',
              title: [{ plain_text: 'Legacy database' }],
              url: 'https://www.notion.so/database_legacy',
            },
          ],
        }),
      };
    };

    const sources = await queryNotionImportSources({
      notionToken: 'secret_live_token',
      fetchNotion,
    });

    expect(calls[0]).toEqual({
      url: 'https://api.notion.com/v1/search',
      init: expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          authorization: 'Bearer secret_live_token',
          'notion-version': '2025-09-03',
        }),
      }),
    });
    expect(sources).toEqual([
      { id: 'source_journal', title: 'Journal database', object: 'data_source', url: 'https://www.notion.so/source_journal' },
      { id: 'database_legacy', title: 'Legacy database', object: 'database', url: 'https://www.notion.so/database_legacy' },
    ]);
    expect(JSON.stringify(sources)).not.toContain('secret_live_token');
  });
});
