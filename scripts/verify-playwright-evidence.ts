import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';

const outputDir = resolve('artifacts/web-second-brain-product-surface');
const benchmarkScreenshot = resolve(outputDir, 'benchmark-careerhacker-memory-playwright.png');
const localScreenshot = resolve(outputDir, 'local-graph-density-playwright.png');
const interactionScreenshot = resolve(outputDir, 'local-graph-interactions-playwright.png');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function attribute(page: Page, selector: string, name: string): Promise<string | null> {
  return page.locator(selector).first().getAttribute(name);
}

async function captureBenchmark(page: Page): Promise<void> {
  await page.goto('https://www.careerhackeralex.com/memory', {
    waitUntil: 'domcontentloaded',
    timeout: 60_000,
  });
  await page.waitForTimeout(2_000);
  await page.screenshot({ path: benchmarkScreenshot, fullPage: false });
}

async function verifyLocalInteractions(page: Page): Promise<void> {
  const localUrl = process.env.PMI_LOCAL_URL ?? pathToFileURL(resolve('dist/index.html')).href;
  await page.goto(localUrl, { waitUntil: 'load', timeout: 30_000 });
  await page.locator('.obsidian-memory-graph').waitFor({ timeout: 10_000 });

  assert((await attribute(page, '.second-brain-shell', 'data-benchmark-node-count')) === '225', 'Expected benchmark node count marker');
  assert((await attribute(page, '.second-brain-shell', 'data-benchmark-edge-count')) === '1010', 'Expected benchmark edge count marker');
  assert((await page.locator('.obsidian-background-node').count()) === 225, 'Expected 225 visible ambient graph nodes');
  assert((await page.locator('.ghost-memory-edge').count()) === 1010, 'Expected 1010 visible ambient graph edges');

  await page.screenshot({ path: localScreenshot, fullPage: false });

  await page.locator('[data-control="spacing"][data-spacing="wide"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-spacing')) === 'wide', 'Spacing control should switch graph spacing to wide');

  await page.locator('[data-control="toggle-labels"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-labels')) === 'hidden', 'Label toggle should hide graph labels');

  await page.locator('[data-filter-chip="semantic"]').click();
  assert((await attribute(page, '[data-filter-chip="semantic"]', 'aria-pressed')) === 'false', 'Semantic filter chip should toggle off');
  assert((await attribute(page, '.second-brain-shell', 'data-filter-semantic')) === 'off', 'Shell should expose semantic filter off state');
  assert(
    (await attribute(page, '[data-filter-kind="semantic"]', 'data-filter-active')) === 'false',
    'Semantic graph targets should become visually inactive',
  );

  const firstMemoryNode = page.locator('[data-control="select-memory"]').first();
  const firstCitation = await firstMemoryNode.getAttribute('data-inspector-citation');
  assert(firstCitation, 'Expected selectable memory node citation');
  await firstMemoryNode.click();
  assert(
    (await attribute(page, '[data-inspector-panel="pmi015"]', 'data-selected-memory')) === firstCitation,
    'Memory node click should update inspector selection',
  );
  assert((await attribute(page, '.second-brain-shell', 'data-active-memory')) === firstCitation, 'Shell should expose active memory after node selection');

  await page.locator('[data-control="rearrange"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-layout-version')) === '1', 'Rearrange should advance layout version');
  assert((await attribute(page, '.second-brain-shell', 'data-layout-mode')) === 'rearranged', 'Rearrange should switch graph layout mode');

  await page.screenshot({ path: interactionScreenshot, fullPage: false });
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const benchmarkPage = await context.newPage();
  await captureBenchmark(benchmarkPage);

  const localPage = await context.newPage();
  await verifyLocalInteractions(localPage);

  console.log(
    JSON.stringify(
      {
        benchmarkScreenshot,
        localScreenshot,
        interactionScreenshot,
        verified: ['graph density markers', 'spacing click', 'label toggle', 'filter toggle', 'node selection', 'rearrange click'],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
