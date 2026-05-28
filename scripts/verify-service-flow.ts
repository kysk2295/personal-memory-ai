import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, type Page } from 'playwright';
import { selectEvidenceCleanupMemoryIds } from '../src/lib/evidenceCleanup';
import type { MemoryRecord } from '../src/lib/memoryRecord';

const baseUrl = (process.env.PMI_LOCAL_URL ?? 'http://127.0.0.1:3001').replace(/\/$/, '');
const outputDir = resolve('artifacts/web-second-brain-product-surface');
const screenshotPath = resolve(outputDir, 'local-service-flow-playwright.png');
const shouldCleanupEvidenceRecords = process.env.PMI_EVIDENCE_KEEP_RECORDS !== 'true';

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function attribute(page: Page, selector: string, name: string): Promise<string | null> {
  return page.locator(selector).first().getAttribute(name);
}

async function postJson<T>(page: Page, path: string, body: unknown): Promise<T> {
  return page.evaluate(
    async ({ path: requestPath, body: requestBody }) => {
      const response = await fetch(requestPath, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const json = await response.json();
      if (!response.ok) throw new Error(`${requestPath} failed with ${response.status}: ${JSON.stringify(json)}`);
      return json;
    },
    { path, body },
  ) as Promise<T>;
}

async function getJson<T>(page: Page, path: string): Promise<T> {
  return page.evaluate(async (requestPath) => {
    const response = await fetch(requestPath);
    const json = await response.json();
    if (!response.ok) throw new Error(`${requestPath} failed with ${response.status}: ${JSON.stringify(json)}`);
    return json;
  }, path) as Promise<T>;
}

async function cleanupEvidenceRecords(page: Page): Promise<void> {
  if (!shouldCleanupEvidenceRecords) return;
  const exported = await getJson<{ records?: MemoryRecord[] }>(page, '/api/export');
  const memoryIds = selectEvidenceCleanupMemoryIds(exported.records ?? []);
  if (!memoryIds.length) return;
  await postJson<{ deletedCount: number }>(page, '/api/delete', { memoryIds });
}

async function verifyServiceFlow(page: Page): Promise<void> {
  const marker = `service-flow-${Date.now()}`;
  const diaryText = `Service flow smoke ${marker}: 앱에서 빠르게 적은 일기가 웹 세컨브레인에서 과거 결정 기억과 연결되는지 확인한다.`;

  await page.goto(`${baseUrl}/capture/`, { waitUntil: 'load', timeout: 30_000 });
  await page.locator('.capture-app-shell').waitFor({ state: 'attached', timeout: 10_000 });
  assert((await attribute(page, '.capture-app-shell', 'data-quick-save-endpoint')) === '/api/capture', 'Capture page should target the capture API');
  assert((await attribute(page, '.capture-app-shell', 'data-graph-target-route')) === '/', 'Capture page should hand off to the web graph');

  await page.locator('#quick-diary-text').fill(diaryText);
  await page.locator('[data-control="capture-emotion-hints"]').fill('anxiety, resolve');
  await page.locator('[data-control="capture-project-hints"]').fill('personal-memory-ai');
  await page.locator('[data-control="capture-topic-hints"]').fill('service flow, second brain, diary');
  await page.locator('[data-control="capture-decision-hint"]').selectOption('chosen');
  await page.locator('[data-control="capture-outcome-hint"]').fill('service flow smoke connected diary capture to graph');
  await page.locator('[data-control="quick-diary-save"]').click();
  await page.waitForFunction(
    () => document.querySelector('.capture-app-shell')?.getAttribute('data-quick-save-state') === 'saved',
    null,
    { timeout: 10_000 },
  );
  const capturedMemoryId = await attribute(page, '.capture-app-shell', 'data-last-captured-memory');
  assert(capturedMemoryId, 'Quick save should expose the created memory id');
  const graphHandoffUrl = await attribute(page, '.capture-app-shell', 'data-graph-handoff-url');
  assert(
    graphHandoffUrl === `/?memory=${encodeURIComponent(capturedMemoryId)}`,
    'Quick save should expose a graph handoff URL for the captured diary memory',
  );
  const sessionHandoffUrl = await attribute(page, '.capture-app-shell', 'data-session-handoff-url');
  assert(
    sessionHandoffUrl === `/?memory=${encodeURIComponent(capturedMemoryId)}&start=session`,
    'Quick save should expose an AI session handoff URL for the captured diary memory',
  );

  const search = await postJson<{ totalMatchCount: number; records: MemoryRecord[] }>(page, '/api/memory/search', {
    query: marker,
    limit: 5,
  });
  assert(search.totalMatchCount >= 1, 'Captured diary should be searchable from the web memory API');
  assert(search.records.some((record) => record.id === capturedMemoryId), 'Search should return the captured diary memory');

  await page.goto(`${baseUrl}/?memory=${encodeURIComponent(capturedMemoryId)}`, { waitUntil: 'load', timeout: 30_000 });
  await page.locator('[data-service-flow="diary-to-second-brain"]').waitFor({ state: 'attached', timeout: 10_000 });
  for (const step of [
    'quick-diary-capture',
    'diary-database-load',
    'second-brain-graph',
    'related-memory-nodes',
    'ask-report',
  ]) {
    assert((await page.locator(`[data-service-flow-step="${step}"]`).count()) === 1, `Missing service flow step ${step}`);
  }
  assert(
    (await attribute(page, '[data-service-flow="diary-to-second-brain"]', 'data-service-flow-graph-source')) ===
      'actual-memory-records',
    'Service flow should state that the graph is built from actual memory records',
  );

  await page.locator('[data-graph-library="cytoscape"][data-cytoscape-ready="true"]').waitFor({ timeout: 15_000 });
  await page.waitForFunction(
    () => document.querySelector('.second-brain-shell')?.getAttribute('data-graph-rehydrate-state') === 'ready',
    null,
    { timeout: 15_000 },
  );
  await page.waitForFunction(
    (memoryId) => document.querySelector('.second-brain-shell')?.getAttribute('data-capture-handoff-selected-memory') === memoryId,
    capturedMemoryId,
    { timeout: 15_000 },
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-capture-handoff-state')) === 'selected',
    'Web graph should select the captured memory from the handoff URL',
  );

  await page.goto(`${baseUrl}${sessionHandoffUrl}`, { waitUntil: 'load', timeout: 30_000 });
  await page.locator('[data-graph-library="cytoscape"][data-cytoscape-ready="true"]').waitFor({ timeout: 15_000 });
  await page.waitForFunction(
    () => document.querySelector('.second-brain-shell')?.getAttribute('data-graph-rehydrate-state') === 'ready',
    null,
    { timeout: 15_000 },
  );
  await page.waitForFunction(
    (memoryId) =>
      document.querySelector('.second-brain-shell')?.getAttribute('data-import-session-source-memory') === memoryId &&
      document.querySelector('.second-brain-shell')?.getAttribute('data-capture-handoff-session-state') === 'ready',
    capturedMemoryId,
    { timeout: 15_000 },
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-capture-handoff-start-mode')) === 'session',
    'AI session handoff should mark the web shell as session-started',
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-memory-session-state')) === 'ready',
    'AI session handoff should prepare the related-memory session',
  );

  const appShell = await getJson<{
    appShell: { records: MemoryRecord[] };
    memoryGraph: {
      stats: { memoryNodeCount: number; renderedMemoryNodeCount: number; graphNodeCount: number; edgeCount: number };
      elements: Array<{ data: { id: string; source?: string; target?: string } }>;
    };
  }>(page, '/api/app-shell');
  assert(appShell.appShell.records.length > 0, 'App shell should return a lightweight visible memory sample');
  assert(appShell.memoryGraph.stats.memoryNodeCount >= search.totalMatchCount, 'Graph stats should be derived from the full memory store, not only the lightweight sample');
  assert(
    appShell.memoryGraph.stats.edgeCount > appShell.memoryGraph.stats.renderedMemoryNodeCount,
    'Graph should expose related-memory edges for the rendered diary window, not isolated diary rows',
  );
  assert(
    appShell.memoryGraph.elements.some(
      (element) =>
        element.data.id === `memory:${capturedMemoryId}` ||
        element.data.source === `memory:${capturedMemoryId}` ||
        element.data.target === `memory:${capturedMemoryId}`,
    ),
    'Captured diary should become a graph node with related edges',
  );

  await page.locator('#ask-memory-bar-question').fill(`방금 쓴 일기 ${marker}와 관련해서 과거 기억은 뭐라고 말해?`);
  await page.locator('[data-control="ask-second-brain"]').click();
  await page.waitForFunction(
    () => document.querySelector('.second-brain-shell')?.getAttribute('data-ask-state') === 'answered',
    null,
    { timeout: 10_000 },
  );
  assert((await attribute(page, '.second-brain-shell', 'data-ask-evidence-label')) !== null, 'Ask should expose an evidence label');
  assert(Number.isFinite(Number(await attribute(page, '.second-brain-shell', 'data-ask-citation-count'))), 'Ask should expose a citation count');

  const askArtifactId = await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-id');
  assert(askArtifactId, 'Ask panel should expose a saveable artifact');
  await page.locator('[data-save-artifact-action="ask_answer"]').click();
  await page.waitForFunction(
    () => document.querySelector('[data-save-artifact-action="ask_answer"]')?.getAttribute('data-artifact-save-state') === 'saved',
    null,
    { timeout: 10_000 },
  );
  assert((await attribute(page, '.second-brain-shell', 'data-last-saved-artifact')) === askArtifactId, 'Saved Ask artifact should be recorded by the shell');

  const today = new Date().toISOString().slice(0, 10);
  const weeklyReport = await postJson<{ weeklyReport: { id: string; totalMemoryRecords: number; includedMemoryIds: string[] } }>(
    page,
    '/api/report/weekly',
    {
      startDate: today,
      endDate: today,
      generatedAt: new Date().toISOString(),
    },
  );
  assert(weeklyReport.weeklyReport.id === `weekly_report_${today}_${today}`, 'Weekly report should be generated for the diary day');
  assert(weeklyReport.weeklyReport.totalMemoryRecords >= 1, 'Weekly report should see at least the captured diary memory');

  await page.screenshot({ path: screenshotPath, fullPage: false });
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 980 } });

try {
  await verifyServiceFlow(page);
  await cleanupEvidenceRecords(page);
  console.log(JSON.stringify({ baseUrl, screenshotPath, serviceFlow: 'passed' }, null, 2));
} finally {
  await browser.close();
}
