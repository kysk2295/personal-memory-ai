import { describe, expect, test } from 'vitest';
import { createMemoryStore } from './createMemoryStore';
import { importNotionSourcesToMemoryStore } from './notionImportResume';

describe('importNotionSourcesToMemoryStore', () => {
  test('imports multiple Notion source ids with count-only resume-safe reporting', async () => {
    const store = createMemoryStore({ env: {} });
    const calls: string[] = [];
    const fetchNotion = async (url: string) => {
      calls.push(url);
      if (url.includes('/data_sources/source_rate_limited/query')) {
        return {
          ok: false,
          status: 429,
          headers: { get: () => '0' },
          json: async () => ({}),
        };
      }
      if (url.includes('/blocks/')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({ results: [] }),
        };
      }
      return {
        ok: true,
        status: 200,
        json: async () => ({
          results: [
            {
              id: 'page-secret-title',
              url: 'https://www.notion.so/private-page',
              created_time: '2026-05-20T01:00:00.000Z',
              properties: {
                Name: {
                  type: 'title',
                  title: [{ plain_text: 'Private Notion title must not appear in report' }],
                },
                Reflection: {
                  type: 'rich_text',
                  rich_text: [{ plain_text: 'Private Notion body must not appear in report' }],
                },
              },
            },
          ],
        }),
      };
    };

    const result = await importNotionSourcesToMemoryStore({
      store,
      userId: 'user-a',
      notionToken: 'secret_live_token',
      sourceIds: ['source_private', 'source_rate_limited'],
      createdAt: '2026-05-28T00:00:00.000Z',
      fetchNotion,
    });

    expect(result).toEqual({
      status: 'completed_with_skips',
      sourceCount: 2,
      successfulSources: 1,
      appliedSources: 1,
      previewRecordCount: 1,
      createdCount: 1,
      skippedPreviewRecordCount: 0,
      failureGroups: { '429:notion_rate_limited': 1 },
    });
    expect((await store.listByUser('user-a'))).toHaveLength(1);
    expect(calls).toEqual(
      expect.arrayContaining([
        'https://api.notion.com/v1/data_sources/source_private/query',
        'https://api.notion.com/v1/data_sources/source_rate_limited/query',
      ]),
    );
    expect(JSON.stringify(result)).not.toContain('secret_live_token');
    expect(JSON.stringify(result)).not.toContain('Private Notion title');
    expect(JSON.stringify(result)).not.toContain('Private Notion body');
  });
});
