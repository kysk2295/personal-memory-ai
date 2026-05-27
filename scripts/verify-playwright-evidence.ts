import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';

const outputDir = resolve('artifacts/web-second-brain-product-surface');
const benchmarkScreenshot = resolve(outputDir, 'benchmark-careerhacker-memory-playwright.png');
const localScreenshot = resolve(outputDir, 'local-graph-density-playwright.png');
const interactionScreenshot = resolve(outputDir, 'local-graph-interactions-playwright.png');
const searchScreenshot = resolve(outputDir, 'local-memory-search-detail-playwright.png');

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function attribute(page: Page, selector: string, name: string): Promise<string | null> {
  return page.locator(selector).first().getAttribute(name);
}

async function clickCytoscapeNode(page: Page, nodeId: string): Promise<void> {
  const renderedPosition = await page.evaluate((targetNodeId) => {
    const graph = (window as any).__personalMemoryGraph;
    const node = graph?.cy?.getElementById(targetNodeId);
    if (!node || node.empty()) return null;
    const position = node.renderedPosition();
    return { x: position.x, y: position.y };
  }, nodeId);
  assert(renderedPosition, `Expected Cytoscape node ${nodeId} to exist`);

  const graphBox = await page.locator('#memory-graph-cytoscape').boundingBox();
  assert(graphBox, 'Expected Cytoscape graph mount to have a bounding box');
  await page.mouse.click(graphBox.x + renderedPosition.x, graphBox.y + renderedPosition.y);
}

async function clickableCytoscapeMemoryCitation(page: Page): Promise<string> {
  const citation = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    const graphElement = document.querySelector('#memory-graph-cytoscape');
    const graphBox = graphElement?.getBoundingClientRect();
    if (!graph?.cy || !graphBox) return null;

    const memoryNodes = graph.cy.nodes('[kind = "memory"]').toArray();
    for (const node of memoryNodes) {
      const position = node.renderedPosition();
      const hitTarget = document.elementFromPoint(graphBox.x + position.x, graphBox.y + position.y);
      if (hitTarget?.closest('#memory-graph-cytoscape')) return node.data('recordId');
    }

    return memoryNodes[0]?.data('recordId') ?? null;
  });
  assert(citation, 'Expected at least one clickable Cytoscape memory node citation');
  return citation;
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
  await page.locator('.obsidian-memory-graph').waitFor({ state: 'attached', timeout: 10_000 });
  await page.locator('[data-graph-library="cytoscape"][data-cytoscape-ready="true"]').waitFor({ timeout: 10_000 });

  assert((await attribute(page, '.second-brain-shell', 'data-graph-renderer')) === 'cytoscape', 'Expected Cytoscape renderer to become active');
  assert((await attribute(page, '.second-brain-shell', 'data-memory-node-count')) === '8', 'Expected data-derived memory count marker');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-node-count')) === '44', 'Expected data-derived graph node count marker');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-edge-count')) === '56', 'Expected data-derived graph edge count marker');
  assert((await attribute(page, '#memory-graph-cytoscape', 'data-cytoscape-node-count')) === '44', 'Expected Cytoscape node count to match graph payload');
  assert((await attribute(page, '#memory-graph-cytoscape', 'data-cytoscape-edge-count')) === '56', 'Expected Cytoscape edge count to match graph payload');
  assert((await page.locator('#memory-graph-cytoscape canvas').count()) > 0, 'Expected Cytoscape to render a canvas');
  assert((await page.locator('#saved-artifact-actions').count()) === 1, 'Expected saved artifact payload manifest');
  const savedArtifactManifest = await page.locator('#saved-artifact-actions').textContent();
  assert(savedArtifactManifest?.includes('"endpoint":"/api/capture"'), 'Expected saved artifact manifest to target capture API');
  assert(savedArtifactManifest?.includes('"artifact":{"id":"artifact_'), 'Expected saved artifact manifest to include full artifact payloads');
  assert((await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-save-state')) === 'ready', 'Expected Ask saved artifact action to start ready');
  assert((await attribute(page, '[data-save-artifact-action="weekly_report"]', 'data-artifact-save-endpoint')) === '/api/capture', 'Expected saved artifact action to expose capture endpoint');
  assert((await attribute(page, '[data-memory-timeline-panel="pmi025"]', 'data-timeline-entry-count')) === '8', 'Expected timeline panel to render eight private memories');
  assert(
    (await page.locator('[data-timeline-memory-id^="mem_api_artifact_"]').count()) === 3,
    'Expected saved artifacts to render as timeline memories',
  );
  assert(
    (await attribute(page, '[data-timeline-memory-id="mem_freeze_vs_feature_addition"]', 'data-timeline-active')) === 'true',
    'Expected default selected memory to be active in the timeline',
  );

  const graphStats = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.stats;
  });
  assert(graphStats?.memoryNodeCount === 8, 'Expected browser graph stats to include eight real memory nodes');
  assert(graphStats?.graphNodeCount === 44, 'Expected browser graph stats to include data-derived graph nodes');
  assert(graphStats?.edgeCount === 56, 'Expected browser graph stats to include data-derived graph edges');
  await page.waitForFunction(() => {
    const graph = document.querySelector('#memory-graph-cytoscape');
    const fallback = document.querySelector('.graph-workspace');
    return (
      graph &&
      fallback &&
      Number.parseFloat(getComputedStyle(graph).opacity) > 0.98 &&
      getComputedStyle(fallback).visibility === 'hidden'
    );
  });

  await page.screenshot({ path: localScreenshot, fullPage: false });

  const askArtifactId = await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-id');
  assert(askArtifactId, 'Expected Ask save action to expose artifact id');
  await page.locator('[data-save-artifact-action="ask_answer"]').click();
  assert((await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-save-state')) === 'saved', 'Ask save action should mark artifact saved');
  assert((await attribute(page, '.second-brain-shell', 'data-last-saved-artifact')) === askArtifactId, 'Shell should expose the last saved artifact id');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'artifact-saved', 'Shell should expose artifact saved interaction state');

  await page.locator('[data-control="spacing"][data-spacing="wide"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-spacing')) === 'wide', 'Spacing control should switch graph spacing to wide');

  await page.locator('[data-control="toggle-labels"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-labels')) === 'hidden', 'Label toggle should hide graph labels');
  const cytoscapeHiddenLabelCount = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.nodes('.labels-hidden').length ?? 0;
  });
  assert(cytoscapeHiddenLabelCount === 44, 'Label toggle should hide Cytoscape node labels');

  const firstCitation = await clickableCytoscapeMemoryCitation(page);
  await clickCytoscapeNode(page, `memory:${firstCitation}`);
  await page.waitForFunction(
    (citation) => document.querySelector('[data-inspector-panel="pmi015"]')?.getAttribute('data-selected-memory') === citation,
    firstCitation,
  );
  assert(
    (await attribute(page, '[data-inspector-panel="pmi015"]', 'data-selected-memory')) === firstCitation,
    'Cytoscape memory node click should update inspector selection',
  );
  assert((await attribute(page, '.second-brain-shell', 'data-active-memory')) === firstCitation, 'Shell should expose active memory after Cytoscape node selection');

  await page.locator('[data-filter-chip="semantic"]').click();
  assert((await attribute(page, '[data-filter-chip="semantic"]', 'aria-pressed')) === 'false', 'Semantic filter chip should toggle off');
  assert((await attribute(page, '.second-brain-shell', 'data-filter-semantic')) === 'off', 'Shell should expose semantic filter off state');
  assert(
    (await attribute(page, '[data-filter-kind="semantic"]', 'data-filter-active')) === 'false',
    'Semantic graph targets should become visually inactive',
  );
  const cytoscapeFilteredCount = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.elements('.filtered-out').length ?? 0;
  });
  assert(cytoscapeFilteredCount > 0, 'Semantic filter should mark Cytoscape graph elements inactive');

  await page.locator('[data-control="rearrange"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-layout-version')) === '1', 'Rearrange should advance layout version');
  assert((await attribute(page, '.second-brain-shell', 'data-layout-mode')) === 'rearranged', 'Rearrange should switch graph layout mode');

  await page.screenshot({ path: interactionScreenshot, fullPage: false });

  await page.locator('[data-control="reset"]').click();
  await page.locator('[data-control="memory-search"]').fill('calm');
  assert((await attribute(page, '.second-brain-shell', 'data-search-query')) === 'calm', 'Search input should expose normalized query');
  assert((await attribute(page, '[data-search-count]', 'data-search-count-value')) === '1', 'Search should narrow to one matching memory');
  assert((await page.locator('[data-control="select-memory"][data-search-match="false"]').count()) === 7, 'Search should dim unmatched memory nodes');
  const cytoscapeDimmedCount = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.nodes('.search-dimmed').length ?? 0;
  });
  assert(cytoscapeDimmedCount === 7, 'Search should dim unmatched Cytoscape memory nodes');

  await page.locator('[data-search-citation="mem_unrelated_calm_import"]').click();
  assert(
    (await attribute(page, '[data-inspector-panel="pmi015"]', 'data-selected-memory')) === 'mem_unrelated_calm_import',
    'Search result click should select the matching memory detail',
  );
  assert(
    (await attribute(page, '[data-inspector-citations]', 'data-inspector-selected-citation')) === 'mem_unrelated_calm_import',
    'Inspector citation chip should follow the selected memory detail',
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-search-selected-memory')) === 'mem_unrelated_calm_import',
    'Shell should expose search-selected memory',
  );
  assert(
    (await attribute(page, '[data-memory-timeline-panel="pmi025"]', 'data-timeline-active-memory')) === 'mem_unrelated_calm_import',
    'Search result click should update the active memory timeline panel',
  );
  assert(
    (await attribute(page, '[data-timeline-memory-id="mem_unrelated_calm_import"]', 'data-timeline-active')) === 'true',
    'Search result click should mark the matching timeline entry active',
  );
  const selectedCytoscapeMemoryId = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.nodes('.selected-memory').first().id();
  });
  assert(selectedCytoscapeMemoryId === 'memory:mem_unrelated_calm_import', 'Search result click should select the matching Cytoscape memory node');

  await page.screenshot({ path: searchScreenshot, fullPage: false });
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
        searchScreenshot,
        verified: [
          'cytoscape data graph ready',
          'data-derived graph stats',
          'saved artifact action',
          'saved artifact persistence manifest',
          'spacing click',
          'label toggle',
          'filter toggle',
          'node selection',
          'rearrange click',
          'memory search filter',
          'search result detail selection',
          'memory detail timeline selection',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
