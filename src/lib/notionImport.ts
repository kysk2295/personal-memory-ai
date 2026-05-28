import type { ImportPreviewCandidate } from './importPreview';

export interface NotionImportPage {
  id?: string;
  url?: string;
  created_time?: string;
  last_edited_time?: string;
  properties?: Record<string, unknown>;
}

export interface BuildNotionImportCandidatesInput {
  databaseId: string;
  pages: readonly NotionImportPage[];
  createdAt: string;
  pageBlocksByPageId?: Record<string, readonly NotionImportBlock[]>;
}

export interface NotionFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export type NotionFetch = (
  url: string,
  init: { method: string; headers: Record<string, string>; body?: string },
) => Promise<NotionFetchResponse>;

export interface QueryNotionDatabaseImportCandidatesInput {
  databaseId: string;
  notionToken: string;
  createdAt: string;
  pageSize?: number;
  fetchNotion?: NotionFetch;
}

export interface NotionImportSource {
  id: string;
  title: string;
  object: 'data_source' | 'database';
  url?: string;
}

export interface NotionImportBlock {
  object?: string;
  type?: string;
  paragraph?: { rich_text?: unknown };
  heading_1?: { rich_text?: unknown };
  heading_2?: { rich_text?: unknown };
  heading_3?: { rich_text?: unknown };
  bulleted_list_item?: { rich_text?: unknown };
  numbered_list_item?: { rich_text?: unknown };
  quote?: { rich_text?: unknown };
  callout?: { rich_text?: unknown };
  to_do?: { rich_text?: unknown };
  toggle?: { rich_text?: unknown };
  code?: { rich_text?: unknown };
}

export interface QueryNotionImportSourcesInput {
  notionToken: string;
  fetchNotion?: NotionFetch;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function plainTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (isRecord(item) && typeof item.plain_text === 'string' ? item.plain_text.trim() : ''))
    .filter(Boolean);
}

function textFromProperty(property: unknown): string[] {
  if (!isRecord(property) || typeof property.type !== 'string') return [];
  if (property.type === 'title') return plainTextList(property.title);
  if (property.type === 'rich_text') return plainTextList(property.rich_text);
  if (property.type === 'select' && isRecord(property.select) && typeof property.select.name === 'string') {
    return [property.select.name.trim()].filter(Boolean);
  }
  if (property.type === 'multi_select' && Array.isArray(property.multi_select)) {
    return property.multi_select
      .map((item) => (isRecord(item) && typeof item.name === 'string' ? item.name.trim() : ''))
      .filter(Boolean);
  }
  if (property.type === 'status' && isRecord(property.status) && typeof property.status.name === 'string') {
    return [property.status.name.trim()].filter(Boolean);
  }
  if (property.type === 'date' && isRecord(property.date) && typeof property.date.start === 'string') {
    return [property.date.start.trim()].filter(Boolean);
  }
  if (property.type === 'number' && typeof property.number === 'number') return [String(property.number)];
  if (property.type === 'checkbox' && typeof property.checkbox === 'boolean') return [String(property.checkbox)];
  return [];
}

function titleFromProperties(properties: Record<string, unknown>): string | undefined {
  for (const property of Object.values(properties)) {
    if (isRecord(property) && property.type === 'title') {
      const text = textFromProperty(property).join(' ').trim();
      if (text) return text;
    }
  }
  return undefined;
}

function observedAtFromProperties(properties: Record<string, unknown>, page: NotionImportPage, createdAt: string): string {
  for (const property of Object.values(properties)) {
    if (isRecord(property) && property.type === 'date' && isRecord(property.date) && typeof property.date.start === 'string') {
      return property.date.start.slice(0, 10);
    }
  }
  return (page.last_edited_time ?? page.created_time ?? createdAt).slice(0, 10);
}

function tagsFromProperties(properties: Record<string, unknown>): string[] {
  const tags = new Set<string>();
  for (const targetType of ['multi_select', 'select', 'status']) {
    for (const property of Object.values(properties)) {
      if (!isRecord(property) || property.type !== targetType) continue;
      textFromProperty(property).forEach((tag) => tags.add(tag));
    }
  }
  return Array.from(tags);
}

function rawTextFromProperties(title: string, properties: Record<string, unknown>): string {
  const lines = [title];
  for (const [name, property] of Object.entries(properties)) {
    const values = textFromProperty(property);
    if (!values.length) continue;
    const line = `${name}: ${values.join(', ')}`;
    if (line !== `${name}: ${title}`) lines.push(line);
  }
  return Array.from(new Set(lines)).join('\n');
}

function textFromBlock(block: NotionImportBlock): string[] {
  if (!block.type) return [];
  const blockValue = block[block.type as keyof NotionImportBlock];
  if (!isRecord(blockValue)) return [];
  return plainTextList(blockValue.rich_text);
}

function rawTextFromBlocks(blocks: readonly NotionImportBlock[]): string {
  return blocks
    .flatMap(textFromBlock)
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

export function buildNotionImportCandidates(input: BuildNotionImportCandidatesInput): ImportPreviewCandidate[] {
  return input.pages
    .map((page, index): ImportPreviewCandidate | null => {
      const properties = page.properties ?? {};
      const title = titleFromProperties(properties) ?? `Notion page ${index + 1}`;
      const pageId = page.id ?? `page-${index + 1}`;
      const rawText = [rawTextFromProperties(title, properties), rawTextFromBlocks(input.pageBlocksByPageId?.[pageId] ?? [])]
        .filter((section) => section.trim())
        .join('\n');
      if (!rawText.trim()) return null;
      return {
        sourceType: 'notion',
        sourceRef: `notion://data-source/${input.databaseId}/page/${pageId}`,
        observedAt: observedAtFromProperties(properties, page, input.createdAt),
        summary: title,
        rawText,
        topicTags: tagsFromProperties(properties),
        provenance: {
          importer: 'live-notion-database',
          sourceName: title,
          ...(page.url ? { sourceUrl: page.url } : {}),
        },
      };
    })
    .filter((candidate): candidate is ImportPreviewCandidate => Boolean(candidate));
}

async function queryNotionPageBlocks(input: {
  pageId: string;
  notionToken: string;
  fetchNotion: NotionFetch;
}): Promise<NotionImportBlock[]> {
  const blocks: NotionImportBlock[] = [];
  let nextCursor: string | undefined;
  do {
    const cursorParam = nextCursor ? `&start_cursor=${encodeURIComponent(nextCursor)}` : '';
    const response = await input.fetchNotion(
      `https://api.notion.com/v1/blocks/${input.pageId}/children?page_size=50${cursorParam}`,
      {
        method: 'GET',
        headers: {
          authorization: `Bearer ${input.notionToken}`,
          'notion-version': '2025-09-03',
          'content-type': 'application/json',
        },
      },
    );
    if (!response.ok) {
      if (blocks.length) return blocks;
      throw new Error(`notion_blocks_failed:${response.status}`);
    }
    const body = await response.json();
    const pageBlocks = isRecord(body) && Array.isArray(body.results) ? body.results : [];
    blocks.push(...pageBlocks.filter((block): block is NotionImportBlock => isRecord(block)));
    nextCursor = isRecord(body) && body.has_more === true && typeof body.next_cursor === 'string' ? body.next_cursor : undefined;
  } while (nextCursor);
  return blocks;
}

export async function queryNotionDatabaseImportCandidates(
  input: QueryNotionDatabaseImportCandidatesInput,
): Promise<ImportPreviewCandidate[]> {
  const fetchNotion = input.fetchNotion ?? fetch;
  const pageSize = input.pageSize ?? 25;
  const response = await fetchNotion(`https://api.notion.com/v1/data_sources/${input.databaseId}/query`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${input.notionToken}`,
      'notion-version': '2025-09-03',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ page_size: pageSize }),
  });
  if (!response.ok) throw new Error(`notion_query_failed:${response.status}`);
  const body = await response.json();
  const pages = isRecord(body) && Array.isArray(body.results) ? body.results : [];
  const validPages = pages.filter((page): page is NotionImportPage => isRecord(page));
  const pageBlocksByPageId: Record<string, NotionImportBlock[]> = {};
  await Promise.all(
    validPages.map(async (page) => {
      if (!page.id) return;
      try {
        pageBlocksByPageId[page.id] = await queryNotionPageBlocks({
          pageId: page.id,
          notionToken: input.notionToken,
          fetchNotion,
        });
      } catch {
        pageBlocksByPageId[page.id] = [];
      }
    }),
  );
  return buildNotionImportCandidates({
    databaseId: input.databaseId,
    createdAt: input.createdAt,
    pages: validPages,
    pageBlocksByPageId,
  });
}

function titleFromNotionTitleArray(value: unknown): string | undefined {
  const text = plainTextList(value).join(' ').trim();
  return text || undefined;
}

function sourceFromSearchResult(result: unknown): NotionImportSource | null {
  if (!isRecord(result)) return null;
  if (result.object !== 'data_source' && result.object !== 'database') return null;
  if (typeof result.id !== 'string') return null;
  const title = titleFromNotionTitleArray(result.title) ?? `${result.object} ${result.id}`;
  return {
    id: result.id,
    title,
    object: result.object,
    ...(typeof result.url === 'string' ? { url: result.url } : {}),
  };
}

export async function queryNotionImportSources(input: QueryNotionImportSourcesInput): Promise<NotionImportSource[]> {
  const fetchNotion = input.fetchNotion ?? fetch;
  const response = await fetchNotion('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${input.notionToken}`,
      'notion-version': '2025-09-03',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ page_size: 50 }),
  });
  if (!response.ok) throw new Error(`notion_search_failed:${response.status}`);
  const body = await response.json();
  const results = isRecord(body) && Array.isArray(body.results) ? body.results : [];
  return results.map(sourceFromSearchResult).filter((source): source is NotionImportSource => Boolean(source));
}
