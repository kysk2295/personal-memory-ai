import { mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium, type Page } from 'playwright';
import { selectEvidenceCleanupMemoryIds } from '../src/lib/evidenceCleanup';
import type { MemoryRecord } from '../src/lib/memoryRecord';

const outputDir = resolve('artifacts/web-second-brain-product-surface');
const benchmarkScreenshot = resolve(outputDir, 'benchmark-careerhacker-memory-playwright.png');
const localScreenshot = resolve(outputDir, 'local-graph-density-playwright.png');
const interactionScreenshot = resolve(outputDir, 'local-graph-interactions-playwright.png');
const searchScreenshot = resolve(outputDir, 'local-memory-search-detail-playwright.png');
const shouldCleanupEvidenceRecords = process.env.PMI_EVIDENCE_KEEP_RECORDS !== 'true';

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
  if (localUrl.startsWith('http')) {
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-graph-rehydrate-state') === 'ready',
      null,
      { timeout: 10_000 },
    );
    await page.waitForFunction(
      () => document.querySelector('[data-privacy-scope="private"]')?.getAttribute('data-local-durable-store') === 'enabled',
      null,
      { timeout: 10_000 },
    );
  }

  assert((await attribute(page, '.second-brain-shell', 'data-graph-renderer')) === 'cytoscape', 'Expected Cytoscape renderer to become active');
  const initialMemoryNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-memory-node-count'));
  const initialGraphNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-graph-node-count'));
  const initialGraphEdgeCount = Number(await attribute(page, '.second-brain-shell', 'data-graph-edge-count'));
  assert(initialMemoryNodeCount >= 8, 'Expected data-derived memory count marker');
  assert(initialGraphNodeCount >= 44, 'Expected data-derived graph node count marker');
  assert(initialGraphEdgeCount >= 56, 'Expected data-derived graph edge count marker');
  assert(Number(await attribute(page, '#memory-graph-cytoscape', 'data-cytoscape-node-count')) === initialGraphNodeCount, 'Expected Cytoscape node count to match graph payload');
  assert(Number(await attribute(page, '#memory-graph-cytoscape', 'data-cytoscape-edge-count')) === initialGraphEdgeCount, 'Expected Cytoscape edge count to match graph payload');
  assert((await page.locator('#memory-graph-cytoscape canvas').count()) > 0, 'Expected Cytoscape to render a canvas');
  assert((await page.locator('#saved-artifact-actions').count()) === 1, 'Expected saved artifact payload manifest');
  if (localUrl.startsWith('http')) {
    assert(
      (await attribute(page, '[data-privacy-scope="private"]', 'data-local-durable-store')) === 'enabled',
      'Expected live health to mark local durable store enabled',
    );
    assert(
      (await attribute(page, '[data-privacy-scope="private"]', 'data-memory-backend')) === 'local-file',
      'Expected live health to expose local-file backend without a path',
    );
  }
  const savedArtifactManifest = await page.locator('#saved-artifact-actions').textContent();
  assert(savedArtifactManifest?.includes('"endpoint":"/api/capture"'), 'Expected saved artifact manifest to target capture API');
  assert(savedArtifactManifest?.includes('"artifact":{"id":"artifact_'), 'Expected saved artifact manifest to include full artifact payloads');
  assert((await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-save-state')) === 'ready', 'Expected Ask saved artifact action to start ready');
  assert((await attribute(page, '[data-save-artifact-action="weekly_report"]', 'data-artifact-save-endpoint')) === '/api/capture', 'Expected saved artifact action to expose capture endpoint');
  assert((await attribute(page, '[data-feedback-panel="user-correction"]', 'data-feedback-state')) === 'ready', 'Expected feedback panel to start ready');
  assert((await attribute(page, '[data-feedback-panel="user-correction"]', 'data-feedback-endpoint')) === '/api/feedback', 'Expected feedback panel to target feedback API');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-upload-state')) === 'idle', 'Expected local import upload panel to start idle');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-preview-endpoint')) === '/api/import/preview', 'Expected local import upload panel to target import preview API');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-apply-endpoint')) === '/api/import/apply', 'Expected local import upload panel to target import apply API');
  assert(Number(await attribute(page, '[data-memory-timeline-panel="pmi025"]', 'data-timeline-entry-count')) >= 8, 'Expected timeline panel to render private memories');
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
  assert(graphStats?.memoryNodeCount === initialMemoryNodeCount, 'Expected browser graph stats to match memory node count marker');
  assert(graphStats?.graphNodeCount === initialGraphNodeCount, 'Expected browser graph stats to match graph node count marker');
  assert(graphStats?.edgeCount === initialGraphEdgeCount, 'Expected browser graph stats to match graph edge count marker');
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
  await page.waitForFunction(
    () => document.querySelector('[data-save-artifact-action="ask_answer"]')?.getAttribute('data-artifact-save-state') === 'saved',
    null,
    { timeout: 10_000 },
  );
  assert((await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-save-state')) === 'saved', 'Ask save action should mark artifact saved');
  assert((await attribute(page, '.second-brain-shell', 'data-last-saved-artifact')) === askArtifactId, 'Shell should expose the last saved artifact id');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'artifact-saved', 'Shell should expose artifact saved interaction state');

  await page.locator('[data-control="submit-feedback-correction"]').click();
  await page.waitForFunction(
    () => document.querySelector('[data-feedback-panel="user-correction"]')?.getAttribute('data-feedback-state') === 'submitted',
    null,
    { timeout: 10_000 },
  );
  assert((await attribute(page, '[data-feedback-panel="user-correction"]', 'data-feedback-state')) === 'submitted', 'Feedback panel should mark correction submitted');
  assert(
    (await attribute(page, '.second-brain-shell', 'data-last-feedback-memory-target')) === 'mem_freeze_vs_feature_addition',
    'Shell should expose the last feedback memory target',
  );
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'feedback-submitted', 'Shell should expose feedback submitted state');

  const importNonce = `playwright-${Date.now()}`;
  await page
    .locator('[data-control="local-import-paste-text"]')
    .fill(`Imported local memory ${importNonce} says I should cut scope before adding another visual feature.`);
  await page.locator('[data-control="preview-local-import"]').click();
  await page.waitForFunction(() => document.querySelector('[data-import-upload-panel="local-file"]')?.getAttribute('data-import-upload-state') === 'preview-ready');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-upload-candidate-count')) === '1', 'Local import preview should create one candidate');
  assert((await page.locator('[data-local-import-preview-id]').count()) >= 1, 'Local import preview should render candidate rows');
  await page.locator('[data-control="apply-local-import"]').click();
  await page.waitForFunction(() => document.querySelector('[data-import-upload-panel="local-file"]')?.getAttribute('data-import-upload-state') === 'applied');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'import-applied', 'Shell should expose local import apply state');
  assert((await attribute(page, '[data-import-applied-feedback="local-upload"]', 'data-import-applied-count')) === '1', 'Applied import feedback should expose created memory count');
  assert((await page.locator('[data-import-applied-memory-id]').count()) === 1, 'Applied import feedback should render created memory rows');
  assert((await page.locator('[data-imported-memory="true"]').count()) === 1, 'Applied import should append an imported timeline row');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-import-pending')) === 'true', 'Shell should mark graph import refresh pending after apply');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-rehydrate-state')) === 'ready', 'Shell should rehydrate app shell data after import apply');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-rebuild-state')) === 'rebuilt', 'Shell should rebuild Cytoscape after import rehydration');
  const rehydratedMemoryNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-rehydrated-memory-node-count'));
  assert(rehydratedMemoryNodeCount > 8, 'Rehydrated app shell should include newly imported private memories');
  const rebuiltGraphStats = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.stats;
  });
  assert(rebuiltGraphStats?.memoryNodeCount > 8, 'Rebuilt Cytoscape graph should include newly imported private memories');
  await page.locator('[data-control="undo-local-import"]').click();
  await page.waitForFunction(() => document.querySelector('[data-import-upload-panel="local-file"]')?.getAttribute('data-import-upload-state') === 'undone');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'import-undone', 'Shell should expose local import undo state');
  assert((await attribute(page, '.second-brain-shell', 'data-import-undone-count')) === '1', 'Import undo should remove the Playwright-created memory');
  assert((await attribute(page, '[data-import-applied-feedback="local-upload"]', 'data-import-applied-count')) === '0', 'Import undo should clear applied import feedback');

  await page.locator('[data-control="spacing"][data-spacing="wide"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-spacing')) === 'wide', 'Spacing control should switch graph spacing to wide');

  await page.locator('[data-control="toggle-labels"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-labels')) === 'hidden', 'Label toggle should hide graph labels');
  const cytoscapeHiddenLabelCount = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.nodes('.labels-hidden').length ?? 0;
  });
  const currentCytoscapeNodeCount = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.nodes().length ?? 0;
  });
  assert(cytoscapeHiddenLabelCount === currentCytoscapeNodeCount, 'Label toggle should hide Cytoscape node labels');

  const firstCitation = 'mem_launch_may_anxiety_scope_delay';
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
  assert((await attribute(page, '.second-brain-shell', 'data-layout-mode')) === 'constellation', 'Rearrange should switch graph layout mode');
  assert(
    (await attribute(page, '.second-brain-shell', 'data-layout-explainer')) ===
      'Constellation pins decision and thesis nodes around the selected memory.',
    'Rearrange should expose benchmark-style constellation layout copy',
  );

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
  const cytoscapeMemoryNodeCount = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.cy?.nodes('[kind = "memory"]').length ?? 0;
  });
  assert(cytoscapeDimmedCount === cytoscapeMemoryNodeCount - 1, 'Search should dim unmatched Cytoscape memory nodes');

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

  const reviewSummary = `Reviewed calm import ${Date.now()}`;
  await page.locator('[data-control="memory-edit-summary"]').fill(reviewSummary);
  await page.locator('[data-control="save-memory-edit"]').click();
  await page.waitForFunction(
    () => document.querySelector('[data-memory-review-panel="source-edit"]')?.getAttribute('data-memory-review-state') === 'saved',
    null,
    { timeout: 10_000 },
  );
  const reviewRevisionId = await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-memory-review-revision');
  assert(reviewRevisionId && reviewRevisionId.startsWith('memory_review_'), 'Memory edit should expose a review ledger revision id');
  assert(
    (await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-memory-review-ledger')) === 'recorded',
    'Memory edit should mark the review ledger recorded',
  );
  assert(
    Number(await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-memory-review-history-count')) > 0,
    'Memory edit should increase visible review history count',
  );
  assert(
    (await page.locator('[data-memory-review-comparison][data-review-comparison-active="true"]').count()) >= 1,
    'Memory edit should append and activate a review comparison card',
  );
  assert(
    (await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-memory-review-mode')) === 'history',
    'Memory edit should reveal the review history mode after saving',
  );
  await page.locator('[data-control="select-review-comparison"]').first().click();
  assert(
    (await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-active-review-comparison')) === reviewRevisionId,
    'Review comparison click should expose the active revision id',
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'memory-review-comparison-selected',
    'Review comparison click should expose comparison selection interaction state',
  );

  await page.locator('[data-control="memory-review-mode"][data-review-mode-target="provenance"]').click();
  assert(
    (await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-memory-review-mode')) === 'provenance',
    'Source review drawer should switch into provenance mode',
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'memory-review-mode-provenance',
    'Source review drawer should expose provenance mode interaction state',
  );

  await page.locator('[data-control="export-memory-provenance"]').click();
  await page.waitForFunction(
    () => document.querySelector('[data-memory-review-panel="source-edit"]')?.getAttribute('data-memory-provenance-export-state') === 'ready',
    null,
    { timeout: 10_000 },
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-last-provenance-export-memory')) === 'mem_unrelated_calm_import',
    'Provenance export should expose the selected memory id',
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'memory-provenance-exported',
    'Provenance export should expose export interaction state',
  );

  const downloadPromise = page.waitForEvent('download', { timeout: 10_000 });
  await page.locator('[data-control="download-memory-provenance"]').click();
  const download = await downloadPromise;
  assert(
    (await attribute(page, '[data-memory-review-panel="source-edit"]', 'data-memory-provenance-download-state')) === 'ready',
    'Provenance download should mark the download state ready',
  );
  assert(download.suggestedFilename().startsWith('memory-provenance-mem_unrelated_calm_import-'), 'Provenance download should use selected-memory filename');
  assert(
    (await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'memory-provenance-downloaded',
    'Provenance download should expose download interaction state',
  );

  await page.screenshot({ path: searchScreenshot, fullPage: false });
}

async function cleanupEvidenceRecords(): Promise<number> {
  const localUrl = process.env.PMI_LOCAL_URL;
  if (!shouldCleanupEvidenceRecords || !localUrl?.startsWith('http')) return 0;
  const exported = await fetch(`${localUrl}/api/export`);
  if (!exported.ok) throw new Error('evidence cleanup export failed with ' + exported.status);
  const body = (await exported.json()) as { records?: MemoryRecord[] };
  const memoryIds = selectEvidenceCleanupMemoryIds(body.records ?? []);
  if (!memoryIds.length) return 0;
  const deleted = await fetch(`${localUrl}/api/delete`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ memoryIds }),
  });
  if (!deleted.ok) throw new Error('evidence cleanup delete failed with ' + deleted.status);
  const deletedBody = (await deleted.json()) as { deletedCount?: number };
  return deletedBody.deletedCount ?? 0;
}

await mkdir(outputDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const benchmarkPage = await context.newPage();
  await captureBenchmark(benchmarkPage);

  const localPage = await context.newPage();
  await verifyLocalInteractions(localPage);
  const evidenceCleanupDeletedCount = await cleanupEvidenceRecords();

  console.log(
    JSON.stringify(
      {
        benchmarkScreenshot,
        localScreenshot,
        interactionScreenshot,
        searchScreenshot,
        evidenceCleanupDeletedCount,
        verified: [
          'cytoscape data graph ready',
          'data-derived graph stats',
          'saved artifact action',
          'saved artifact persistence manifest',
          'feedback correction action',
          'local import upload preview',
          'local import upload apply',
          'applied import graph feedback',
          'applied import timeline append',
          'app shell rehydration after import',
          'cytoscape graph rebuild after import',
          'local import undo cleanup',
          'spacing click',
          'label toggle',
          'filter toggle',
          'node selection',
          'rearrange click',
          'memory search filter',
          'search result detail selection',
          'memory detail timeline selection',
          'memory review edit ledger',
          'memory review comparison selection',
          'memory review drawer mode switch',
          'memory provenance export action',
          'memory provenance download action',
          'evidence cleanup',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
