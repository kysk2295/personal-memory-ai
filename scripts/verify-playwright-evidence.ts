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
const captureScreenshot = resolve(outputDir, 'local-app-capture-playwright.png');
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
    graph.cy.center(node);
    const position = node.renderedPosition();
    return { x: position.x, y: position.y };
  }, nodeId);
  assert(renderedPosition, `Expected Cytoscape node ${nodeId} to exist`);

  const graphBox = await page.locator('#memory-graph-cytoscape').boundingBox();
  assert(graphBox, 'Expected Cytoscape graph mount to have a bounding box');
  await page.mouse.click(graphBox.x + renderedPosition.x, graphBox.y + renderedPosition.y);
  await page.evaluate((targetNodeId) => {
    const graph = (window as any).__personalMemoryGraph;
    const node = graph?.cy?.getElementById(targetNodeId);
    if (node && !node.empty()) node.emit('tap');
  }, nodeId);
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
  assert(
    (await attribute(page, '.second-brain-shell', 'data-prototype-ux')) === 'korean-usable-mvp',
    'Expected Korean usable MVP prototype marker',
  );
  assert((await page.locator('[data-prototype-flow="tonight-usable"]').count()) === 1, 'Expected visible tonight-usable product flow');
  assert((await page.locator('[data-guided-service-flow="diary-memory-ai"]').count()) === 1, 'Expected guided Korean service flow rail');
  assert(
    (await attribute(page, '[data-guided-service-flow="diary-memory-ai"]', 'data-guided-flow-current-step')) === 'capture',
    'Guided service flow should start at capture',
  );
  for (const step of ['capture', 'graph', 'related', 'ai', 'save']) {
    assert((await page.locator(`[data-guided-flow-step="${step}"]`).count()) === 1, `Missing guided service flow step ${step}`);
  }
  for (const action of ['start-capture', 'focus-graph', 'run-session', 'save-result']) {
    assert((await page.locator(`[data-guided-flow-action="${action}"]`).count()) === 1, `Missing guided service flow action ${action}`);
  }
  for (const step of ['quick-diary', 'diary-import', 'second-brain', 'related-memories', 'ai-session', 'saveback']) {
    assert((await page.locator(`[data-primary-flow-step="${step}"]`).count()) === 1, `Missing primary product flow step ${step}`);
  }
  assert(
    (await attribute(page, '[data-llm-wiki-visible="true"]', 'data-llm-wiki-visible')) === 'true',
    'Expected visible LLM Wiki memory structure panel',
  );
  assert((await page.locator('text=AI 세션 실행').count()) > 0, 'Expected Korean AI session action');
  assert((await page.locator('text=세션 저장').count()) > 0, 'Expected Korean save session action');
  assert((await attribute(page, '.product-value-strip', 'data-command-shelf')) === 'graph-led', 'First-screen command shelf should stay graph-led');
  assert(
    (await attribute(page, '.product-value-strip', 'data-benchmark-alignment')) === 'careerhacker-memory-graph-first',
    'First-screen command shelf should declare the benchmark graph-first alignment',
  );
  assert(
    (await attribute(page, '.product-value-strip', 'data-first-screen-density')) === 'compact-command-shelf',
    'First-screen command shelf should use compact density',
  );
  assert((await page.locator('text=Run Memory Session').count()) === 0, 'Old English memory-session CTA should not be visible');
  assert((await page.locator('text=Save session').count()) === 0, 'Old English memory-session save CTA should not be visible');
  assert(
    (await page.locator('text=불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다.').count()) > 0,
    'Expected Korean diary-like default memory summary',
  );
  assert(
    (await page.locator('text=차분하게 Markdown 일기를 가져와 기억 변환을 확인했다.').count()) > 0,
    'Expected Korean diary import default memory summary',
  );
  assert((await page.locator('text=Anxiety before the memory import demo').count()) === 0, 'English demo memory summary should not be visible');
  assert(
    (await page.locator('text=Should I add more Decision Replay polish before review?').count()) === 0,
    'English default Decision Replay prompt should not be visible',
  );
  assert((await page.locator('[data-entry-dock="diary-start"]').count()) === 1, 'Expected first-screen diary entry dock');
  assert((await page.locator('[data-primary-entry-action="quick-diary"]').count()) === 1, 'Expected first-screen quick diary action');
  assert((await attribute(page, '[data-primary-entry-action="quick-diary"]', 'href'))?.endsWith('/capture/'), 'Quick diary action should open the capture app');
  assert((await page.locator('[data-memory-intake-hub="app-web-diary"]').count()) === 1, 'Expected first-screen diary intake hub');
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-source-scope')) === 'diary-only', 'Diary intake hub should stay diary scoped');
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-result')) === 'graph-handoff', 'Diary intake hub should advertise graph handoff');
  assert((await attribute(page, '[data-intake-action="quick-capture"]', 'href'))?.endsWith('/capture/'), 'Intake quick capture should open capture app');
  assert((await page.locator('[data-control="intake-diary-draft"]').count()) === 1, 'Expected first-screen web diary draft textarea');
  assert((await page.locator('[data-control="intake-preview-diary"]').count()) === 1, 'Expected first-screen web diary preview action');
  assert((await page.locator('[data-control="intake-apply-diary"]').count()) === 1, 'Expected first-screen web diary apply action');
  assert((await page.locator('[data-control="intake-find-notion-source"]').count()) === 1, 'Expected first-screen Notion source discovery action');
  assert((await page.locator('text=습관리스트 소스 찾기').count()) > 0, 'Expected Korean Notion source discovery copy');
  for (const action of ['quick-capture', 'paste-diary', 'notion-diary-db']) {
    assert((await page.locator(`[data-intake-action="${action}"]`).count()) === 1, `Expected intake action ${action}`);
  }
  assert((await page.locator('[data-control="focus-local-import"]').count()) === 1, 'Expected first-screen diary import focus action');
  assert((await page.locator('[data-first-run-guide="diary-memory-ai"]').count()) === 1, 'Expected first-run diary memory AI guide');
  assert((await attribute(page, '[data-first-run-guide="diary-memory-ai"]', 'data-first-run-stage')) === 'entry-to-session', 'Expected first-run guide to start at entry-to-session');
  for (const action of ['write-diary', 'import-diary', 'select-memory', 'run-ai-session', 'save-session']) {
    assert((await page.locator(`[data-guide-action="${action}"]`).count()) === 1, `Expected first-run guide action ${action}`);
  }
  assert((await page.locator('text=지금 일기 쓰기').count()) > 0, 'Expected first-run write diary action copy');
  assert(Number(await attribute(page, '[data-first-run-guide="diary-memory-ai"]', 'data-flow-related-memory-count')) > 0, 'Expected first-run guide to expose related memory count');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-upload-state')) === 'idle', 'Expected local import upload panel to start idle');
  const inspectorRailOverlap = await page.evaluate(() => {
    const inspector = document.querySelector('.memory-inspector')?.getBoundingClientRect();
    const rail = document.querySelector('.product-rail')?.getBoundingClientRect();
    if (!inspector || !rail) return true;
    return !(inspector.right <= rail.left || rail.right <= inspector.left || inspector.bottom <= rail.top || rail.bottom <= inspector.top);
  });
  assert(!inspectorRailOverlap, 'Selected memory inspector should not overlap the AI session/evidence rail');
  await page.locator('[data-guide-action="import-diary"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-first-run-last-action')) === 'import-diary', 'First-run import action should update shell state');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'diary-import-focused', 'First-run import action should focus diary import');
  await page.locator('[data-control="focus-local-import"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'diary-import-focused', 'First-screen import action should focus diary import');
  await page.locator('[data-intake-action="paste-diary"]').click();
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-last-action')) === 'paste-diary', 'Intake paste action should update hub state');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'intake-paste-diary-focused', 'Intake paste action should focus the diary paste import');
  assert(
    (await attribute(page, '[data-guided-service-flow="diary-memory-ai"]', 'data-guided-flow-current-step')) === 'capture',
    'Guided service flow should stay on capture while diary paste is focused',
  );
  await page.locator('[data-intake-action="notion-diary-db"]').click();
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-last-action')) === 'notion-diary-db', 'Intake Notion action should update hub state');
  assert((await attribute(page, '[data-notion-import-panel="database"]', 'data-notion-source-scope')) === 'diary-only', 'Notion intake should remain diary scoped');
  assert((await page.locator('[data-control="notion-database-id"]').inputValue()) === '습관리스트', 'Notion diary intake should prefill the 습관리스트 database cue');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'intake-notion-diary-ready', 'Intake Notion action should prepare diary database import');
  await page.locator('[data-control="intake-find-notion-source"]').click();
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-last-action')) === 'find-notion-source', 'First-screen Notion source search should mark the intake action');
  await page.waitForFunction(() => {
    const state = document.querySelector('[data-notion-import-panel="database"]')?.getAttribute('data-notion-sources-state');
    return state === 'token-required' || state === 'source-required' || state === 'rate-limited' || state === 'ready' || state === 'error';
  });
  const notionSourcesState = await attribute(page, '[data-notion-import-panel="database"]', 'data-notion-sources-state');
  const notionSourceIntakeResult = await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-result');
  if (notionSourcesState === 'ready') {
    const selectedNotionSource = await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-selected-notion-source');
    const selectedNotionSourceMode = await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-selected-notion-source-mode');
    assert(notionSourceIntakeResult === 'notion-source-selected', 'Ready Notion sources should auto-select the diary/habit source');
    assert(Boolean(selectedNotionSource), 'Ready Notion sources should set a selected Notion source id');
    assert(selectedNotionSourceMode === 'auto', 'First-screen Notion source discovery should auto-select diary/habit candidates');
    assert(
      (await page.locator('[data-control="notion-database-id"]').inputValue()) === selectedNotionSource,
      'The selected Notion diary source should be copied into the import database field',
    );
  } else {
    assert(
      ['notion-token-required', 'notion-source-required', 'notion-rate-limited', 'notion-sources-ready'].includes(notionSourceIntakeResult),
      'First-screen Notion source search should expose a concrete Notion source gate state',
    );
  }
  assert(
    (await page.locator('text=Notion 연결이 필요하다').count()) +
      (await page.locator('text=습관리스트 소스를 먼저 선택해야 한다').count()) +
      (await page.locator('text=Notion이 잠시 제한 중이다').count()) +
      (await page.locator('text=소스를 자동으로 선택했다').count()) +
      (await page.locator('text=습관리스트 소스 후보를 찾았다').count()) >=
      1,
    'Intake result should explain the Notion source search gate in Korean',
  );
  await page.locator('[data-control="intake-apply-notion-diary"]').click();
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-last-action')) === 'apply-notion-diary', 'First-screen Notion apply should mark the intake action');
  await page.waitForFunction(() => {
    const state = document.querySelector('[data-notion-import-panel="database"]')?.getAttribute('data-notion-import-state');
    return state === 'token-required' || state === 'source-required' || state === 'rate-limited' || state === 'preview-ready';
  });
  const notionIntakeResult = await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-result');
  assert(
    ['notion-token-required', 'notion-source-required', 'notion-rate-limited', 'notion-preview-ready'].includes(notionIntakeResult),
    'First-screen Notion apply should expose a concrete Notion intake state',
  );
  assert(
    (await page.locator('text=Notion 연결이 필요하다').count()) +
      (await page.locator('text=습관리스트 소스를 먼저 선택해야 한다').count()) +
      (await page.locator('text=Notion이 잠시 제한 중이다').count()) +
      (await page.locator('text=습관리스트 미리보기가 준비됐다').count()) >=
      1,
    'Intake result should explain the Notion gate or preview state in Korean',
  );
  const intakeDraft = `오늘 회의에서 또 혼자 해결하려는 마음이 올라왔다 ${Date.now()}`;
  await page.locator('[data-control="intake-diary-draft"]').fill(intakeDraft);
  await page.locator('[data-control="intake-apply-diary"]').click();
  await page.waitForFunction(() => document.querySelector('[data-import-upload-panel="local-file"]')?.getAttribute('data-import-upload-state') === 'applied');
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-last-action')) === 'apply-diary', 'Intake draft apply should update hub action state');
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-draft-state')) === 'applied', 'Intake draft apply should create and apply a graph-ready import');
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-result')) === 'graph-applied', 'Intake draft apply should mark the first-screen handoff as graph-applied');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'import-applied', 'Intake draft apply should reuse the import apply pipeline');
  assert((await page.locator('[data-control="local-import-paste-text"]').inputValue()) === intakeDraft, 'Intake draft should sync into the private import paste field');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-upload-candidate-count')) === '1', 'Intake draft apply should create one import candidate');
  assert((await page.locator('[data-import-applied-memory-id]').count()) >= 1, 'Intake draft apply should surface at least one applied memory id');
  const intakeAppliedMemoryId = await page.locator('[data-import-applied-memory-id]').first().getAttribute('data-import-applied-memory-id');
  assert(Boolean(intakeAppliedMemoryId), 'Intake draft apply should expose the applied memory id');
  assert(
    (await attribute(page, '[data-intake-session-result="applied-memory"]', 'data-intake-applied-memory')) === intakeAppliedMemoryId,
    'Intake result panel should expose the applied diary memory id',
  );
  assert(
    Number(await attribute(page, '[data-intake-session-result="applied-memory"]', 'data-intake-related-memory-count')) > 0,
    'Intake result panel should expose related-memory count',
  );
  assert(
    (await attribute(page, '[data-intake-session-result="applied-memory"]', 'data-intake-next-step')) === 'memory-session-ready',
    'Intake result panel should offer the guided AI session as the next step',
  );
  assert(
    (await attribute(page, '[data-intake-flow-step="capture"]', 'data-intake-flow-state')) === 'done',
    'Intake flow tracker should mark capture done after diary apply',
  );
  assert(
    (await attribute(page, '[data-intake-flow-step="graph"]', 'data-intake-flow-state')) === 'done',
    'Intake flow tracker should mark graph connection done after diary apply',
  );
  assert(
    (await attribute(page, '[data-intake-flow-step="related"]', 'data-intake-flow-state')) === 'ready',
    'Intake flow tracker should mark related memories ready after diary apply',
  );
  assert(
    (await attribute(page, '[data-intake-flow-step="ai"]', 'data-intake-flow-state')) === 'ready',
    'Intake flow tracker should mark AI actions ready after diary apply',
  );
  assert(
    Number(await attribute(page, '[data-intake-related-bundle="past-memory-nodes"]', 'data-intake-related-bundle-count')) > 0,
    'Intake result panel should surface related past-memory nodes after diary apply',
  );
  assert(
    (await page.locator('[data-intake-related-memory-id]').count()) > 0,
    'Intake related bundle should render clickable related-memory chips',
  );
  assert(!(await page.locator('[data-control="intake-run-ask"]').isDisabled()), 'Intake related Ask action should be enabled');
  assert(!(await page.locator('[data-control="intake-run-decision-replay"]').isDisabled()), 'Intake related Decision Replay action should be enabled');
  assert(!(await page.locator('[data-control="intake-run-weekly-report"]').isDisabled()), 'Intake related Weekly action should be enabled');
  const initialMemoryNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-memory-node-count'));
  const initialRenderedMemoryNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-rendered-memory-node-count'));
  const initialGraphNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-graph-node-count'));
  const initialGraphEdgeCount = Number(await attribute(page, '.second-brain-shell', 'data-graph-edge-count'));
  assert(initialMemoryNodeCount >= 8, 'Expected data-derived memory count marker');
  assert(initialRenderedMemoryNodeCount >= 8, 'Expected rendered memory count marker');
  assert(initialRenderedMemoryNodeCount <= initialMemoryNodeCount, 'Rendered memory count should not exceed total memory count');
  assert(initialGraphNodeCount >= 44, 'Expected data-derived graph node count marker');
  assert(initialGraphEdgeCount >= 56, 'Expected data-derived graph edge count marker');
  assert(
    Number(await attribute(page, '#memory-graph-cytoscape', 'data-rendered-memory-node-count')) === initialRenderedMemoryNodeCount,
    'Expected Cytoscape mount rendered memory count to match shell marker',
  );
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
    const searchApiProbe = await page.evaluate(async () => {
      const response = await fetch('/api/memory/search', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ query: 'notion', limit: 3 }),
      });
      const body = await response.json();
      return {
        ok: response.ok,
        totalMatchCount: body.totalMatchCount,
        records: body.records?.length ?? 0,
        maxRawTextLength: Math.max(0, ...(body.records || []).map((record: { rawText?: string }) => record.rawText?.length || 0)),
      };
    });
    assert(searchApiProbe.ok, 'Expected remote memory search API to respond');
    assert(searchApiProbe.totalMatchCount >= searchApiProbe.records, 'Expected remote memory search total count to cover returned records');
    assert(searchApiProbe.records <= 3, 'Expected remote memory search API to respect the requested limit');
    assert(searchApiProbe.maxRawTextLength <= 240, 'Expected remote memory search API to return lightweight raw text');
  }
  const savedArtifactManifest = await page.locator('#saved-artifact-actions').textContent();
  assert(savedArtifactManifest?.includes('"endpoint":"/api/capture"'), 'Expected saved artifact manifest to target capture API');
  assert(savedArtifactManifest?.includes('"artifact":{"id":"artifact_'), 'Expected saved artifact manifest to include full artifact payloads');
  assert((await attribute(page, '[data-save-artifact-action="ask_answer"]', 'data-artifact-save-state')) === 'ready', 'Expected Ask saved artifact action to start ready');
  assert((await attribute(page, '[data-save-artifact-action="weekly_report"]', 'data-artifact-save-endpoint')) === '/api/capture', 'Expected saved artifact action to expose capture endpoint');
  assert((await attribute(page, '[data-feedback-panel="user-correction"]', 'data-feedback-state')) === 'ready', 'Expected feedback panel to start ready');
  assert((await attribute(page, '[data-feedback-panel="user-correction"]', 'data-feedback-endpoint')) === '/api/feedback', 'Expected feedback panel to target feedback API');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-upload-state')) === 'applied', 'Expected intake draft apply to finish the local import upload pipeline');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-preview-endpoint')) === '/api/import/preview', 'Expected local import upload panel to target import preview API');
  assert((await attribute(page, '[data-import-upload-panel="local-file"]', 'data-import-apply-endpoint')) === '/api/import/apply', 'Expected local import upload panel to target import apply API');
  assert(Number(await attribute(page, '[data-memory-timeline-panel="pmi025"]', 'data-timeline-entry-count')) >= 8, 'Expected timeline panel to render private memories');
  assert(
    (await page.locator('[data-timeline-memory-id^="mem_api_artifact_"]').count()) === 3,
    'Expected saved artifacts to render as timeline memories',
  );
  assert(
    (await attribute(page, `[data-timeline-memory-id="${intakeAppliedMemoryId}"]`, 'data-timeline-active')) === 'true',
    'Expected applied intake memory to be active in the timeline',
  );
  assert((await page.locator('[data-diary-inbox="app-web-diary-sources"]').count()) === 1, 'Expected diary inbox to render app/web diary sources');
  assert(
    Number(await attribute(page, '[data-diary-inbox="app-web-diary-sources"]', 'data-diary-inbox-count')) >= 2,
    'Diary inbox should expose captured/imported diary entries',
  );
  await page.locator('[data-diary-inbox-memory-id="mem_captured_ship_note"]').click();
  assert(
    (await attribute(page, '[data-diary-inbox="app-web-diary-sources"]', 'data-diary-inbox-active-memory')) === 'mem_captured_ship_note',
    'Diary inbox click should select captured diary memory',
  );
  assert(
    (await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'diary-inbox-memory-selected',
    'Diary inbox click should expose handoff interaction state',
  );
  assert(
    (await attribute(page, '[data-command-rail="selected-memory-actions"]', 'data-command-rail-source')) === 'mem_captured_ship_note',
    'Diary inbox click should update selected command rail',
  );

  const graphStats = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.stats;
  });
  assert(graphStats?.memoryNodeCount === initialMemoryNodeCount, 'Expected browser graph stats to match memory node count marker');
  assert(graphStats?.renderedMemoryNodeCount === initialRenderedMemoryNodeCount, 'Expected browser graph stats to match rendered memory node count marker');
  assert(graphStats?.graphNodeCount === initialGraphNodeCount, 'Expected browser graph stats to match graph node count marker');
  assert(graphStats?.edgeCount === initialGraphEdgeCount, 'Expected browser graph stats to match graph edge count marker');

  if (localUrl.startsWith('http')) {
    await page.locator('[data-control="ask-second-brain"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-ask-state') === 'answered',
      null,
      { timeout: 10_000 },
    );
    const askCitationCount = Number(await attribute(page, '.second-brain-shell', 'data-ask-citation-count'));
    assert(Number.isFinite(askCitationCount), 'Expected live Ask response to expose a citation count marker');
    assert(
      Number(await attribute(page, '.second-brain-shell', 'data-live-ask-highlighted-memory-count')) === askCitationCount,
      'Live Ask should highlight the same number of cited graph memories',
    );
    const highlightedAskCitationCount = await page.evaluate(() => {
      const graph = (window as any).__personalMemoryGraph;
      return graph?.cy?.nodes('.ask-citation-memory').length ?? 0;
    });
    assert(highlightedAskCitationCount === askCitationCount, 'Cytoscape graph should mark Ask citation memory nodes');
    assert((await attribute(page, '.second-brain-shell', 'data-ask-evidence-label')).length > 0, 'Expected live Ask response to expose an evidence label');
    assert((await attribute(page, '.second-brain-shell', 'data-ask-conversation-mode')) === 'single_turn', 'Expected first live Ask response to start a single-turn context');
    await page.locator('#ask-memory-bar-question').fill('그럼 오늘 뭘 먼저 해야 해?');
    await page.locator('[data-control="ask-second-brain"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-ask-conversation-mode') === 'follow_up',
      null,
      { timeout: 10_000 },
    );
    assert((await attribute(page, '.second-brain-shell', 'data-ask-conversation-mode')) === 'follow_up', 'Expected second live Ask response to use follow-up context');
    assert(Number(await attribute(page, '.second-brain-shell', 'data-ask-citation-count')) >= askCitationCount, 'Expected follow-up Ask to preserve citation context');

    await page.locator('[data-control="decision-replay-current"]').fill('MVP를 오늘 배포할지 그래프를 더 다듬을지 결정해야 해');
    await page.locator('[data-control="run-decision-replay"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-replay-state') === 'answered',
      null,
      { timeout: 10_000 },
    );
    const replayCitationCount = Number(await attribute(page, '.second-brain-shell', 'data-replay-citation-count'));
    assert(Number.isFinite(replayCitationCount), 'Expected live Decision Replay to expose a citation count marker');
    assert(
      Number(await attribute(page, '.second-brain-shell', 'data-live-replay-highlighted-memory-count')) === replayCitationCount,
      'Live Decision Replay should highlight the same number of cited graph memories',
    );
    const highlightedReplayCitationCount = await page.evaluate(() => {
      const graph = (window as any).__personalMemoryGraph;
      return graph?.cy?.nodes('.replay-citation-memory').length ?? 0;
    });
    assert(highlightedReplayCitationCount === replayCitationCount, 'Cytoscape graph should mark Decision Replay citation memory nodes');

    await page.locator('[data-control="refresh-weekly-report"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-weekly-report-state') === 'ready',
      null,
      { timeout: 10_000 },
    );
    const weeklyCitationCount = Number(await attribute(page, '.second-brain-shell', 'data-weekly-report-citation-count'));
    assert(Number.isFinite(weeklyCitationCount), 'Expected live Weekly Report to expose a citation count marker');
    assert(
      Number(await attribute(page, '.second-brain-shell', 'data-live-weekly-highlighted-memory-count')) === weeklyCitationCount,
      'Live Weekly Report should highlight the same number of cited graph memories',
    );
    const highlightedWeeklyCitationCount = await page.evaluate(() => {
      const graph = (window as any).__personalMemoryGraph;
      return graph?.cy?.nodes('.weekly-citation-memory').length ?? 0;
    });
    assert(highlightedWeeklyCitationCount === weeklyCitationCount, 'Cytoscape graph should mark Weekly Report citation memory nodes');
  }
  await page.locator('[data-control="intake-run-ask"]').click();
  await page.waitForFunction(() => document.querySelector('[data-intake-related-bundle="past-memory-nodes"]')?.getAttribute('data-intake-ai-action-result') === 'ask-answered');
  assert((await attribute(page, '.second-brain-shell', 'data-ask-state')) === 'answered', 'Intake Ask action should run the grounded Ask flow');
  await page.locator('[data-control="intake-run-decision-replay"]').click();
  await page.waitForFunction(() => document.querySelector('[data-intake-related-bundle="past-memory-nodes"]')?.getAttribute('data-intake-ai-action-result') === 'replay-answered');
  assert((await attribute(page, '.second-brain-shell', 'data-replay-state')) === 'answered', 'Intake Decision Replay action should run the grounded replay flow');
  await page.locator('[data-control="intake-run-weekly-report"]').click();
  await page.waitForFunction(() => document.querySelector('[data-intake-related-bundle="past-memory-nodes"]')?.getAttribute('data-intake-ai-action-result') === 'weekly-answered');
  assert((await attribute(page, '.second-brain-shell', 'data-weekly-report-state')) === 'ready', 'Intake Weekly action should run the grounded weekly report flow');
  assert((await attribute(page, '[data-intake-flow-step="ai"]', 'data-intake-flow-state')) === 'done', 'Intake flow tracker should mark AI action done after a grounded answer');
  await page.locator('[data-control="intake-save-ai-result"]').click();
  await page.waitForFunction(() => document.querySelector('[data-intake-related-bundle="past-memory-nodes"]')?.getAttribute('data-intake-ai-save-state') === 'saved');
  assert((await attribute(page, '[data-control="intake-save-ai-result"]', 'data-intake-ai-save-state')) === 'saved', 'Intake AI saveback should mark the latest result saved');
  assert((await attribute(page, '[data-save-artifact-action="weekly_report"]', 'data-artifact-save-state')) === 'saved', 'Intake AI saveback should reuse the weekly saved artifact action');
  assert((await attribute(page, '[data-intake-flow-step="save"]', 'data-intake-flow-state')) === 'done', 'Intake flow tracker should mark saveback done after saving the AI result');
  assert((await attribute(page, '[data-flow-coach="diary-to-memory-ai"]', 'data-flow-coach-stage')) === 'saved', 'Flow coach should make the saved future-memory step visible');
  assert(
    (await attribute(page, '[data-flow-coach="diary-to-memory-ai"]', 'data-flow-coach-next-action')) === 'reopen-saved-memory',
    'Flow coach should expose the next reentry action after saveback',
  );
  await page.locator('[data-control="intake-run-session"]').click();
  await page.waitForFunction(
    () => document.querySelector('.second-brain-shell')?.getAttribute('data-memory-session-state') === 'completed',
    null,
    { timeout: 20_000 },
  );
  assert(
    (await attribute(page, '[data-memory-session-panel]', 'data-session-source-memory')) === intakeAppliedMemoryId,
    'Intake result session button should run the guided session from the applied diary memory',
  );
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
  const importedTimelineRowsBeforeLocalImport = await page.locator('[data-imported-memory="true"]').count();
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
  assert(
    (await page.locator('[data-imported-memory="true"]').count()) === importedTimelineRowsBeforeLocalImport + 1,
    'Applied import should append one imported timeline row',
  );
  assert((await attribute(page, '.second-brain-shell', 'data-graph-import-pending')) === 'true', 'Shell should mark graph import refresh pending after apply');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-rehydrate-state')) === 'ready', 'Shell should rehydrate app shell data after import apply');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-rebuild-state')) === 'rebuilt', 'Shell should rebuild Cytoscape after import rehydration');
  const rehydratedMemoryNodeCount = Number(await attribute(page, '.second-brain-shell', 'data-rehydrated-memory-node-count'));
  assert(rehydratedMemoryNodeCount > 8, 'Rehydrated app shell should include newly imported private memories');
  const importedMemoryId = (await attribute(page, '.second-brain-shell', 'data-import-session-source-memory')) || '';
  assert(importedMemoryId, 'Import handoff should expose the imported memory session source');
  assert((await attribute(page, '.second-brain-shell', 'data-active-memory')) === importedMemoryId, 'Import handoff should select the imported memory');
  assert(
    Number(await attribute(page, '.second-brain-shell', 'data-import-session-related-memory-count')) > 0,
    'Import handoff should expose related memories for the imported memory',
  );
  assert((await attribute(page, '.second-brain-shell', 'data-import-session-state')) === 'ready', 'Import handoff should prepare a memory session');
  const rebuiltGraphStats = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return graph?.stats;
  });
  assert(rebuiltGraphStats?.memoryNodeCount > 8, 'Rebuilt Cytoscape graph should include newly imported private memories');
  await page.locator('[data-control="run-memory-session"]').click();
  await page.waitForFunction(
    () => document.querySelector('.second-brain-shell')?.getAttribute('data-memory-session-state') === 'completed',
    null,
    { timeout: 20_000 },
  );
  assert(
    (await attribute(page, '[data-memory-session-panel]', 'data-session-source-memory')) === importedMemoryId,
    'Imported memory handoff should run the guided session from the imported memory',
  );
  await page.locator('[data-control="save-memory-session"]').click();
  await page.waitForFunction(
    () => document.querySelector('[data-control="save-memory-session"]')?.getAttribute('data-artifact-save-state') === 'saved',
    null,
    { timeout: 10_000 },
  );
  assert(
    ((await attribute(page, '.second-brain-shell', 'data-last-saved-session-memory')) || '').startsWith('mem_api_artifact_memory_session_'),
    'Saved memory session should become a private MemoryRecord',
  );
  const savedSessionMemoryId = await attribute(page, '.second-brain-shell', 'data-last-saved-session-memory');
  assert((await attribute(page, '.second-brain-shell', 'data-memory-session-save-state')) === 'saved', 'Shell should expose memory session save state');
  assert((await page.locator('text=Session saved').count()) === 0, 'Saved session CTA should remain Korean');
  assert((await page.locator('text=세션 저장 완료').count()) === 1, 'Saved session CTA should use Korean copy');
  assert(
    (await attribute(page, '[data-intake-session-result="applied-memory"]', 'data-intake-saved-session-memory')) === savedSessionMemoryId,
    'Intake result panel should expose the saved session memory id',
  );
  assert((await attribute(page, '[data-memory-intake-hub="app-web-diary"]', 'data-intake-result')) === 'session-saved', 'Intake hub should mark the flow saved back as memory');
  assert((await attribute(page, '[data-intake-session-result="applied-memory"]', 'data-intake-next-step')) === 'session-saved', 'Intake result should mark session saveback complete');
  assert((await attribute(page, '[data-flow-coach="diary-to-memory-ai"]', 'data-flow-coach-stage')) === 'saved', 'Flow coach should stay saved after guided session saveback');
  assert((await attribute(page, '.second-brain-shell', 'data-graph-rehydrate-state')) === 'ready', 'Saving memory session should rehydrate graph state');
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
  assert(
    (await attribute(page, '[data-guided-service-flow="diary-memory-ai"]', 'data-guided-flow-current-step')) === 'related',
    'Guided service flow should move to related after selecting a cited memory',
  );
  const relatedMemoryCount = Number(await attribute(page, '[data-related-memory-strip="selected-node"]', 'data-related-memory-count'));
  assert(relatedMemoryCount > 0, 'Selected memory should expose related past memory nodes');
  assert((await attribute(page, '.second-brain-shell', 'data-related-memory-source')) === firstCitation, 'Shell should expose selected related-memory source');
  assert((await page.locator('[data-related-memory-id]').count()) > 0, 'Related memory strip should render clickable related memory chips');
  assert(
    (await attribute(page, '[data-selected-memory-path="graph-related-session"]', 'data-selected-memory-source')) === firstCitation,
    'Selected memory path panel should follow graph selection',
  );
  assert(
    Number(await attribute(page, '[data-selected-memory-path="graph-related-session"]', 'data-selected-memory-related-count')) > 0,
    'Selected memory path panel should expose related memory count',
  );
  assert((await page.locator('[data-selected-path-related-memory-id]').count()) > 0, 'Selected memory path panel should render related memory reason chips');
  assert((await page.locator('[data-selected-path-action="ask"]').count()) === 1, 'Selected memory path panel should expose ask action');
  assert((await page.locator('[data-selected-path-action="replay"]').count()) === 1, 'Selected memory path panel should expose replay action');
  assert((await page.locator('[data-selected-path-action="weekly"]').count()) === 1, 'Selected memory path panel should expose weekly action');
  assert((await page.locator('[data-selected-path-action="session"]').count()) === 1, 'Selected memory path panel should expose session action');
  assert(
    (await attribute(page, '[data-command-rail="selected-memory-actions"]', 'data-command-rail-source')) === firstCitation,
    'Selected command rail should follow graph selection',
  );
  assert(
    Number(await attribute(page, '[data-command-rail="selected-memory-actions"]', 'data-command-rail-related-count')) > 0,
    'Selected command rail should expose related-memory count',
  );
  assert(
    (await attribute(page, '[data-memory-path-explainer="selected-memory-related-reasons"]', 'data-memory-path-source')) === firstCitation,
    'Memory path explainer should follow the selected graph memory',
  );
  assert(
    Number(await attribute(page, '[data-memory-path-explainer="selected-memory-related-reasons"]', 'data-memory-path-related-count')) > 0,
    'Memory path explainer should expose related-memory count',
  );
  assert((await page.locator('[data-memory-path-hop="shared-reason"]').textContent())?.includes('공통 이유'), 'Memory path explainer should show why memories are connected');
  assert(
    (await attribute(page, '[data-related-insight-bridge="diary-to-past-memory-actions"]', 'data-related-insight-source')) === firstCitation,
    'Related insight bridge should follow the selected diary memory',
  );
  assert(
    Number(await attribute(page, '[data-related-insight-bridge="diary-to-past-memory-actions"]', 'data-related-insight-count')) > 0,
    'Related insight bridge should expose related-memory reasons',
  );
  assert((await page.locator('[data-related-insight-memory-id]').count()) > 0, 'Related insight bridge should render past-memory reason cards');
  await page.locator('[data-related-insight-action="ask"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'related-insight-ask-ready', 'Related insight Ask action should seed related-memory context');
  await page.locator('[data-command-rail-action="ask"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'command-rail-ask-ready', 'Selected command rail Ask action should seed related context');
  const highlightedRelatedPath = await page.evaluate(() => {
    const graph = (window as any).__personalMemoryGraph;
    return {
      memories: graph?.cy?.nodes('.related-memory').length ?? 0,
      facets: graph?.cy?.nodes('.related-facet').length ?? 0,
      edges: graph?.cy?.edges('.related-edge').length ?? 0,
    };
  });
  assert(highlightedRelatedPath.memories > 0, 'Selected memory should highlight related memory nodes in Cytoscape');
  assert(highlightedRelatedPath.facets > 0, 'Selected memory should highlight shared facet nodes in Cytoscape');
  assert(highlightedRelatedPath.edges > 0, 'Selected memory should highlight related graph edges in Cytoscape');
  assert(Number(await attribute(page, '.second-brain-shell', 'data-related-memory-highlighted-edge-count')) > 0, 'Shell should expose highlighted related edge count');
  await page.locator('[data-control="ask-with-related-memory-context"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-ask-context-source-memory')) === firstCitation, 'Related-memory ask action should seed the selected memory as context');
  assert(Number(await attribute(page, '.second-brain-shell', 'data-ask-context-related-memory-count')) > 0, 'Related-memory ask action should seed related memory context');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'ask-context-seeded-from-related-memories', 'Related-memory ask action should expose seeded interaction state');
  assert(
    (await attribute(page, '[data-guided-service-flow="diary-memory-ai"]', 'data-guided-flow-current-step')) === 'ai',
    'Guided service flow should move to AI after related-memory ask',
  );
  if ((process.env.PMI_LOCAL_URL ?? '').startsWith('http')) {
    await page.locator('[data-control="ask-second-brain"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-ask-state') === 'answered',
      null,
      { timeout: 10_000 },
    );
    assert(
      (await attribute(page, '.second-brain-shell', 'data-ask-result-context-source-memory')) === firstCitation,
      'Ask result should preserve the selected related-memory context source',
    );
    assert(
      Number(await attribute(page, '[data-context-result="ask-related"]', 'data-context-related-memory-count')) > 0,
      'Ask result should render a related-context evidence badge',
    );
    assert(
      (await attribute(page, '[data-grounded-action-result="related-memory-ai"]', 'data-grounded-action-kind')) === 'ask',
      'Grounded action result strip should summarize Ask action context',
    );
    assert(
      (await attribute(page, '[data-grounded-action-result="related-memory-ai"]', 'data-grounded-action-source')) === firstCitation,
      'Grounded action result strip should preserve selected source memory',
    );
  }
  await page.locator('[data-control="replay-with-related-memory-context"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-replay-context-source-memory')) === firstCitation, 'Related-memory replay action should seed the selected memory as context');
  assert(Number(await attribute(page, '.second-brain-shell', 'data-replay-context-related-memory-count')) > 0, 'Related-memory replay action should seed related memory context');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'replay-context-seeded-from-related-memories', 'Related-memory replay action should expose seeded interaction state');
  if ((process.env.PMI_LOCAL_URL ?? '').startsWith('http')) {
    await page.locator('[data-control="run-decision-replay"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-replay-state') === 'answered',
      null,
      { timeout: 10_000 },
    );
    assert(
      (await attribute(page, '.second-brain-shell', 'data-replay-result-context-source-memory')) === firstCitation,
      'Decision Replay result should preserve the selected related-memory context source',
    );
    assert(
      Number(await attribute(page, '[data-context-result="replay-related"]', 'data-context-related-memory-count')) > 0,
      'Decision Replay result should render a related-context evidence badge',
    );
    assert(
      (await attribute(page, '[data-grounded-action-result="related-memory-ai"]', 'data-grounded-action-kind')) === 'replay',
      'Grounded action result strip should summarize Decision Replay context',
    );
  }
  await page.locator('[data-control="report-with-related-memory-context"]').click();
  assert((await attribute(page, '.second-brain-shell', 'data-weekly-context-source-memory')) === firstCitation, 'Related-memory report action should seed the selected memory as context');
  assert(Number(await attribute(page, '.second-brain-shell', 'data-weekly-context-related-memory-count')) > 0, 'Related-memory report action should seed related memory context');
  assert((await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'weekly-context-seeded-from-related-memories', 'Related-memory report action should expose seeded interaction state');
  if ((process.env.PMI_LOCAL_URL ?? '').startsWith('http')) {
    await page.locator('[data-control="refresh-weekly-report"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-weekly-report-state') === 'ready',
      null,
      { timeout: 10_000 },
    );
    assert(
      (await attribute(page, '.second-brain-shell', 'data-weekly-result-context-source-memory')) === firstCitation,
      'Weekly Report result should preserve the selected related-memory context source',
    );
    assert(
      Number(await attribute(page, '[data-context-result="weekly-related"]', 'data-context-related-memory-count')) > 0,
      'Weekly Report result should render a related-context evidence badge',
    );
    assert(
      (await attribute(page, '[data-grounded-action-result="related-memory-ai"]', 'data-grounded-action-kind')) === 'weekly',
      'Grounded action result strip should summarize Weekly Report context',
    );
    await page.locator('[data-control="run-memory-session"]').click();
    await page.waitForFunction(
      () => document.querySelector('.second-brain-shell')?.getAttribute('data-memory-session-state') === 'completed',
      null,
      { timeout: 20_000 },
    );
    assert(
      (await attribute(page, '[data-memory-session-panel]', 'data-session-source-memory')) === firstCitation,
      'Guided memory session should keep selected source memory',
    );
    assert(
      Number(await attribute(page, '[data-memory-session-panel]', 'data-session-related-memory-count')) > 0,
      'Guided memory session should keep related memories',
    );
    assert(
      (await attribute(page, '[data-memory-session-step="ask"]', 'data-session-step-state')) === 'completed',
      'Guided memory session should complete Ask',
    );
    assert(
      (await attribute(page, '[data-memory-session-step="replay"]', 'data-session-step-state')) === 'completed',
      'Guided memory session should complete Decision Replay',
    );
    assert(
      (await attribute(page, '[data-memory-session-step="weekly"]', 'data-session-step-state')) === 'completed',
      'Guided memory session should complete Weekly Report',
    );
    await page.locator('[data-control="grounded-action-saveback"]').click();
    await page.waitForFunction(
      () => document.querySelector('[data-grounded-action-result="related-memory-ai"]')?.getAttribute('data-grounded-action-save-state') === 'saved',
      null,
      { timeout: 30_000 },
    );
    assert(
      Boolean(await attribute(page, '[data-grounded-action-result="related-memory-ai"]', 'data-grounded-action-saved-memory')),
      'Grounded action result saveback should expose the future memory id',
    );
    assert(
      (await attribute(page, '.second-brain-shell', 'data-interaction-state')) === 'grounded-action-result-saved',
      'Grounded action result saveback should expose saved interaction state',
    );
    assert(
      (await attribute(page, '[data-guided-service-flow="diary-memory-ai"]', 'data-guided-flow-current-step')) === 'save',
      'Guided service flow should move to save after grounded saveback',
    );
  }

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

async function verifyCaptureInteractions(page: Page): Promise<void> {
  const localUrl = process.env.PMI_LOCAL_URL ?? pathToFileURL(resolve('dist/index.html')).href;
  const captureUrl = localUrl.startsWith('http') ? new URL('/capture/', localUrl).toString() : pathToFileURL(resolve('dist/capture/index.html')).href;
  await page.goto(captureUrl, { waitUntil: 'load', timeout: 30_000 });
  await page.locator('.capture-app-shell').waitFor({ state: 'attached', timeout: 10_000 });
  assert((await attribute(page, '.capture-app-shell', 'data-privacy-scope')) === 'private', 'Capture app should stay private by default');
  assert((await attribute(page, '.capture-app-shell', 'data-quick-save-endpoint')) === '/api/capture', 'Capture app should target the private capture API');
  assert((await attribute(page, '[data-capture-hints-panel="manual"]', 'aria-label')) === 'Quick save diary form', 'Capture app should expose manual hint controls');
  assert(
    Number(await attribute(page, '[data-capture-related-preview="past-memory-nodes"]', 'data-capture-related-count')) === 3,
    'Capture app should preview related past-memory nodes before handoff',
  );
  assert(
    (await page.locator('[data-capture-related-memory-id]').count()) === 3,
    'Capture app should render three related memory preview links',
  );
  await page.locator('#quick-diary-text').fill(`Playwright capture memory playwright-capture-${Date.now()} with manual hints.`);
  await page.locator('[data-control="capture-emotion-hints"]').fill('focused, relieved');
  await page.locator('[data-control="capture-project-hints"]').fill('personal-memory-ai');
  await page.locator('[data-control="capture-topic-hints"]').fill('app capture, local-first');
  await page.locator('[data-control="capture-decision-hint"]').selectOption('chosen');
  await page.locator('[data-control="capture-outcome-hint"]').fill('capture saved into the private vault');
  await page.locator('[data-control="quick-diary-save"]').click();
  if (captureUrl.startsWith('http')) {
    await page.waitForFunction(
      () => document.querySelector('.capture-app-shell')?.getAttribute('data-quick-save-state') === 'saved',
      null,
      { timeout: 10_000 },
    );
    const capturedMemoryId = await attribute(page, '.capture-app-shell', 'data-last-captured-memory');
    assert(Boolean(capturedMemoryId), 'Capture app should expose the saved memory id after quick save');
    assert(
      (await attribute(page, '.capture-app-shell', 'data-graph-handoff-url')) === `/?memory=${encodeURIComponent(capturedMemoryId || '')}`,
      'Capture app should expose a graph handoff URL after quick save',
    );
    assert(
      (await attribute(page, '.capture-app-shell', 'data-session-handoff-url')) === `/?memory=${encodeURIComponent(capturedMemoryId || '')}&start=session`,
      'Capture app should expose an AI session handoff URL after quick save',
    );
    assert(
      (await attribute(page, '[data-control="open-captured-memory-graph"]', 'href')) === `/?memory=${encodeURIComponent(capturedMemoryId || '')}`,
      'Capture graph link should point at the captured memory',
    );
    assert(
      (await attribute(page, '[data-control="open-captured-memory-session"]', 'href')) ===
        `/?memory=${encodeURIComponent(capturedMemoryId || '')}&start=session`,
      'Capture AI session link should point at the captured memory session',
    );
    assert(
      (await attribute(page, '[data-capture-related-preview="past-memory-nodes"]', 'data-capture-related-state')) === 'ready',
      'Capture related preview should become ready after quick save',
    );
  } else {
    assert((await attribute(page, '.capture-app-shell', 'data-quick-save-state')) === 'saved', 'Static capture preview should mark local save state');
  }
  await page.screenshot({ path: captureScreenshot, fullPage: false });
  if (captureUrl.startsWith('http')) {
    const sessionHandoffHref = await attribute(page, '[data-control="open-captured-memory-session"]', 'href');
    assert(Boolean(sessionHandoffHref), 'Capture app should expose a session handoff href before navigating to second brain');
    await page.goto(new URL(sessionHandoffHref || '/', captureUrl).toString(), { waitUntil: 'load', timeout: 30_000 });
    await page.locator('.second-brain-shell').waitFor({ state: 'attached', timeout: 10_000 });
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-capture-handoff-banner="selected-memory-session"]')
          ?.getAttribute('data-capture-handoff-banner-state') === 'session-ready',
      null,
      { timeout: 12_000 },
    );
    assert(
      (await attribute(page, '[data-capture-handoff-banner="selected-memory-session"]', 'data-capture-handoff-related-count')) !== '0',
      'Capture handoff banner should expose related memories after opening the AI session handoff',
    );
    await page.locator('[data-control="capture-handoff-run-session"]').click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-capture-handoff-banner="selected-memory-session"]')
          ?.getAttribute('data-capture-handoff-banner-state') === 'session-completed',
      null,
      { timeout: 30_000 },
    );
    assert(
      (await attribute(page, '.second-brain-shell', 'data-memory-session-state')) === 'completed',
      'Capture handoff banner should run the guided AI session to completion',
    );
    await page.locator('[data-control="save-memory-session"]').click();
    await page.waitForFunction(
      () =>
        document
          .querySelector('[data-capture-handoff-banner="selected-memory-session"]')
          ?.getAttribute('data-capture-handoff-banner-state') === 'session-saved',
      null,
      { timeout: 15_000 },
    );
    assert(
      (await attribute(page, '[data-capture-handoff-banner="selected-memory-session"]', 'data-capture-handoff-save-state')) === 'saved',
      'Capture handoff banner should mark the completed session as saved',
    );
    const handoffSavedMemoryId = await attribute(page, '[data-capture-handoff-banner="selected-memory-session"]', 'data-capture-handoff-saved-memory');
    assert(Boolean(handoffSavedMemoryId?.startsWith('mem_api_')), 'Capture handoff banner should expose the saved future memory id');
    assert(
      (await attribute(page, '[data-capture-handoff-banner="selected-memory-session"]', 'data-capture-handoff-reentry-state')) === 'ready',
      'Capture handoff banner should expose saved memory reentry controls',
    );
    const savedGraphHref = await attribute(page, '[data-control="open-saved-session-memory-graph"]', 'href');
    const savedSessionHref = await attribute(page, '[data-control="open-saved-session-memory-session"]', 'href');
    assert(Boolean(savedGraphHref?.includes('memory=' + encodeURIComponent(handoffSavedMemoryId || ''))), 'Saved session graph link should reopen the future memory');
    assert(Boolean(savedSessionHref?.includes('memory=' + encodeURIComponent(handoffSavedMemoryId || ''))), 'Saved session AI link should reopen the future memory');
    assert(Boolean(savedSessionHref?.includes('start=session')), 'Saved session AI link should restart a session from the future memory');
  }
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
  const capturePage = await context.newPage();
  await verifyCaptureInteractions(capturePage);
  const evidenceCleanupDeletedCount = await cleanupEvidenceRecords();

  console.log(
    JSON.stringify(
      {
        benchmarkScreenshot,
        localScreenshot,
        interactionScreenshot,
        searchScreenshot,
        captureScreenshot,
        evidenceCleanupDeletedCount,
        verified: [
          'cytoscape data graph ready',
          'data-derived graph stats',
          'remote memory search api',
          'live ask api response',
          'live ask follow-up context',
          'live ask related-context result evidence',
          'live decision replay api response',
          'live decision replay graph highlight',
          'live decision replay related-context result evidence',
          'live weekly report api response',
          'live weekly report graph highlight',
          'live weekly report related-context result evidence',
          'guided memory session',
          'saved artifact action',
          'saved artifact persistence manifest',
          'feedback correction action',
          'local import upload preview',
          'local import upload apply',
          'import to guided memory session handoff',
          'guided memory session saveback',
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
          'app capture manual hints',
          'app capture quick save',
        ],
      },
      null,
      2,
    ),
  );
} finally {
  await browser.close();
}
