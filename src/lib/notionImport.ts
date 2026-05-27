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
}

export interface NotionFetchResponse {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}

export type NotionFetch = (url: string, init: { method: string; headers: Record<string, string>; body: string }) => Promise<NotionFetchResponse>;

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

export function buildNotionImportCandidates(input: BuildNotionImportCandidatesInput): ImportPreviewCandidate[] {
  return input.pages
    .map((page, index): ImportPreviewCandidate | null => {
      const properties = page.properties ?? {};
      const title = titleFromProperties(properties) ?? `Notion page ${index + 1}`;
      const rawText = rawTextFromProperties(title, properties);
      if (!rawText.trim()) return null;
      const pageId = page.id ?? `page-${index + 1}`;
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
  return buildNotionImportCandidates({
    databaseId: input.databaseId,
    createdAt: input.createdAt,
    pages: pages.filter((page): page is NotionImportPage => isRecord(page)),
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
