import { describe, expect, test } from 'vitest';
import { renderAppShellDocument, renderAppShellHtml } from '../App';
import { renderMemoryDetailTimelinePanel } from '../components/MemoryDetailTimelinePanel';
import {
  buildAppShellEvidenceLayoutFromMemoryStore,
  buildInitialAppShellEvidenceLayout,
} from './appShellEvidenceLayout';
import { createMemoryStore } from './createMemoryStore';
import { buildMemoryReviewLedgerEntry, buildMemoryReviewLedgerRecord } from './memoryReviewLedger';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';

describe('buildInitialAppShellEvidenceLayout', () => {
  test('loads the first-screen memory-brain graph around diary and imported memories', () => {
    const shell = buildInitialAppShellEvidenceLayout();

    expect(shell.northStar).toBe('나보다 나를 더 잘 아는 개인 기억 AI.');
    expect(shell.records).toHaveLength(8);
    expect(shell.records.map((record) => record.id)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/),
        expect.stringMatching(/^mem_api_artifact_decision_replay_sha-/),
        expect.stringMatching(/^mem_api_artifact_weekly_report_sha-/),
      ]),
    );
    expect(shell.primaryNodes.map((node) => node.recordId).slice(0, 5)).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
      'mem_unrelated_calm_import',
      'mem_captured_ship_note',
    ]);
    expect(shell.primaryNodes.map((node) => node.recordId)).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/),
        expect.stringMatching(/^mem_api_artifact_decision_replay_sha-/),
        expect.stringMatching(/^mem_api_artifact_weekly_report_sha-/),
      ]),
    );
    expect(shell.primaryNodes.every((node) => node.status === 'implemented')).toBe(true);
    expect(shell.links).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          from: 'memory:mem_launch_may_anxiety_scope_delay',
          to: 'emotion:anxiety',
          kind: 'emotion',
          status: 'implemented',
        }),
        expect.objectContaining({
          from: 'memory:mem_captured_ship_note',
          to: 'source:mobile',
          kind: 'source',
          status: 'implemented',
        }),
        expect.objectContaining({
          from: 'memory:mem_launch_june_anxiety_scope_delay',
          to: 'outcome:온보딩-예시와-결정-되짚기-제어를-추가한-뒤-출시가-늦어졌다',
          kind: 'outcome',
          status: 'implemented',
        }),
      ]),
    );
    expect(shell.surfaces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'app-quick-diary-capture', status: 'partial' }),
        expect.objectContaining({ id: 'web-graph-workspace', status: 'implemented' }),
        expect.objectContaining({ id: 'weekly-report', status: 'implemented' }),
        expect.objectContaining({ id: 'memory-detail-timeline', status: 'implemented' }),
        expect.objectContaining({ id: 'saved-artifact-actions', status: 'implemented' }),
      ]),
    );
    expect(shell.savedArtifactActions.map((action) => action.kind)).toEqual([
      'ask_answer',
      'decision_replay',
      'weekly_report',
    ]);
    expect(shell.savedArtifactActions[0]).toEqual(
      expect.objectContaining({
        label: '답변 저장',
        endpoint: '/api/capture',
        initialState: 'ready',
        sourceRef: expect.stringContaining('personal-memory-ai://saved-artifacts/'),
      }),
    );
    expect(shell.memoryTimeline).toMatchObject({
      summary: {
        totalMemoryCount: 8,
        startDate: '2026-05-01',
        endDate: '2026-05-28',
        selectedMemoryId: 'mem_freeze_vs_feature_addition',
      },
    });
    expect(shell.memoryTimeline.entries.find((entry) => entry.memoryId === 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({ active: true, relatedMemoryIds: expect.arrayContaining(['mem_launch_june_anxiety_scope_delay']) }),
    );
    expect(shell.weeklyReport).toMatchObject({
      id: 'weekly_report_2026-05-01_2026-05-20',
      status: 'implemented',
      evidenceLabel: 'sufficient_evidence',
      includedMemoryIds: [
        'mem_launch_may_anxiety_scope_delay',
        'mem_launch_june_anxiety_scope_delay',
        'mem_freeze_vs_feature_addition',
      ],
    });
    expect(shell.evidenceDrawer.items.length).toBeGreaterThan(0);
    expect(shell.compiledWiki.nodeCount).toBeGreaterThan(10);
    expect(shell.compiledWiki.atomCount).toBe(8);
    expect(shell.compiledWiki.operationCounts).toEqual({ retain: 8, recall: 8, reflect: 6 });
    expect(shell.compiledWiki.freshnessCounts).toEqual({ strengthening: 3, stable: 3, stale: 2 });
    expect(shell.privacyControls).toMatchObject({
      privacyScope: 'private',
      vaultAccess: 'owner-only',
      storageMode: 'local-prototype',
      selectedDeleteControl: {
        endpoint: '/api/delete',
        memoryIds: ['mem_freeze_vs_feature_addition'],
      },
      hardDeleteControl: {
        confirmationPhrase: 'DELETE MY PRIVATE MEMORY VAULT',
        disabled: true,
      },
    });
    expect(shell.compiledWiki.atoms).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'atom:mem_freeze_vs_feature_addition', origin: 'synthesized', freshness: 'stable' }),
        expect.objectContaining({ id: 'atom:mem_captured_ship_note', origin: 'captured', operations: ['retain', 'recall'] }),
      ]),
    );
    expect(shell.compiledWiki.nodes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'pattern:launch-delay-from-feature-expansion', type: 'pattern' }),
        expect.objectContaining({ id: 'concept:feature-addition', type: 'concept' }),
      ]),
    );
  });

  test('keeps graph-supporting surfaces and sample data status honest in the data contract', () => {
    const shell = buildInitialAppShellEvidenceLayout();

    expect(shell.surfaces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: 'seed-memory-fixtures', status: 'fake/sample' }),
        expect.objectContaining({ id: 'app-capture-native-client', status: 'skeleton' }),
        expect.objectContaining({ id: 'weekly-report', status: 'implemented' }),
        expect.objectContaining({ id: 'memory-detail-timeline', status: 'implemented' }),
        expect.objectContaining({ id: 'saved-artifact-actions', status: 'implemented' }),
      ]),
    );
    expect(shell.surfaces.map((surface) => surface.status)).toEqual(
      expect.arrayContaining(['implemented', 'partial', 'skeleton', 'fake/sample']),
    );
  });

  test('loads the default experience as Korean diary memories instead of an English demo', () => {
    const shell = buildInitialAppShellEvidenceLayout();
    const html = renderAppShellHtml();

    expect(shell.records[0].summary).toBe('불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다.');
    expect(shell.replay.currentDecision.prompt).toBe('오늘 MVP를 보여줄까, 아니면 결정 되짚기 화면을 더 다듬을까?');
    expect(shell.surfaces.find((surface) => surface.id === 'ask-my-past-self')?.label).toBe('과거의 나에게 묻기');
    expect(shell.surfaces.find((surface) => surface.id === 'weekly-report')?.label).toBe('주간 패턴');

    expect(html).toContain('불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다.');
    expect(html).toContain('차분하게 Markdown 일기를 가져와 기억 변환을 확인했다.');
    expect(html).toContain('오늘 MVP를 보여줄까, 아니면 결정 되짚기 화면을 더 다듬을까?');
    expect(html).toContain('과거의 나에게 묻기');
    expect(html).toContain('결정 되짚기');
    expect(html).toContain('주간 패턴');
    expect(html).not.toContain('Anxiety before the memory import demo');
    expect(html).not.toContain('Should I add more Decision Replay polish before review?');
    expect(html).not.toContain('Ask My Past Self');
    expect(html).not.toContain('Weekly Report');
  });

  test('can assemble the app shell data from one user memory store records', async () => {
    const store = createMemoryStore({ env: {} });
    const userRecords = personalMemoryRecords.slice(0, 3);

    for (const record of userRecords) {
      await store.create('user-a', record);
    }
    await store.create('user-b', {
      ...personalMemoryRecords[3],
      id: 'mem_other_user_hidden_from_shell',
      sourceRef: 'markdown://other-user/private.md',
    });

    const shell = await buildAppShellEvidenceLayoutFromMemoryStore({
      store,
      userId: 'user-a',
    });

    const primaryRecordIds = shell.primaryNodes.map((node) => node.recordId);
    expect(primaryRecordIds.slice(0, userRecords.length)).toEqual(userRecords.map((record) => record.id));
    expect(primaryRecordIds).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/),
        expect.stringMatching(/^mem_api_artifact_decision_replay_sha-/),
        expect.stringMatching(/^mem_api_artifact_weekly_report_sha-/),
      ]),
    );
    expect(primaryRecordIds).not.toContain('mem_other_user_hidden_from_shell');
    expect(shell.records.map((record) => record.id)).not.toContain('mem_other_user_hidden_from_shell');
    expect(shell.records).toHaveLength(userRecords.length + 3);
    expect(shell.compiledWiki.atomCount).toBe(userRecords.length + 3);
    expect(shell.ask.citationMemoryIds.sort()).toEqual(userRecords.map((record) => record.id).sort());
    expect(shell.evidenceDrawer.items.map((item) => item.citation).join(' ')).not.toContain('mem_other_user_hidden_from_shell');
  });

  test('excludes review ledger records from normal graph and exposes timeline history metadata', async () => {
    const store = createMemoryStore({ env: {} });
    const edited = {
      ...personalMemoryRecords[2],
      summary: 'Edited source-backed freeze decision.',
    };
    const entry = buildMemoryReviewLedgerEntry({
      userId: 'user-a',
      before: personalMemoryRecords[2],
      after: edited,
      reviewedAt: '2026-05-28T06:00:00.000Z',
    });
    await store.create('user-a', personalMemoryRecords[2]);
    await store.create('user-a', buildMemoryReviewLedgerRecord(entry));

    const shell = await buildAppShellEvidenceLayoutFromMemoryStore({
      store,
      userId: 'user-a',
    });

    expect(shell.records.map((record) => record.id)).toEqual([
      'mem_freeze_vs_feature_addition',
      expect.stringMatching(/^mem_api_artifact_ask_answer_sha-/),
      expect.stringMatching(/^mem_api_artifact_decision_replay_sha-/),
      expect.stringMatching(/^mem_api_artifact_weekly_report_sha-/),
    ]);
    expect(shell.primaryNodes.map((node) => node.recordId)).not.toContain(entry.id);
    expect(shell.memoryTimeline.summary.totalMemoryCount).toBe(4);
    expect(shell.memoryTimeline.entries.find((item) => item.memoryId === 'mem_freeze_vs_feature_addition')).toEqual(
      expect.objectContaining({
        reviewHistoryCount: 1,
        latestReviewRevisionId: entry.id,
        reviewHistory: [entry],
        reviewComparisons: [
          expect.objectContaining({
            revisionId: entry.id,
            changedFieldLabels: ['summary'],
            deltaLabel: 'summary changed',
          }),
        ],
      }),
    );

    const html = renderMemoryDetailTimelinePanel(shell);
    expect(html).toContain('data-memory-review-comparison=');
    expect(html).toContain('data-review-before-summary=');
    expect(html).toContain('data-review-after-summary=');
    expect(html).toContain('data-review-changed-field=');
  });

  test('renders a benchmark-like second-brain graph workspace instead of a dashboard shell', () => {
    const html = renderAppShellHtml();

    expect(html).toContain('class="second-brain-shell"');
    expect(html).toContain('data-benchmark-reference="https://www.careerhackeralex.com/memory"');
    expect(html).toContain('data-graph-renderer="cytoscape-pending"');
    expect(html).toContain('data-graph-library="cytoscape"');
    expect(html).toContain('id="memory-graph-cytoscape"');
    expect(html).toContain('id="memory-graph-elements"');
    expect(html).toContain('id="saved-artifact-actions"');
    expect(html).toContain('"library":"cytoscape"');
    expect(html).toContain('"memoryNodeCount":8');
    expect(html).toContain('"graphLabel":"불안해서 기억 가져오기 데모 범위를 넓혔고 출시가 이틀 늦어졌다."');
    expect(html).toContain('data-surface-mode="graph-first"');
    expect(html).toContain('data-rail-mode="collapsed-evidence-drawer"');
    expect(html).toContain('data-prototype-ux="korean-usable-mvp"');
    expect(html).toContain('data-prototype-mode="use-now"');
    expect(html).toContain('data-visible-core-flow="capture-graph-ai"');
    expect(html).toContain('data-secondary-panels="collapsed"');
    expect(html).toContain('data-product-goal="quick-diary-to-private-second-brain-ai"');
    expect(html).toContain('data-interaction-contract="capture-import-select-related-session-save"');
    expect(html).toContain('data-workflow-focus="capture"');
    expect(html).toContain('data-layout-mode="free"');
    expect(html).toContain('data-layout-version="0"');
    expect(html).toContain('data-filter-semantic="on"');
    expect(html).toContain('class="brain-sidebar"');
    expect(html).toContain('class="brain-canvas"');
    expect(html).toContain('class="graph-meta-line"');
    expect(html).toContain('data-memory-search-endpoint="/api/memory/search"');
    expect(html).toContain('data-control="memory-search"');
    expect(html).toContain('data-search-results="memory"');
    expect(html).toContain('data-search-count');
    expect(html).toContain('data-memory-timeline-panel="pmi025"');
    expect(html).toContain('data-timeline-entry-count="8"');
    expect(html).toContain('data-memory-review-panel="source-edit"');
    expect(html).toContain('data-memory-detail-endpoint="/api/memory/detail"');
    expect(html).toContain('data-memory-update-endpoint="/api/memory/update"');
    expect(html).toContain('data-memory-review-history-endpoint="/api/memory/review-history"');
    expect(html).toContain('data-memory-provenance-export-endpoint="/api/memory/provenance-export"');
    expect(html).toContain('data-memory-provenance-download-endpoint="/api/memory/provenance-download"');
    expect(html).toContain('data-memory-provenance-export-filename="memory-provenance-mem_freeze_vs_feature_addition-2026-05-27.json"');
    expect(html).toContain('data-memory-review-selected-id="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-memory-review-ledger="pending"');
    expect(html).toContain('data-memory-review-revision=""');
    expect(html).toContain('data-memory-review-history-count="0"');
    expect(html).toContain('data-memory-review-history-state="empty"');
    expect(html).toContain('data-control="memory-edit-summary"');
    expect(html).toContain('data-control="memory-edit-raw-text"');
    expect(html).toContain('data-control="save-memory-edit"');
    expect(html).toContain('data-control="export-memory-provenance"');
    expect(html).toContain('data-control="download-memory-provenance"');
    expect(html).toContain('data-timeline-memory-id="mem_api_artifact_ask_answer_sha-');
    expect(html).toContain('data-timeline-memory-id="mem_api_artifact_weekly_report_sha-');
    expect(html).toContain('data-timeline-memory-id="mem_captured_ship_note"');
    expect(html).toContain('data-timeline-active="true"');
    expect(html).toContain('data-timeline-related-count=');
    expect(html).toContain('data-save-artifact-action="ask_answer"');
    expect(html).toContain('data-save-artifact-action="decision_replay"');
    expect(html).toContain('data-save-artifact-action="weekly_report"');
    expect(html).toContain('data-artifact-save-state="ready"');
    expect(html).toContain('data-artifact-save-endpoint="/api/capture"');
    expect(html).toContain('data-feedback-panel="user-correction"');
    expect(html).toContain('data-feedback-endpoint="/api/feedback"');
    expect(html).toContain('data-feedback-state="ready"');
    expect(html).toContain('data-feedback-target-memory-id="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-control="feedback-correction-text"');
    expect(html).toContain('data-control="submit-feedback-correction"');
    expect(html).toContain('"endpoint":"/api/capture"');
    expect(html).toContain('"artifact":{"id":"artifact_');
    expect(html).toContain('personal-memory-ai://saved-artifacts/');
    expect(html).toContain('graph-control-panel');
    expect(html).toContain('class="control-row node-spacing-controls"');
    expect(html).toContain('class="control-action rearrange-graph"');
    expect(html).toContain('class="control-action hide-secondary-labels"');
    expect(html).toContain('data-control="toggle-labels"');
    expect(html).toContain('data-control="select-memory"');
    expect(html).toContain('class="memory-node obsidian-memory-node');
    expect(html).toContain('data-memory-node-count="8"');
    expect(html).toContain('data-rendered-memory-node-count="8"');
    expect(html).toContain('data-graph-density="benchmark-dense"');
    expect(html).toContain('<strong data-live-count="memory-nodes">8</strong> 기억');
    expect(html).toContain('<strong data-live-count="rendered-memory-nodes">8</strong> 표시');
    expect(html).toContain('data-filter-kind="semantic"');
    expect(html).toContain('data-filter-kind="thesis"');
    expect(html).toContain('data-filter-active="true"');
    expect(html).toContain('data-search-text=');
    expect(html).toContain('data-search-match="true"');
    expect(html).toContain('class="memory-node obsidian-memory-node obsidian-selected-memory');
    expect(html).toContain('class="semantic-edge obsidian-spoke-edge"');
    expect(html).toContain('data-edge-from="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-edge-active="true"');
    expect(html).toContain('class="ghost-memory-edge obsidian-faded-edge"');
    expect(html).toContain('class="ghost-memory-node obsidian-background-node"');
    expect(html).toContain('class="node-title obsidian-node-label');
    expect(html).toContain('data-inspector-title=');
    expect(html).toContain('data-inspector-panel="pmi015"');
    expect(html).toContain('data-wiki-compiler="pmi017"');
    expect(html).toContain('원자 기억');
    expect(html).toContain('위키 노드');
    expect(html).toContain('data-llm-wiki-visible="true"');
    expect(html).toContain('data-memory-ops="retain-recall-reflect"');
    expect(html).toContain('data-memory-freshness="strengthening-stable-stale"');
    expect(html).toContain('data-memory-atom-id="atom:mem_api_artifact_ask_answer_sha-');
    expect(html).toContain('data-wiki-node-id="pattern:launch-delay-from-feature-expansion"');
    expect(html).toContain('data-inspector-headline');
    expect(html).toContain('data-spacing="wide"');
    expect(html).toContain('data-filter-chip="episodic"');
    expect(html).toContain('class="control-action subtle reset-graph-filters"');
    expect(html).toContain('class="ask-memory-bar"');
    expect(html).toContain('내 세컨브레인');
    expect(html).toContain('지식 그래프');
    expect(html).toContain('노드 유형');
    expect(html).toContain('엣지 유형');
    expect(html).toContain('내 기억에게 묻기');
    expect(html).toContain('과거의 나에게 묻기');
    expect(html).toContain('결정 되짚기');
    expect(html).toContain('근거 서랍');
    expect(html).not.toContain('class="count-card"');
    expect(html).not.toContain('class="story-grid"');
    expect(html).not.toContain('class="editorial-band"');
    expect(html).not.toContain('status-planned');
    expect(html).not.toContain('status-skeleton');
    expect(html).not.toContain('status-fake-sample');
  });

  test('constrains benchmark graph controls to the left rail and keeps product panels secondary', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('data-first-screen-contract="korean-diary-flow-graph-dominant"');
    expect(documentHtml).toContain('data-panel-visibility="secondary-drawer"');
    expect(documentHtml).toContain('.memory-search-result {');
    expect(documentHtml).toContain('width: 100%;');
    expect(documentHtml).toContain('min-width: 0;');
    expect(documentHtml).toContain('.memory-search-result span {');
    expect(documentHtml).toContain('overflow: hidden;');
    expect(documentHtml).toContain('text-overflow: ellipsis;');
    expect(documentHtml).toContain('data-layout-choice="constellation"');
    expect(documentHtml).toContain('data-layout-choice="hierarchy"');
    expect(documentHtml).toContain('data-layout-choice="timeline"');
    expect(documentHtml).toContain('내 기억에게 묻기');
    expect(documentHtml).toContain('grid-template-columns: auto auto minmax(0, 1fr) auto;');
    expect(documentHtml).toContain('data-benchmark-drawer-tab="AI 세션과 근거"');
    expect(documentHtml).toContain("shell.setAttribute('data-layout-mode', mode)");
    expect(documentHtml).toContain("shell.setAttribute('data-layout-explainer'");
    expect(documentHtml).toContain('Constellation pins decision and thesis nodes around the selected memory.');
    expect(documentHtml).toContain('계층 모드는 출처, 패턴, 결정, 결과 노드 아래 기억을 정리한다.');
    expect(documentHtml).toContain('시간 모드는 오래된 일기 흔적부터 최근 가져오기까지 펼쳐 보여준다.');
  });

  test('wires memory review comparison cards for immediate post-edit inspection', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('data-review-comparison-active=');
    expect(documentHtml).toContain('data-control="select-review-comparison"');
    expect(documentHtml).toContain('const renderMemoryReviewComparison =');
    expect(documentHtml).toContain('const selectReviewComparison =');
    expect(documentHtml).toContain("memoryReviewPanel.setAttribute('data-active-review-comparison'");
    expect(documentHtml).toContain("memoryReviewPanel.setAttribute('data-memory-review-history-count'");
    expect(documentHtml).toContain("memoryReviewPanel.setAttribute('data-memory-review-history-state', 'ready')");
    expect(documentHtml).toContain("setInteractionState('memory-review-comparison-selected')");
  });

  test('wires selected-memory provenance export and download controls through the private API', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('data-memory-provenance-export-state="idle"');
    expect(documentHtml).toContain('data-memory-provenance-download-state="idle"');
    expect(documentHtml).toContain('const fetchMemoryProvenanceExport =');
    expect(documentHtml).toContain('const downloadMemoryProvenance =');
    expect(documentHtml).toContain("memoryReviewPanel.setAttribute('data-memory-provenance-export-state', 'ready')");
    expect(documentHtml).toContain("memoryReviewPanel.setAttribute('data-memory-provenance-download-state', 'ready')");
    expect(documentHtml).toContain("shell.setAttribute('data-last-provenance-export-memory'");
    expect(documentHtml).toContain("shell.setAttribute('data-last-provenance-download-filename'");
    expect(documentHtml).toContain("setInteractionState('memory-provenance-exported')");
    expect(documentHtml).toContain("setInteractionState('memory-provenance-downloaded')");
  });

  test('separates the source review drawer into review history and provenance modes', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('data-memory-review-mode="review"');
    expect(documentHtml).toContain('data-control="memory-review-mode"');
    expect(documentHtml).toContain('data-review-mode-target="history"');
    expect(documentHtml).toContain('data-review-mode-target="provenance"');
    expect(documentHtml).toContain('data-memory-review-section="review"');
    expect(documentHtml).toContain('data-memory-review-section="history"');
    expect(documentHtml).toContain('data-memory-review-section="provenance"');
    expect(documentHtml).toContain('const setMemoryReviewMode =');
    expect(documentHtml).toContain("memoryReviewPanel.setAttribute('data-memory-review-mode', mode)");
    expect(documentHtml).toContain("setInteractionState('memory-review-mode-' + mode)");
  });

  test('renders a direct Notion database import preview entry point', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('data-notion-import-panel="database"');
    expect(documentHtml).toContain('data-notion-import-endpoint="/api/import/notion/preview"');
    expect(documentHtml).toContain('data-notion-sources-endpoint="/api/import/notion/sources"');
    expect(documentHtml).toContain('data-control="notion-database-id"');
    expect(documentHtml).toContain('data-control="list-notion-sources"');
    expect(documentHtml).toContain('data-control="preview-notion-import"');
    expect(documentHtml).toContain('data-notion-source-list');
    expect(documentHtml).toContain('data-notion-import-summary');
    expect(documentHtml).toContain('const findBestDiaryNotionSource =');
    expect(documentHtml).toContain('const selectNotionSource =');
    expect(documentHtml).toContain("'습관리스트'");
    expect(documentHtml).toContain("'습관'");
    expect(documentHtml).toContain("'일기'");
    expect(documentHtml).toContain("notionImportPanel?.setAttribute('data-notion-auto-selected-source'");
    expect(documentHtml).toContain("selectNotionSource(autoSelectedSource, 'auto')");
    expect(documentHtml).toContain("setInteractionState('notion-import-token-required')");
    expect(documentHtml).toContain("setInteractionState('notion-source-auto-selected')");
    expect(documentHtml).toContain("setInteractionState('notion-sources-ready')");
    expect(documentHtml).toContain("setInteractionState('notion-sources-rate-limited')");
    expect(documentHtml).toContain("setInteractionState('notion-import-rate-limited')");
  });

  test('renders Ask My Past Self as a cited path over the graph with evidence drawer trace', () => {
    const shell = buildInitialAppShellEvidenceLayout();
    const html = renderAppShellHtml();

    expect(html).toContain('aria-label="과거의 나에게 묻기 인용 질문 흐름"');
    expect(html).toContain('data-ask-endpoint="/api/ask"');
    expect(html).toContain('data-control="ask-second-brain"');
    expect(html).toContain('id="ask-my-past-self-question"');
    expect(html).toContain('이번에도 기능을 더 넣어야 할까?');
    expect(html).toContain('[mem_launch_may_anxiety_scope_delay]');
    expect(html).toContain(
      '<a href="#evidence-mem_launch_may_anxiety_scope_delay" class="citation-ref" data-citation-ref="mem_launch_may_anxiety_scope_delay">[mem_launch_may_anxiety_scope_delay]</a>',
    );
    expect(html).toContain('aria-label="과거의 나에게 묻기 인용"');
    expect(html).toContain('data-coaching-brief="citation-bounded"');
    expect(html).toContain('aria-label="인용 기반 코칭 요약"');
    expect(html).toContain('data-coaching-next-action="freeze-scope"');
    expect(html).toContain('data-coaching-next-action="user-feedback"');
    expect(html).toContain('data-coaching-boundary="cited-personal-memories"');
    expect(html).toContain('data-citation-id="mem_launch_june_anxiety_scope_delay"');
    expect(html).toContain('data-highlight-id="question:이번에도-기능을-더-넣어야-할까"');
    expect(html).toContain('data-highlight-id="memory:mem_launch_may_anxiety_scope_delay"');
    expect(html).toContain('class="graph-highlight-node');
    expect(html).toContain('class="ghost-memory-node obsidian-background-node"');
    expect(html).toContain('class="ghost-memory-label obsidian-faded-label"');
    expect(html).toContain('class="selected-node-affordance obsidian-selected-affordance"');
    expect(html).toContain('class="semantic-edge obsidian-spoke-edge"');
    expect(html).toContain('data-highlight-id="emotion:anxiety"');
    expect(html).toContain('data-highlight-id="decision:chosen"');
    expect(html).toContain(
      'data-highlight-id="outcome:그래프-필터를-더-붙인-뒤-출시가-이틀-늦어졌다"',
    );
    expect(html).toContain('data-current-question-id="question:이번에도-기능을-더-넣어야-할까"');
    expect(html).toContain('근거 서랍');

    for (const highlightId of shell.ask.graphHighlightIds) {
      expect(html).toContain(highlightId);
    }
    for (const citationId of shell.ask.citationMemoryIds.slice(0, 2)) {
      expect(html).toContain(`href="#evidence-${citationId}"`);
      expect(html).toContain(`id="evidence-${citationId}"`);
    }
  });

  test('renders the private diary-to-memory product surface with visible evidence contracts', () => {
    const html = renderAppShellHtml();
    const documentHtml = renderAppShellDocument();

    expect(html).toContain('class="product-value-strip"');
    expect(html).toContain('data-command-shelf="graph-led"');
    expect(html).toContain('data-benchmark-alignment="careerhacker-memory-graph-first"');
    expect(html).toContain('data-visible-priority="capture-import-ai-session"');
    expect(html).toContain('data-first-screen-density="compact-command-shelf"');
    expect(html).toContain('data-use-now-mode="enabled"');
    expect(html).toContain('data-flow-collapsed="true"');
    expect(html).toContain('data-use-now-command-strip="diary-graph-ai"');
    expect(html).toContain('오늘 바로 쓰기');
    expect(html).toContain('data-use-now-step="capture"');
    expect(html).toContain('data-use-now-step="graph"');
    expect(html).toContain('data-use-now-step="ai-workbench"');
    expect(html).toContain('일기 쓰기/가져오기');
    expect(html).toContain('세컨브레인 연결');
    expect(html).toContain('AI 작업대');
    expect(html).toContain('data-use-now-next-label');
    expect(html).toContain('data-use-now-route-board="live"');
    expect(html).toContain('data-use-now-route-state="capture"');
    expect(html).toContain('data-use-now-route-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-use-now-route-related-count=');
    expect(html).toContain('data-use-now-route-ai-state="idle"');
    expect(html).toContain('data-use-now-route-save-state="idle"');
    expect(html).toContain('data-use-now-route-label="memory"');
    expect(html).toContain('data-use-now-route-label="related"');
    expect(html).toContain('data-use-now-route-label="ai"');
    expect(html).toContain('data-use-now-route-label="save"');
    expect(html).toContain('선택 기억');
    expect(html).toContain('연관 과거 기억');
    expect(html).toContain('AI 결과');
    expect(html).toContain('미래 기억 저장');
    expect(html).toContain('data-use-now-action="focus-graph"');
    expect(html).toContain('data-use-now-action="run-ai"');
    expect(html).toContain('data-use-now-action="save-result"');
    expect(html).toContain('data-use-now-action="open-saved-memory"');
    expect(html).toContain('data-use-now-route-reentry-state="disabled"');
    expect(html).toContain('data-use-now-route-path="related-memory"');
    expect(html).toContain('data-use-now-route-path-state="empty"');
    expect(documentHtml).toContain('.product-value-strip[data-command-shelf="graph-led"]');
    expect(documentHtml).toContain('.use-now-command-strip');
    expect(documentHtml).toContain('.use-now-route-board');
    expect(documentHtml).toContain('.use-now-route-actions');
    expect(documentHtml).toContain('.product-value-strip[data-use-now-mode="enabled"][data-flow-collapsed="true"] .service-flow-steps');
    expect(html).toContain('data-prototype-journey-cockpit="diary-memory-ai"');
    expect(html).toContain('data-journey-current-step="capture"');
    expect(html).toContain('data-journey-selected-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-journey-related-count=');
    expect(html).toContain('data-journey-ai-state="idle"');
    expect(html).toContain('data-journey-save-state="idle"');
    expect(html).toContain('data-journey-next-action="write-or-import"');
    expect(html).toContain('지금 흐름');
    expect(html).toContain('다음 행동');
    expect(html).toContain('data-journey-step-label');
    expect(html).toContain('data-journey-memory-label');
    expect(html).toContain('data-journey-related-label');
    expect(html).toContain('data-journey-ai-label');
    expect(html).toContain('data-journey-save-label');
    expect(html).toContain('data-journey-next-action-label');
    expect(html).toContain('data-journey-primary-action="capture"');
    expect(html).toContain('data-journey-primary-action="graph"');
    expect(html).toContain('data-journey-primary-action="session"');
    expect(html).toContain('data-korean-ai-workbench="selected-or-imported-memory"');
    expect(html).toContain('data-workbench-selected-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-workbench-related-count=');
    expect(html).toContain('data-workbench-last-action="none"');
    expect(html).toContain('data-workbench-next-action="choose-ai-action"');
    expect(html).toContain('data-workbench-save-state="idle"');
    expect(html).toContain('오늘 기억 작업대');
    expect(html).toContain('선택/가져온 기억');
    expect(html).toContain('AI 행동 · 대기');
    expect(html).toContain('저장 · 대기');
    expect(html).toContain('data-workbench-memory-label');
    expect(html).toContain('data-workbench-related-label');
    expect(html).toContain('data-workbench-action-label');
    expect(html).toContain('data-workbench-save-label');
    expect(html).toContain('data-workbench-next-label');
    expect(html).toContain('data-workbench-action="ask"');
    expect(html).toContain('data-workbench-action="replay"');
    expect(html).toContain('data-workbench-action="weekly"');
    expect(html).toContain('data-workbench-action="session"');
    expect(html).toContain('data-workbench-action="save"');
    expect(documentHtml).toContain('.prototype-journey-cockpit');
    expect(documentHtml).toContain('.korean-ai-workbench');
    expect(documentHtml).toContain('.prototype-entry-dock[data-entry-dock="diary-start"]');
    expect(documentHtml).toContain('.first-run-guide[data-first-run-guide="diary-memory-ai"]');
    expect(html).toContain('오늘 쓴 고민을 과거 기억과 연결해서 답하게 한다');
    expect(html).toContain('앱에서는 빠르게 쓰고, 웹에서는 일기 DB만 가져온다');
    expect(html).toContain('data-prototype-flow="tonight-usable"');
    expect(html).toContain('data-entry-dock="diary-start"');
    expect(html).toContain('data-primary-entry-action="quick-diary"');
    expect(html).toContain('href="/capture/"');
    expect(html).toContain('data-control="focus-local-import"');
    expect(html).toContain('앱처럼 빠른 일기 쓰기');
    expect(html).toContain('일기 붙여넣어 가져오기');
    expect(html).toContain('data-memory-intake-hub="app-web-diary"');
    expect(html).toContain('data-diary-graph-handoff-map="app-web-notion-to-graph"');
    expect(html).toContain('data-handoff-active-route="none"');
    expect(html).toContain('data-handoff-stage="waiting"');
    expect(html).toContain('data-handoff-selected-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-handoff-related-count=');
    expect(html).toContain('data-handoff-route="app-quick-diary"');
    expect(html).toContain('data-handoff-route="web-paste-diary"');
    expect(html).toContain('data-handoff-route="notion-diary-db"');
    expect(html).toContain('앱 빠른 일기');
    expect(html).toContain('웹 일기 붙여넣기');
    expect(html).toContain('Notion 일기 DB');
    expect(html).toContain('그래프 반영 상태');
    expect(html).toContain('data-handoff-stage-label');
    expect(html).toContain('data-handoff-memory-label');
    expect(html).toContain('data-handoff-related-label');
    expect(html).toContain('data-handoff-ai-label');
    expect(html).toContain('data-handoff-saveback-label');
    expect(html).toContain('data-diary-inbox="app-web-diary-sources"');
    expect(html).toContain('data-diary-inbox-count=');
    expect(html).toContain('data-diary-inbox-active-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('오늘 들어온 일기');
    expect(html).toContain('data-diary-inbox-memory-id="mem_captured_ship_note"');
    expect(html).toContain('data-diary-inbox-memory-id="mem_unrelated_calm_import"');
    expect(html).toContain('data-control="diary-inbox-select-memory"');
    expect(html).toContain('data-intake-stage="capture-or-import"');
    expect(html).toContain('data-intake-source-scope="diary-only"');
    expect(html).toContain('기록 인입 허브');
    expect(html).toContain('앱 빠른 기록');
    expect(html).toContain('웹 일기 붙여넣기');
    expect(html).toContain('습관리스트 Notion DB');
    expect(html).toContain('data-intake-action="quick-capture"');
    expect(html).toContain('data-intake-action="paste-diary"');
    expect(html).toContain('data-intake-action="notion-diary-db"');
    expect(html).toContain('data-intake-result="graph-handoff"');
    expect(html).toContain('data-intake-last-action="none"');
    expect(html).toContain('data-intake-draft-state="idle"');
    expect(html).toContain('data-control="intake-diary-draft"');
    expect(html).toContain('data-control="intake-quick-save-diary"');
    expect(html).toContain('data-intake-quick-save-endpoint="/api/capture"');
    expect(html).toContain('바로 기억으로 저장');
    expect(html).toContain('data-intake-session-result="applied-memory"');
    expect(html).toContain('data-control="intake-run-session"');
    expect(html).toContain('data-memory-session-outcome-board="guided-ai-session"');
    expect(html).toContain('data-session-outcome-state="idle"');
    expect(html).toContain('data-session-outcome-source-memory=""');
    expect(html).toContain('data-session-outcome-related-count="0"');
    expect(html).toContain('data-session-outcome-citation-count="0"');
    expect(html).toContain('data-session-outcome-save-state="idle"');
    expect(html).toContain('data-session-outcome-saved-memory=""');
    expect(html).toContain('data-session-outcome-step="ask"');
    expect(html).toContain('data-session-outcome-step="replay"');
    expect(html).toContain('data-session-outcome-step="weekly"');
    expect(html).toContain('AI 세션 결과 보드');
    expect(html).toContain('data-intake-flow-tracker="diary-memory-ai"');
    expect(html).toContain('data-intake-flow-step="capture"');
    expect(html).toContain('data-intake-flow-step="graph"');
    expect(html).toContain('data-intake-flow-step="related"');
    expect(html).toContain('data-intake-flow-step="ai"');
    expect(html).toContain('data-intake-flow-step="save"');
    expect(html).toContain('data-intake-graph-status-board="diary-to-graph"');
    expect(html).toContain('data-intake-board-route="waiting"');
    expect(html).toContain('data-intake-board-memory="none"');
    expect(html).toContain('data-intake-board-next-action="write-or-import"');
    expect(html).toContain('data-intake-board-ai-state="idle"');
    expect(html).toContain('data-intake-board-save-state="idle"');
    expect(html).toContain('일기 인입 상태');
    expect(html).toContain('입력 경로 · 대기');
    expect(html).toContain('그래프 기억 · 대기');
    expect(html).toContain('연관 기억 · 0개');
    expect(html).toContain('다음 · 일기를 쓰거나 가져오기');
    expect(html).toContain('data-intake-board-route-label');
    expect(html).toContain('data-intake-board-memory-label');
    expect(html).toContain('data-intake-board-related-label');
    expect(html).toContain('data-intake-board-next-label');
    expect(html).toContain('data-flow-coach="diary-to-memory-ai"');
    expect(html).toContain('data-flow-coach-stage="start"');
    expect(html).toContain('data-flow-coach-next-action="write-or-import"');
    expect(html).toContain('지금 해야 할 일');
    expect(html).toContain('앱 빠른 기록 또는 일기 DB 가져오기부터 시작');
    expect(html).toContain('data-capture-handoff-banner="selected-memory-session"');
    expect(html).toContain('data-capture-handoff-banner-state="idle"');
    expect(html).toContain('data-capture-handoff-related-count="0"');
    expect(html).toContain('data-capture-handoff-saved-memory=""');
    expect(html).toContain('data-capture-handoff-reentry-state="idle"');
    expect(html).toContain('data-control="capture-handoff-run-session"');
    expect(html).toContain('data-control="open-saved-session-memory-graph"');
    expect(html).toContain('data-control="open-saved-session-memory-session"');
    expect(html).toContain('저장된 세션 기억으로 다시 열기');
    expect(html).toContain('방금 저장한 일기');
    expect(html).toContain('data-intake-related-bundle="past-memory-nodes"');
    expect(html).toContain('data-intake-related-bundle-count="0"');
    expect(html).toContain('data-intake-ai-action-result="idle"');
    expect(html).toContain('data-intake-related-bundle-list');
    expect(html).toContain('data-control="intake-run-ask"');
    expect(html).toContain('data-control="intake-run-decision-replay"');
    expect(html).toContain('data-control="intake-run-weekly-report"');
    expect(html).toContain('data-control="intake-save-ai-result"');
    expect(html).toContain('data-intake-ai-save-state="idle"');
    expect(html).toContain('결과를 기억으로 저장');
    expect(html).toContain('관련 과거 기억');
    expect(html).toContain('data-control="intake-preview-notion-diary"');
    expect(html).toContain('data-control="intake-apply-notion-diary"');
    expect(html).toContain('data-control="intake-find-notion-source"');
    expect(html).toContain('data-control="intake-import-notion-diary-db"');
    expect(html).toContain('data-intake-diary-db-name="습관리스트"');
    expect(html).toContain('습관리스트 바로 가져오기');
    expect(html).toContain('data-intake-applied-memory="none"');
    expect(html).toContain('data-intake-next-step="waiting-for-diary"');
    expect(html).toContain('data-control="intake-preview-diary"');
    expect(html).toContain('data-control="intake-apply-diary"');
    expect(html).toContain('오늘의 일기를 바로 붙여넣기');
    expect(html).toContain('미리보기 만들기');
    expect(html).toContain('그래프에 적용');
    expect(html).toContain('data-service-flow="diary-to-second-brain"');
    expect(html).toContain('data-service-flow-step="quick-diary-capture"');
    expect(html).toContain('빠른 일기');
    expect(html).toContain('data-service-flow-step="diary-database-load"');
    expect(html).toContain('일기 DB 가져오기');
    expect(html).toContain('data-service-flow-step="second-brain-graph"');
    expect(html).toContain('내 세컨브레인');
    expect(html).toContain('data-service-flow-step="related-memory-nodes"');
    expect(html).toContain('연관 과거 기억');
    expect(html).toContain('data-service-flow-step="ask-report"');
    expect(html).toContain('AI 고민 세션');
    expect(html).toContain('다시 기억으로 저장');
    expect(html).toContain('data-service-flow-primary-entry="app-or-web-diary"');
    expect(html).toContain('data-service-flow-graph-source="actual-memory-records"');
    expect(html).not.toContain('[data-flow-collapsed="true"] .service-flow-steps');
    expect(html).toContain('data-guided-service-flow="diary-memory-ai"');
    expect(html).toContain('data-guided-flow-current-step="capture"');
    expect(html).toContain('data-flow-focus-switcher="core-workflow"');
    expect(html).toContain('data-flow-focus-current="capture"');
    expect(html).toContain('data-workflow-focus-mode="guided-collapse"');
    expect(html).toContain('data-workflow-active-section="capture"');
    expect(html).toContain('data-workflow-collapsed-section-count="2"');
    expect(html).toContain('data-focus-collapse="enabled"');
    expect(html).toContain('data-flow-focus-action="capture"');
    expect(html).toContain('data-flow-focus-action="graph"');
    expect(html).toContain('data-flow-focus-action="ai"');
    expect(html).toContain('기록부터');
    expect(html).toContain('세컨브레인 보기');
    expect(html).toContain('AI 결과');
    expect(html).toContain('data-flow-focus-label');
    expect(html).toContain('data-flow-focus-summary');
    expect(html).toContain('data-workflow-focus-note');
    expect(html).toContain('data-workflow-next-action');
    expect(html).toContain('현재는 기록 인입 허브만 크게 본다');
    expect(html).toContain('다음 · 일기를 쓰거나 일기 DB를 가져오기');
    expect(html).toContain('data-workflow-section="capture"');
    expect(html).toContain('data-workflow-section-visibility="active"');
    expect(html).toContain('data-workflow-section="graph"');
    expect(html).toContain('data-workflow-section-visibility="collapsed"');
    expect(html).toContain('data-workflow-section="ai"');
    expect(html).toContain('data-guided-flow-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-guided-flow-related-count=');
    expect(html).toContain('data-guided-flow-action="start-capture"');
    expect(html).toContain('data-guided-flow-action="focus-graph"');
    expect(html).toContain('data-guided-flow-action="run-session"');
    expect(html).toContain('data-guided-flow-action="save-result"');
    expect(html).toContain('기록');
    expect(html).toContain('세컨브레인');
    expect(html).toContain('연관 기억');
    expect(html).toContain('미래 기억 저장');
    expect(html).toContain('비공개 기본값');
    expect(html).toContain('내보내기');
    expect(html).toContain('삭제');
    expect(html).not.toContain('public shared memory');

    expect(html).toContain('data-first-run-guide="diary-memory-ai"');
    expect(html).toContain('data-first-run-stage="entry-to-session"');
    expect(html).toContain('data-guide-action="write-diary"');
    expect(html).toContain('data-guide-action="import-diary"');
    expect(html).toContain('data-guide-action="select-memory"');
    expect(html).toContain('data-guide-action="run-ai-session"');
    expect(html).toContain('data-guide-action="save-session"');
    expect(html).toContain('지금 일기 쓰기');
    expect(html).toContain('일기 DB 불러오기');
    expect(html).toContain('그래프에서 기억 고르기');
    expect(html).toContain('AI 세션 실행');
    expect(html).toContain('결과를 기억으로 저장');
    expect(html).toContain('data-flow-current-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-flow-related-memory-count=');
    expect(html).toContain('data-selected-memory-path="graph-related-session"');
    expect(html).toContain('data-selected-memory-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-selected-memory-related-count=');
    expect(html).toContain('선택한 기억');
    expect(html).toContain('연결 이유');
    expect(html).toContain('AI 세션 준비');
    expect(html).toContain('data-selected-path-title');
    expect(html).toContain('data-selected-path-source');
    expect(html).toContain('data-selected-path-related-list');
    expect(html).toContain('data-selected-path-related-memory-id=');
    expect(html).toContain('data-selected-path-related-reason=');
    expect(html).toContain('data-selected-path-action="ask"');
    expect(html).toContain('data-selected-path-action="replay"');
    expect(html).toContain('data-selected-path-action="weekly"');
    expect(html).toContain('data-selected-path-action="session"');
    expect(html).toContain('data-memory-action-rail="selected-graph-to-ai"');
    expect(html).toContain('data-action-rail-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-action-rail-stage="ready"');
    expect(html).toContain('data-action-rail-active-action="none"');
    expect(html).toContain('data-action-rail-save-state="idle"');
    expect(html).toContain('그래프에서 고른 기억');
    expect(html).toContain('과거 기억 묶기');
    expect(html).toContain('AI로 해석');
    expect(html).toContain('미래 기억 저장');
    expect(html).toContain('data-action-rail-step="graph"');
    expect(html).toContain('data-action-rail-step="related"');
    expect(html).toContain('data-action-rail-step="ai"');
    expect(html).toContain('data-action-rail-step="save"');
    expect(html).toContain('data-action-rail-next');
    expect(html).toContain('data-command-rail="selected-memory-actions"');
    expect(html).toContain('data-command-rail-state="ready"');
    expect(html).toContain('data-command-rail-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('선택 기억 바로 실행');
    expect(html).toContain('data-command-rail-action="ask"');
    expect(html).toContain('data-command-rail-action="replay"');
    expect(html).toContain('data-command-rail-action="weekly"');
    expect(html).toContain('data-command-rail-action="session"');
    expect(html).toContain('data-graph-evidence-lens="selected-memory-path"');
    expect(html).toContain('data-graph-lens-selected-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-graph-lens-related-count=');
    expect(html).toContain('data-graph-lens-highlighted-edge-count="0"');
    expect(html).toContain('data-graph-lens-last-action="none"');
    expect(html).toContain('data-graph-lens-citation-count="0"');
    expect(html).toContain('data-graph-lens-save-state="idle"');
    expect(html).toContain('그래프 근거 렌즈');
    expect(html).toContain('data-graph-lens-memory-label');
    expect(html).toContain('data-graph-lens-related-label');
    expect(html).toContain('data-graph-lens-edge-label');
    expect(html).toContain('data-graph-lens-action-label');
    expect(html).toContain('data-graph-lens-citation-label');
    expect(html).toContain('data-graph-lens-next-label');
    expect(html).toContain('data-graph-lens-action="focus-inspector"');
    expect(html).toContain('data-graph-lens-action="run-session"');
    expect(html).toContain('data-memory-path-explainer="selected-memory-related-reasons"');
    expect(html).toContain('data-memory-path-state="ready"');
    expect(html).toContain('기억 연결 경로');
    expect(html).toContain('data-memory-path-hop="current"');
    expect(html).toContain('data-memory-path-hop="shared-reason"');
    expect(html).toContain('data-memory-path-hop="past-memory"');
    expect(html).toContain('data-memory-path-hop="ai-action"');
    expect(html).toContain('data-related-memory-workbench="selected-diary-comparison"');
    expect(html).toContain('data-related-workbench-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-related-workbench-active-memory=');
    expect(html).toContain('data-related-workbench-action="ask"');
    expect(html).toContain('data-related-workbench-action="replay"');
    expect(html).toContain('data-related-workbench-action="weekly"');
    expect(html).toContain('data-related-workbench-action="session"');
    expect(html).toContain('과거 기억 비교');
    expect(html).toContain('비교할 과거 기억');
    expect(html).toContain('data-related-insight-bridge="diary-to-past-memory-actions"');
    expect(html).toContain('data-related-insight-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('왜 이 기억이 떠올랐나');
    expect(html).toContain('data-related-insight-reason-list');
    expect(html).toContain('data-related-insight-action="ask"');
    expect(html).toContain('data-related-insight-action="replay"');
    expect(html).toContain('data-related-insight-action="weekly"');
    expect(html).toContain('과거 기억으로 질문하기');
    expect(html).toContain('data-grounded-action-result="related-memory-ai"');
    expect(html).toContain('data-grounded-action-state="idle"');
    expect(html).toContain('근거 있는 실행 결과');
    expect(html).toContain('data-grounded-action-source');
    expect(html).toContain('data-grounded-action-summary');
    expect(html).toContain('data-grounded-action-save-next');
    expect(html).toContain('data-control="grounded-action-saveback"');
    expect(html).toContain('data-grounded-action-save-state="idle"');
    expect(html).toContain('결과를 미래 기억으로 저장');
    expect(html).toContain('data-selected-ai-action-center="grounded-memory-actions"');
    expect(html).toContain('data-action-center-source="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-action-center-related-count=');
    expect(html).toContain('data-action-center-last-action="none"');
    expect(html).toContain('data-action-center-save-state="idle"');
    expect(html).toContain('선택 기억 AI 실행');
    expect(html).toContain('data-action-center-source-label');
    expect(html).toContain('data-action-center-related-label');
    expect(html).toContain('data-action-center-citation-label');
    expect(html).toContain('data-action-center-save-label');
    expect(html).toContain('data-action-center-state="ask"');
    expect(html).toContain('data-action-center-state="replay"');
    expect(html).toContain('data-action-center-state="weekly"');
    expect(html).toContain('data-action-center-state="session"');
    expect(html).toContain('data-selected-memory-reader="graph-node-body"');
    expect(html).toContain('data-reader-selected-memory="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-reader-related-count=');
    expect(html).toContain('data-reader-last-action="none"');
    expect(html).toContain('선택 기억 원문');
    expect(html).toContain('data-reader-title');
    expect(html).toContain('data-reader-source');
    expect(html).toContain('data-reader-body');
    expect(html).toContain('data-reader-related-label');
    expect(html).toContain('data-reader-action="focus-related"');
    expect(html).toContain('data-reader-action="ask"');
    expect(html).toContain('data-reader-action="session"');

    expect(html).toContain('class="product-rail"');
    expect(html).toContain('빠른 일기 기록');
    expect(html).toContain('기존 기억 가져오기');
    expect(html).toContain('aria-label="App capture prototype"');
    expect(html).toContain('id="fast-diary-capture"');
    expect(html).toContain('data-capture-memory-id="mem_captured_ship_note"');
    expect(html).toContain('앱 기록 프로토타입');
    expect(html).toContain('aria-label="Import preview apply undo"');
    expect(html).toContain('aria-label="Local file import upload"');
    expect(html).toContain('data-import-upload-panel="local-file"');
    expect(html).toContain('data-import-preview-endpoint="/api/import/preview"');
    expect(html).toContain('data-import-apply-endpoint="/api/import/apply"');
    expect(html).toContain('data-import-undo-endpoint="/api/import/undo"');
    expect(html).toContain('data-import-upload-state="idle"');
    expect(html).toContain('id="local-memory-import-files"');
    expect(html).toContain('data-control="local-import-file-input"');
    expect(html).toContain('data-control="local-import-paste-text"');
    expect(html).toContain('data-control="preview-local-import"');
    expect(html).toContain('data-control="apply-local-import"');
    expect(html).toContain('data-control="undo-local-import"');
    expect(html).toContain('data-import-upload-file-count="0"');
    expect(html).toContain('data-import-upload-candidate-count="0"');
    expect(html).toContain('data-import-applied-feedback="local-upload"');
    expect(html).toContain('data-import-applied-count="0"');
    expect(html).toContain('data-import-applied-memory-list');
    expect(html).toContain('Markdown, JSON, Obsidian 내보내기');
    expect(html).toContain('가져오기 적용');
    expect(html).toContain('되돌리기');
    expect(html).toContain('data-import-duplicate-state="duplicate"');
    expect(html).toContain('data-import-duplicate-state="new"');

    expect(html).toContain('data-ask-answer-contract="citations-or-insufficient-evidence"');
    expect(html).toContain('data-insufficient-evidence-state="available"');
    expect(html).toContain('aria-label="과거의 나에게 묻기 인용"');
    expect(html).toContain('href="#evidence-mem_launch_may_anxiety_scope_delay"');

    expect(html).toContain('data-replay-outcome="그래프 필터를 더 붙인 뒤 출시가 이틀 늦어졌다"');
    expect(html).toContain('data-replay-citation-id="mem_launch_may_anxiety_scope_delay"');

    expect(html).toContain('주간 패턴');
    expect(html).toContain('aria-label="주간 패턴 인용 기억 요약"');
    expect(html).toContain('data-weekly-report-id="weekly_report_2026-05-01_2026-05-20"');
    expect(html).toContain('data-weekly-report-generated-at="2026-05-27T11:00:00.000Z"');
    expect(html).toContain('data-weekly-report-endpoint="/api/report/weekly"');
    expect(html).toContain('data-weekly-report-window-start="2026-05-01"');
    expect(html).toContain('data-weekly-report-window-end="2026-05-20"');
    expect(html).toContain('data-weekly-included-memory-count="3"');
    expect(html).toContain('aria-label="주간 패턴 포함 기억"');
    expect(html).toContain('2026-05-01 ~ 2026-05-20');
    expect(html).toContain('data-weekly-aggregate-kind="emotions"');
    expect(html).toContain('data-weekly-aggregate-value="anxiety"');
    expect(html).toContain('data-weekly-pattern-id="pattern_anxiety_scope_expansion_launch_delay"');
    expect(html).toContain('주간 범위 안에 최소 2개의 MemoryRecord 인용이 필요하다.');
    expect(html).toContain('data-pattern-memory-id="mem_launch_may_anxiety_scope_delay"');
    expect(html).toContain('data-pattern-memory-id="mem_launch_june_anxiety_scope_delay"');

    expect(html).toContain('연결 이유');
    expect(html).toContain('data-evidence-source=');
    expect(html).toContain('data-evidence-date=');
    expect(html).toContain('data-evidence-raw-excerpt=');

    expect(html).toContain('aria-label="개인 보관함 내보내기와 삭제 제어"');
    expect(html).toContain('data-privacy-scope="private"');
    expect(html).toContain('data-vault-access="owner-only"');
    expect(html).toContain('data-storage-mode="local-prototype"');
    expect(html).toContain('data-local-durable-store="unknown"');
    expect(html).toContain('data-auth-status="not-connected-local-prototype"');
    expect(html).toContain('data-transport-status="local-only-static-prototype"');
    expect(html).toContain('data-export-endpoint="/api/export"');
    expect(html).toContain('data-export-filename="personal-memory-export-local-user-2026-05-27.json"');
    expect(html).toContain('data-delete-selected-ids="mem_freeze_vs_feature_addition"');
    expect(html).toContain('data-hard-delete-confirmation="DELETE MY PRIVATE MEMORY VAULT"');
    expect(html).toContain('GET /api/export');
    expect(html).toContain('POST /api/delete');
  });

  test('keeps Decision Replay evidence in the hidden ledger while removing dashboard panels from the first impression', () => {
    const shell = buildInitialAppShellEvidenceLayout();
    const html = renderAppShellHtml();

    expect(html).toContain('<label for="decision-replay-current">지금 결정</label>');
    expect(html).toContain('id="decision-replay-current"');
    expect(html).toContain('오늘 MVP를 보여줄까, 아니면 결정 되짚기 화면을 더 다듬을까?');
    expect(html).toContain('결정 되짚기');
    expect(html).toContain('패턴 감지');
    expect(html).toContain('data-replay-memory-id="mem_launch_may_anxiety_scope_delay"');
    expect(html).toContain('data-replay-memory-id="mem_launch_june_anxiety_scope_delay"');
    expect(html).toContain(
      '<a href="#evidence-mem_launch_may_anxiety_scope_delay" class="citation-ref" data-citation-ref="mem_launch_may_anxiety_scope_delay">[mem_launch_may_anxiety_scope_delay]</a>',
    );

    for (const highlightId of shell.replay.graphHighlightIds.slice(0, 5)) {
      expect(html).toContain(`data-highlight-id="${highlightId}"`);
    }
    for (const citationId of shell.replay.citationMemoryIds.slice(0, 2)) {
      expect(html).toContain(`id="evidence-${citationId}"`);
    }
  });

  test('exports a complete responsive document for screenshot evidence', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('<!doctype html>');
    expect(documentHtml).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    expect(documentHtml).toContain('.second-brain-shell');
    expect(documentHtml).toContain('background: #080808;');
    expect(documentHtml).toContain('data-rail-mode="collapsed-evidence-drawer"');
    expect(documentHtml).toContain('transform: none;');
    expect(documentHtml).toContain('개인 기억 AI 세컨브레인');
    expect(documentHtml).toContain('data-graph-control-script="pmi019"');
    expect(documentHtml).toContain('vendor/cytoscape.min.js');
    expect(documentHtml).toContain('.second-brain-shell[data-graph-renderer="cytoscape"] .graph-workspace');
    expect(documentHtml).toContain('visibility: hidden;');
    expect(documentHtml).toContain('const initializeCytoscapeGraph = () =>');
    expect(documentHtml).toContain("label: 'data(graphLabel)'");
    expect(documentHtml).toContain("'text-wrap': 'wrap'");
    expect(documentHtml).toContain("selector: '.labels-hidden'");
    expect(documentHtml).toContain('const setCytoscapeLabelVisibility = (hidden) =>');
    expect(documentHtml).toContain('cytoscapeGraph.center(selectedNode)');
    expect(documentHtml).toContain("shell.setAttribute('data-graph-renderer', 'cytoscape')");
    expect(documentHtml).toContain('data-inspector-panel="pmi015"');
    expect(documentHtml).toContain('data-wiki-compiler="pmi017"');
    expect(documentHtml).toContain('원자 기억');
    expect(documentHtml).toContain('const selectMemory = (node) =>');
    expect(documentHtml).toContain('const memoryIntakeHub = document.querySelector');
    expect(documentHtml).toContain('const intakeDiaryDraft = document.querySelector');
    expect(documentHtml).toContain('const intakePreviewDiaryButton = document.querySelector');
    expect(documentHtml).toContain('const intakeApplyDiaryButton = document.querySelector');
    expect(documentHtml).toContain('intakeActions.forEach((button) =>');
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-last-action'");
    expect(documentHtml).toContain("const diaryInbox = document.querySelector('[data-diary-inbox=\"app-web-diary-sources\"]')");
    expect(documentHtml).toContain("const guidedServiceFlow = document.querySelector('[data-guided-service-flow=\"diary-memory-ai\"]')");
    expect(documentHtml).toContain("const prototypeJourneyCockpit = document.querySelector('[data-prototype-journey-cockpit=\"diary-memory-ai\"]')");
    expect(documentHtml).toContain('const updatePrototypeJourneyCockpit = (detail = {}) =>');
    expect(documentHtml).toContain("prototypeJourneyCockpit?.setAttribute('data-journey-current-step'");
    expect(documentHtml).toContain("prototypeJourneyCockpit?.setAttribute('data-journey-selected-memory'");
    expect(documentHtml).toContain("prototypeJourneyCockpit?.setAttribute('data-journey-next-action'");
    expect(documentHtml).toContain("const updateGuidedServiceFlow = (step, detail = {}) =>");
    expect(documentHtml).toContain("guidedServiceFlow?.setAttribute('data-guided-flow-current-step', step)");
    expect(documentHtml).toContain('guidedFlowSteps.forEach((item) =>');
    expect(documentHtml).toContain("updateGuidedServiceFlow('related'");
    expect(documentHtml).toContain("updateGuidedServiceFlow('ai'");
    expect(documentHtml).toContain("updateGuidedServiceFlow('save'");
    expect(documentHtml).toContain("diaryInbox?.setAttribute('data-diary-inbox-active-memory', citation)");
    expect(documentHtml).toContain("diaryInboxItems.forEach((item) =>");
    expect(documentHtml).toContain("setInteractionState('diary-inbox-memory-selected')");
    expect(documentHtml).toContain("importPasteText.value = intakeDiaryDraft.value");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-draft-state', 'preview-requested')");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-draft-state', 'apply-requested')");
    expect(documentHtml).toContain('let pendingIntakeApplyAfterPreview = false');
    expect(documentHtml).toContain('pendingIntakeApplyAfterPreview = true');
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-draft-state', 'applied')");
    expect(documentHtml).toContain('importApplyButton?.click()');
    expect(documentHtml).toContain("timelinePanel?.querySelectorAll('[data-control=\"timeline-select-memory\"]')");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-applied-memory', appliedMemoryId)");
    expect(documentHtml).toContain('const quickSaveIntakeDiary = async () =>');
    expect(documentHtml).toContain("fetch('/api/capture'");
    expect(documentHtml).toContain("sourceRef: 'web-first-screen://diary-intake'");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-quick-save-state', 'saved')");
    expect(documentHtml).toContain("setInteractionState('intake-quick-diary-saved')");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-next-step', 'memory-session-ready')");
    expect(documentHtml).toContain('const setIntakeFlowStepState =');
    expect(documentHtml).toContain("const intakeGraphStatusBoard = document.querySelector('[data-intake-graph-status-board=\"diary-to-graph\"]')");
    expect(documentHtml).toContain('const updateIntakeGraphStatusBoard = (detail = {}) =>');
    expect(documentHtml).toContain("intakeGraphStatusBoard?.setAttribute('data-intake-board-route'");
    expect(documentHtml).toContain("intakeGraphStatusBoard?.setAttribute('data-intake-board-memory'");
    expect(documentHtml).toContain("intakeGraphStatusBoard?.setAttribute('data-intake-board-next-action'");
    expect(documentHtml).toContain("intakeGraphStatusBoard?.setAttribute('data-intake-board-ai-state'");
    expect(documentHtml).toContain("const koreanAiWorkbench = document.querySelector('[data-korean-ai-workbench=\"selected-or-imported-memory\"]')");
    expect(documentHtml).toContain('const updateKoreanAiWorkbench = (detail = {}) =>');
    expect(documentHtml).toContain("koreanAiWorkbench?.setAttribute('data-workbench-selected-memory'");
    expect(documentHtml).toContain("koreanAiWorkbench?.setAttribute('data-workbench-last-action'");
    expect(documentHtml).toContain("koreanAiWorkbench?.setAttribute('data-workbench-next-action'");
    expect(documentHtml).toContain("workbenchActions.forEach((button) =>");
    expect(documentHtml).toContain("const useNowRouteBoard = document.querySelector('[data-use-now-route-board=\"live\"]')");
    expect(documentHtml).toContain('const updateUseNowRouteBoard = (detail = {}) =>');
    expect(documentHtml).toContain("useNowRouteBoard?.setAttribute('data-use-now-route-state'");
    expect(documentHtml).toContain("useNowRouteBoard?.setAttribute('data-use-now-route-memory'");
    expect(documentHtml).toContain("useNowRouteBoard?.setAttribute('data-use-now-route-related-count'");
    expect(documentHtml).toContain("useNowRouteBoard?.setAttribute('data-use-now-route-ai-state'");
    expect(documentHtml).toContain("useNowRouteBoard?.setAttribute('data-use-now-route-save-state'");
    expect(documentHtml).toContain("useNowRouteBoard?.setAttribute('data-use-now-route-reentry-state'");
    expect(documentHtml).toContain("useNowRoutePath?.setAttribute('data-use-now-route-path-state'");
    expect(documentHtml).toContain("useNowRoutePath?.setAttribute('data-use-now-route-path-source', citation)");
    expect(documentHtml).toContain("useNowRoutePathReason.textContent = related.length ? related[0].reason : '연결 이유 없음'");
    expect(documentHtml).toContain("const reentryState = saveState === 'saved' && selectedMemory ? 'ready' : 'disabled'");
    expect(documentHtml).toContain("shell.setAttribute('data-use-now-route-state'");
    expect(documentHtml).toContain("updateUseNowRouteBoard({");
    expect(documentHtml).toContain("state: state === 'completed' ? 'ai-workbench'");
    expect(documentHtml).toContain("aiState: state === 'completed' ? 'answered'");
    expect(documentHtml).toContain("saveState: state === 'completed' ? 'ready'");
    expect(documentHtml).toContain("sourceMemoryId: savedMemoryId || 'saved-memory'");
    expect(documentHtml).toContain("aiState: 'saved'");
    expect(documentHtml).toContain("saveState: 'saved'");
    expect(documentHtml).toContain("useNowRouteActions.forEach((button) =>");
    expect(documentHtml).toContain("if (action === 'open-saved-memory')");
    expect(documentHtml).toContain('selectHandoffMemoryFromGraph(savedMemoryId)');
    expect(documentHtml).toContain("setInteractionState('use-now-route-saved-memory-opened')");
    expect(documentHtml).toContain('const updateFlowCoach =');
    expect(documentHtml).toContain("flowCoach?.setAttribute('data-flow-coach-stage', stage)");
    expect(documentHtml).toContain("flowCoach?.setAttribute('data-flow-coach-next-action', nextAction)");
    expect(documentHtml).toContain("'graph-ready'");
    expect(documentHtml).toContain("'ai-ready'");
    expect(documentHtml).toContain("'saved'");
    expect(documentHtml).toContain('const updateCaptureHandoffBanner =');
    expect(documentHtml).toContain('const updateCaptureHandoffReentry =');
    expect(documentHtml).toContain("captureHandoffBanner?.setAttribute('data-capture-handoff-banner-state', state)");
    expect(documentHtml).toContain("captureHandoffBanner?.setAttribute('data-capture-handoff-saved-memory', savedMemoryId)");
    expect(documentHtml).toContain("captureHandoffSavedGraphLink?.setAttribute('href', graphUrl)");
    expect(documentHtml).toContain("captureHandoffSavedSessionLink?.setAttribute('href', sessionUrl)");
    expect(documentHtml).toContain("captureHandoffRunSessionButton?.addEventListener('click'");
    expect(documentHtml).toContain("updateCaptureHandoffBanner('session-running'");
    expect(documentHtml).toContain("updateCaptureHandoffBanner('session-completed'");
    expect(documentHtml).toContain("updateCaptureHandoffBanner('session-saved'");
    expect(documentHtml).toContain('updateCaptureHandoffReentry(savedMemoryId)');
    expect(documentHtml).toContain("captureHandoffBanner?.setAttribute('data-capture-handoff-save-state'");
    expect(documentHtml).toContain("updateCaptureHandoffBanner('ready'");
    expect(documentHtml).toContain("setIntakeFlowStepState('graph', 'done')");
    expect(documentHtml).toContain("setIntakeFlowStepState('related', related.length ? 'ready' : 'loading')");
    expect(documentHtml).toContain("setIntakeFlowStepState('ai', state === 'answered' ? 'done'");
    expect(documentHtml).toContain("setIntakeFlowStepState('save', 'done')");
    expect(documentHtml).toContain('const renderIntakeRelatedBundle = () =>');
    expect(documentHtml).toContain("intakeRelatedBundle?.setAttribute('data-intake-related-bundle-count'");
    expect(documentHtml).toContain("intakeRelatedBundleList.replaceChildren");
    expect(documentHtml).toContain("intakeRunAskButton?.addEventListener('click'");
    expect(documentHtml).toContain("intakeRunReplayButton?.addEventListener('click'");
    expect(documentHtml).toContain("intakeRunWeeklyButton?.addEventListener('click'");
    expect(documentHtml).toContain('const setIntakeAiActionState = (kind, state, message) =>');
    expect(documentHtml).toContain("setIntakeAiActionState('ask', 'loading'");
    expect(documentHtml).toContain('await askSecondBrain()');
    expect(documentHtml).toContain("setIntakeAiActionState('replay', 'answered'");
    expect(documentHtml).toContain('await replayCurrentDecision()');
    expect(documentHtml).toContain("setIntakeAiActionState('weekly', 'answered'");
    expect(documentHtml).toContain('await refreshWeeklyReport()');
    expect(documentHtml).toContain('const saveLatestIntakeAiResult = () =>');
    expect(documentHtml).toContain("intakeSaveAiResultButton?.addEventListener('click'");
    expect(documentHtml).toContain("targetSaveButton?.click()");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-ai-save-state', 'saved')");
    expect(documentHtml).toContain("intakeRunSessionButton?.removeAttribute('disabled')");
    expect(documentHtml).toContain("intakeRunSessionButton?.addEventListener('click'");
    expect(documentHtml).toContain("intakeSessionResult?.setAttribute('data-intake-saved-session-memory', savedMemoryId)");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-result', 'session-saved')");
    expect(documentHtml).toContain("memorySessionSaveButton.textContent = '세션 저장 완료'");
    expect(documentHtml).toContain("const diaryGraphHandoffMap = document.querySelector('[data-diary-graph-handoff-map=\"app-web-notion-to-graph\"]')");
    expect(documentHtml).toContain('const updateDiaryGraphHandoffMap = (detail = {}) =>');
    expect(documentHtml).toContain("diaryGraphHandoffMap?.setAttribute('data-handoff-active-route'");
    expect(documentHtml).toContain("diaryGraphHandoffMap?.setAttribute('data-handoff-stage'");
    expect(documentHtml).toContain("setHandoffRouteState(detail.route || 'web-paste-diary'");
    expect(documentHtml).toContain("updateDiaryGraphHandoffMap({ route: 'web-paste-diary', stage: 'applied'");
    expect(documentHtml).toContain("updateDiaryGraphHandoffMap({ route: 'notion-diary-db', stage: 'notion-ready'");
    expect(documentHtml).toContain("updateDiaryGraphHandoffMap({ stage: 'session-saved'");
    expect(documentHtml).not.toContain("memorySessionSaveButton.textContent = 'Session saved'");
    expect(documentHtml).toContain('let pendingIntakeNotionApplyAfterPreview = false');
    expect(documentHtml).toContain('pendingIntakeNotionApplyAfterPreview = true');
    expect(documentHtml).toContain("setIntakeNotionState('token-required')");
    expect(documentHtml).toContain("setIntakeNotionState('source-required')");
    expect(documentHtml).toContain("setIntakeNotionState('sources-ready'");
    expect(documentHtml).toContain("memoryIntakeHub?.setAttribute('data-intake-selected-notion-source'");
    expect(documentHtml).toContain('const importNotionDiaryDatabase = async () =>');
    expect(documentHtml).toContain("setOneClickNotionState('searching')");
    expect(documentHtml).toContain("setOneClickNotionState('imported')");
    expect(documentHtml).toContain("setInteractionState('intake-notion-diary-imported')");
    expect(documentHtml).toContain("intakeFindNotionSourceButton?.addEventListener('click'");
    expect(documentHtml).toContain("setInteractionState('intake-notion-diary-apply-requested')");
    expect(documentHtml).toContain("setInteractionState('intake-paste-diary-focused')");
    expect(documentHtml).toContain("setInteractionState('intake-notion-diary-ready')");
    expect(documentHtml).toContain('const applyMemorySearch = (query) =>');
    expect(documentHtml).toContain("node.setAttribute('data-search-match', String(match))");
    expect(documentHtml).toContain("result.addEventListener('click'");
    expect(documentHtml).toContain("inspectorCitations.setAttribute('data-inspector-selected-citation', citation)");
    expect(documentHtml).toContain("shell.setAttribute('data-active-memory', citation)");
    expect(documentHtml).toContain("shell.setAttribute('data-filter-' + kind");
    expect(documentHtml).toContain("target.setAttribute('data-filter-active', String(nextActive))");
    expect(documentHtml).toContain("shell.setAttribute('data-layout-version', String(layoutVersion))");
    expect(documentHtml).toContain("inspector.setAttribute('data-selected-memory', citation)");
    expect(documentHtml).toContain("edge.setAttribute('data-edge-active', String(active))");
    expect(documentHtml).toContain('data-related-memory-strip="selected-node"');
    expect(documentHtml).toContain('data-selected-memory-path="graph-related-session"');
    expect(documentHtml).toContain('const renderRelatedMemoryEvidence = (citation) =>');
    expect(documentHtml).toContain("chip.setAttribute('data-related-memory-id', item.id)");
    expect(documentHtml).toContain("selectedPathPanel.setAttribute('data-selected-memory-source', citation)");
    expect(documentHtml).toContain("commandRail?.setAttribute('data-command-rail-source', citation)");
    expect(documentHtml).toContain("commandRail?.setAttribute('data-command-rail-related-count', String(related.length))");
    expect(documentHtml).toContain("commandRailTitle.textContent = '선택 기억 바로 실행'");
    expect(documentHtml).toContain('commandRailActions.forEach((button) =>');
    expect(documentHtml).toContain("memoryPathExplainer?.setAttribute('data-memory-path-source', citation)");
    expect(documentHtml).toContain("memoryPathExplainer?.setAttribute('data-memory-path-related-count', String(related.length))");
    expect(documentHtml).toContain("memoryPathPast.textContent = related.length ? related[0].label : '연관 과거 기억 없음'");
    expect(documentHtml).toContain("pathChip.setAttribute('data-selected-path-related-memory-id', item.id)");
    expect(documentHtml).toContain("const relatedMemoryWorkbench = document.querySelector('[data-related-memory-workbench=\"selected-diary-comparison\"]')");
    expect(documentHtml).toContain("const selectedMemoryReader = document.querySelector('[data-selected-memory-reader=\"graph-node-body\"]')");
    expect(documentHtml).toContain('const updateSelectedMemoryReader = (detail = {}) =>');
    expect(documentHtml).toContain("selectedMemoryReader?.setAttribute('data-reader-selected-memory'");
    expect(documentHtml).toContain("selectedMemoryReader?.setAttribute('data-reader-related-count'");
    expect(documentHtml).toContain("selectedMemoryReaderActions.forEach((button) =>");
    expect(documentHtml).toContain("const memorySessionOutcomeBoard = document.querySelector('[data-memory-session-outcome-board=\"guided-ai-session\"]')");
    expect(documentHtml).toContain('const updateMemorySessionOutcomeBoard = (detail = {}) =>');
    expect(documentHtml).toContain("memorySessionOutcomeBoard?.setAttribute('data-session-outcome-source-memory'");
    expect(documentHtml).toContain("memorySessionOutcomeBoard?.setAttribute('data-session-outcome-save-state'");
    expect(documentHtml).toContain('const setMemorySessionOutcomeStep = (step, state) =>');
    expect(documentHtml).toContain('setMemorySessionOutcomeStep(step, state)');
    expect(documentHtml).toContain("const flowFocusSwitcher = document.querySelector('[data-flow-focus-switcher=\"core-workflow\"]')");
    expect(documentHtml).toContain("const flowFocusNote = flowFocusSwitcher?.querySelector('[data-workflow-focus-note]')");
    expect(documentHtml).toContain("const flowFocusNextAction = flowFocusSwitcher?.querySelector('[data-workflow-next-action]')");
    expect(documentHtml).toContain('const setWorkflowFocus = (focus) =>');
    expect(documentHtml).toContain('const updateWorkflowFocusSummary = (focus) =>');
    expect(documentHtml).toContain("shell.setAttribute('data-workflow-focus', focus)");
    expect(documentHtml).toContain("shell.setAttribute('data-workflow-active-section', focus)");
    expect(documentHtml).toContain("shell.setAttribute('data-workflow-collapsed-section-count', String(collapsedCount))");
    expect(documentHtml).toContain("workflowSections.forEach((section) =>");
    expect(documentHtml).toContain("section.setAttribute('data-workflow-section-visibility', isActive ? 'active' : 'collapsed')");
    expect(documentHtml).toContain("flowFocusActions.forEach((button) =>");
    expect(documentHtml).toContain("memoryIntakeHub?.getAttribute('data-intake-applied-memory')");
    expect(documentHtml).toContain("intakeRelatedBundle?.querySelectorAll('[data-intake-related-memory-id]')");
    expect(documentHtml).toContain("const context = getIntakeMemorySessionContext()");
    expect(documentHtml).toContain("setWorkflowFocus('ai')");
    expect(documentHtml).toContain("setMemorySessionState('completed', context)");
    expect(documentHtml).toContain("const graphEvidenceLens = document.querySelector('[data-graph-evidence-lens=\"selected-memory-path\"]')");
    expect(documentHtml).toContain('const updateGraphEvidenceLens = (detail = {}) =>');
    expect(documentHtml).toContain("graphEvidenceLens?.setAttribute('data-graph-lens-selected-memory'");
    expect(documentHtml).toContain("graphEvidenceLens?.setAttribute('data-graph-lens-highlighted-edge-count'");
    expect(documentHtml).toContain("graphEvidenceLens?.setAttribute('data-graph-lens-last-action'");
    expect(documentHtml).toContain('renderRelatedMemoryWorkbench(citation, related)');
    expect(documentHtml).toContain("workbenchItem.setAttribute('data-related-workbench-memory-id', item.id)");
    expect(documentHtml).toContain('setActiveRelatedWorkbenchMemory(item.id)');
    expect(documentHtml).toContain("relatedMemoryWorkbench?.setAttribute('data-related-workbench-active-memory', memoryId)");
    expect(documentHtml).toContain("shell.setAttribute('data-selected-path-source-memory', citation)");
    expect(documentHtml).toContain("selectedPathActions.forEach((button) =>");
    expect(documentHtml).toContain("shell.setAttribute('data-related-memory-source', citation)");
    expect(documentHtml).toContain("shell.setAttribute('data-related-memory-count', String(related.length))");
    expect(documentHtml).toContain("relatedInsightBridge?.setAttribute('data-related-insight-source', citation)");
    expect(documentHtml).toContain('relatedInsightReasonList.replaceChildren()');
    expect(documentHtml).toContain("reasonCard.setAttribute('data-related-insight-memory-id', item.id)");
    expect(documentHtml).toContain("setInteractionState('related-insight-ask-ready')");
    expect(documentHtml).toContain("const selectedAiActionCenter = document.querySelector('[data-selected-ai-action-center=\"grounded-memory-actions\"]')");
    expect(documentHtml).toContain("const memoryActionRail = document.querySelector('[data-memory-action-rail=\"selected-graph-to-ai\"]')");
    expect(documentHtml).toContain('const updateMemoryActionRail = (detail = {}) =>');
    expect(documentHtml).toContain("memoryActionRail?.setAttribute('data-action-rail-source'");
    expect(documentHtml).toContain("memoryActionRail?.setAttribute('data-action-rail-stage'");
    expect(documentHtml).toContain("memoryActionRail?.setAttribute('data-action-rail-active-action'");
    expect(documentHtml).toContain("memoryActionRail?.setAttribute('data-action-rail-save-state'");
    expect(documentHtml).toContain("setActionRailStepState('ai'");
    expect(documentHtml).toContain('const updateSelectedAiActionCenter = (detail = {}) =>');
    expect(documentHtml).toContain("selectedAiActionCenter?.setAttribute('data-action-center-source'");
    expect(documentHtml).toContain("selectedAiActionCenter?.setAttribute('data-action-center-last-action'");
    expect(documentHtml).toContain("selectedAiActionCenter?.setAttribute('data-action-center-save-state'");
    expect(documentHtml).toContain("setActionCenterStepState(detail.lastAction || 'none'");
    expect(documentHtml).toContain("const groundedActionResult = document.querySelector('[data-grounded-action-result=\"related-memory-ai\"]')");
    expect(documentHtml).toContain('const renderGroundedActionResult = (kind, context, citationCount) =>');
    expect(documentHtml).toContain("groundedActionResult?.setAttribute('data-grounded-action-state', 'ready')");
    expect(documentHtml).toContain("groundedActionResult?.setAttribute('data-grounded-action-kind', kind)");
    expect(documentHtml).toContain("const groundedActionSaveback = document.querySelector('[data-control=\"grounded-action-saveback\"]')");
    expect(documentHtml).toContain("groundedActionResult?.setAttribute('data-grounded-action-save-state', 'saved')");
    expect(documentHtml).toContain("groundedActionResult?.setAttribute('data-grounded-action-saved-memory'");
    expect(documentHtml).toContain("setInteractionState('grounded-action-result-saved')");
    expect(documentHtml).toContain("cytoscapeGraph.elements().removeClass('related-memory related-facet related-edge')");
    expect(documentHtml).toContain("candidate.addClass('related-memory')");
    expect(documentHtml).toContain("facetNode.addClass('related-facet')");
    expect(documentHtml).toContain("shell.setAttribute('data-related-memory-highlighted-edge-count'");
    expect(documentHtml).toContain('data-control="ask-with-related-memory-context"');
    expect(documentHtml).toContain('data-control="replay-with-related-memory-context"');
    expect(documentHtml).toContain('data-control="report-with-related-memory-context"');
    expect(documentHtml).toContain('const askWithRelatedMemoryContext = () =>');
    expect(documentHtml).toContain('const replayWithRelatedMemoryContext = () =>');
    expect(documentHtml).toContain('const reportWithRelatedMemoryContext = () =>');
    expect(documentHtml).toContain("lastAskFollowUpContext = {");
    expect(documentHtml).toContain("shell.setAttribute('data-ask-context-source-memory'");
    expect(documentHtml).toContain("shell.setAttribute('data-replay-context-source-memory'");
    expect(documentHtml).toContain("shell.setAttribute('data-weekly-context-source-memory'");
    expect(documentHtml).toContain("setInteractionState('ask-context-seeded-from-related-memories')");
    expect(documentHtml).toContain("setInteractionState('replay-context-seeded-from-related-memories')");
    expect(documentHtml).toContain("setInteractionState('weekly-context-seeded-from-related-memories')");
    expect(documentHtml).toContain('renderRelatedMemoryEvidence(citation)');
    expect(documentHtml).toContain("shell.setAttribute('data-labels', hidden ? 'visible' : 'hidden')");
    expect(documentHtml).toContain("setSpacing('normal')");
    expect(documentHtml).toContain('const buildLocalImportCandidates =');
    expect(documentHtml).toContain("importUploadPanel.setAttribute('data-import-upload-state', 'preview-ready')");
    expect(documentHtml).toContain("fetch(importPreviewEndpoint");
    expect(documentHtml).toContain("fetch(importApplyEndpoint");
    expect(documentHtml).toContain("fetch(importUndoEndpoint");
    expect(documentHtml).toContain('const renderAppliedImportFeedback =');
    expect(documentHtml).toContain('const renderUndoneImportFeedback =');
    expect(documentHtml).toContain("timelinePanel.setAttribute('data-timeline-entry-count'");
    expect(documentHtml).toContain("shell.setAttribute('data-import-applied-memory-ids'");
    expect(documentHtml).toContain("shell.setAttribute('data-import-undone-count'");
    expect(documentHtml).toContain("importUploadPanel.setAttribute('data-import-upload-state', 'undone')");
    expect(documentHtml).toContain("fetch('/health/live'");
    expect(documentHtml).toContain("privacyControlPanel.setAttribute('data-local-durable-store'");
    expect(documentHtml).toContain("fetch('/api/app-shell'");
    expect(documentHtml).toContain("shell.setAttribute('data-graph-rehydrate-state', 'ready')");
    expect(documentHtml).toContain("shell.setAttribute('data-rehydrated-memory-node-count'");
    expect(documentHtml).toContain("notionImportPanel.setAttribute('data-notion-sources-state', 'source-required')");
    expect(documentHtml).toContain("notionImportPanel.setAttribute('data-notion-import-state', 'source-required')");
    expect(documentHtml).toContain("setIntakeNotionState('source-required')");
    expect(documentHtml).toContain('const previewRecords = Array.isArray(lastLocalImportPreview.records)');
    expect(documentHtml).toContain("let lastLocalImportPreviewKind = 'idle'");
    expect(documentHtml).toContain("const previewKind = pendingIntakeApplyAfterPreview ? 'manual-diary' : 'local-upload'");
    expect(documentHtml).toContain("lastLocalImportPreviewKind = previewKind");
    expect(documentHtml).toContain("lastLocalImportPreviewKind = 'notion-diary'");
    expect(documentHtml).toContain('const applyKind = lastLocalImportPreviewKind');
    expect(documentHtml).toContain('renderAppliedImportFeedback(createdMemoryIds, graphEvidenceRecords)');
    expect(documentHtml).toContain('memoryNodes.slice(0, 3).map');
    expect(documentHtml).toContain("item.setAttribute('data-timeline-active', index === 0 ? 'true' : 'false')");
    expect(documentHtml).toContain("shell.setAttribute('data-ask-state', 'answered')");
    expect(documentHtml).toContain("shell.setAttribute('data-replay-state', 'answered')");
    expect(documentHtml).toContain("shell.setAttribute('data-weekly-report-state', 'ready')");
    expect(documentHtml).toContain('const getIntakeMemorySessionContext =');
    expect(documentHtml).toContain('void runMemorySession(context).then(() =>');
    expect(documentHtml).toContain("shell.setAttribute('data-graph-rehydrate-state', 'ready')");
    expect(documentHtml).toContain("shell.setAttribute('data-graph-rebuild-state', 'rebuilt')");
    expect(documentHtml).toContain('const handoffQueryParams = new URLSearchParams(window.location.search)');
    expect(documentHtml).toContain("const handoffMemoryId = handoffQueryParams.get('memory')");
    expect(documentHtml).toContain("const handoffStartMode = handoffQueryParams.get('start')");
    expect(documentHtml).toContain('const selectHandoffMemoryFromGraph =');
    expect(documentHtml).toContain("shell.setAttribute('data-capture-handoff-selected-memory'");
    expect(documentHtml).toContain("shell.setAttribute('data-capture-handoff-state', 'selected')");
    expect(documentHtml).toContain("shell.setAttribute('data-capture-handoff-start-mode', 'session')");
    expect(documentHtml).toContain("shell.setAttribute('data-capture-handoff-session-state', 'ready')");
    expect(documentHtml).toContain("updateCaptureHandoffBanner('session-ready'");
    expect(documentHtml).toContain("setInteractionState('capture-handoff-selected')");
    expect(documentHtml).toContain("setInteractionState('diary-import-focused')");
    expect(documentHtml).toContain('prepareHandoffSessionFromQuery()');
    expect(documentHtml).toContain('selectHandoffMemoryFromGraph(handoffMemoryId)');
    expect(documentHtml).toContain('data-live-count="memory-nodes"');
    expect(documentHtml).toContain('liveCountTargets.memoryNodes');
    expect(documentHtml).toContain("searchCount.textContent = String(appShell.primaryNodes?.length || 0)");
    expect(documentHtml).toContain('fetch(memorySearchEndpoint');
    expect(documentHtml).toContain('renderLiveMemorySearchResults');
    expect(documentHtml).toContain("shell.setAttribute('data-search-mode', 'remote')");
    expect(documentHtml).toContain('fetch(askEndpoint');
    expect(documentHtml).toContain('renderLiveAskResult');
    expect(documentHtml).toContain("shell.setAttribute('data-ask-state', 'answered')");
    expect(documentHtml).toContain("shell.setAttribute('data-ask-citation-count'");
    expect(documentHtml).toContain('const highlightLiveAskCitations =');
    expect(documentHtml).toContain("shell.setAttribute('data-live-ask-highlighted-memory-count'");
    expect(documentHtml).toContain("shell.setAttribute('data-live-ask-highlighted-memories'");
    expect(documentHtml).toContain("cytoscapeGraph.elements().removeClass('ask-citation-memory ask-citation-edge')");
    expect(documentHtml).toContain("cytoscapeGraph.getElementById('memory:' + citation)");
    expect(documentHtml).toContain("memoryNode.addClass('ask-citation-memory')");
    expect(documentHtml).toContain("setInteractionState('ask-citation-path-highlighted')");
    expect(documentHtml).toContain('data-replay-endpoint="/api/replay"');
    expect(documentHtml).toContain('data-control="run-decision-replay"');
    expect(documentHtml).toContain('const replayCurrentDecision = async () =>');
    expect(documentHtml).toContain('fetch(replayEndpoint');
    expect(documentHtml).toContain('const renderLiveReplayResult =');
    expect(documentHtml).toContain('const highlightLiveReplayCitations =');
    expect(documentHtml).toContain("shell.setAttribute('data-replay-state', 'answered')");
    expect(documentHtml).toContain("shell.setAttribute('data-live-replay-highlighted-memory-count'");
    expect(documentHtml).toContain("memoryNode.addClass('replay-citation-memory')");
    expect(documentHtml).toContain("setInteractionState('replay-citation-path-highlighted')");
    expect(documentHtml).toContain('data-control="refresh-weekly-report"');
    expect(documentHtml).toContain('const refreshWeeklyReport = async () =>');
    expect(documentHtml).toContain('fetch(weeklyReportEndpoint');
    expect(documentHtml).toContain('const renderLiveWeeklyReport =');
    expect(documentHtml).toContain('const highlightLiveWeeklyReportCitations =');
    expect(documentHtml).toContain("shell.setAttribute('data-weekly-report-state', 'ready')");
    expect(documentHtml).toContain("shell.setAttribute('data-live-weekly-highlighted-memory-count'");
    expect(documentHtml).toContain("memoryNode.addClass('weekly-citation-memory')");
    expect(documentHtml).toContain("setInteractionState('weekly-citation-path-highlighted')");
    expect(documentHtml).toContain('result.savedArtifact');
    expect(documentHtml).toContain("savedArtifactsById.set(result.savedArtifact.id");
    expect(documentHtml).toContain("askSaveButton.setAttribute('data-artifact-id'");
    expect(documentHtml).toContain('lastAskFollowUpContext');
    expect(documentHtml).toContain('followUpContext: lastAskFollowUpContext');
    expect(documentHtml).toContain("shell.setAttribute('data-ask-conversation-mode'");
    expect(documentHtml).toContain('const rebuildCytoscapeGraphFromModel =');
    expect(documentHtml).toContain('cytoscapeGraph.elements().remove()');
    expect(documentHtml).toContain('void rehydrateAppShellAfterImport()');
    expect(documentHtml).toContain("shell.setAttribute('data-graph-rebuild-state', 'rebuilt')");
  });
});
