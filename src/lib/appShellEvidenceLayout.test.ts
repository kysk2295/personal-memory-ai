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
          to: 'outcome:launch-delayed-after-onboarding-examples-and-replay-controls-were-added',
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
        label: 'Save answer',
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
    expect(html).toContain('"graphLabel":"Anxiety before the memory import demo led to...');
    expect(html).toContain('data-surface-mode="graph-first"');
    expect(html).toContain('data-rail-mode="collapsed-evidence-drawer"');
    expect(html).toContain('data-interaction-contract="filter-select-space-rearrange"');
    expect(html).toContain('data-layout-mode="free"');
    expect(html).toContain('data-layout-version="0"');
    expect(html).toContain('data-filter-semantic="on"');
    expect(html).toContain('class="brain-sidebar"');
    expect(html).toContain('class="brain-canvas"');
    expect(html).toContain('class="graph-meta-line"');
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
    expect(html).toContain('data-graph-density="benchmark-dense"');
    expect(html).toContain('<strong>8</strong> memories');
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
    expect(html).toContain('canonical memory atoms');
    expect(html).toContain('compiled wiki nodes');
    expect(html).toContain('data-memory-ops="retain-recall-reflect"');
    expect(html).toContain('data-memory-freshness="strengthening-stable-stale"');
    expect(html).toContain('data-memory-atom-id="atom:mem_api_artifact_ask_answer_sha-');
    expect(html).toContain('data-wiki-node-id="pattern:launch-delay-from-feature-expansion"');
    expect(html).toContain('data-inspector-headline');
    expect(html).toContain('data-spacing="wide"');
    expect(html).toContain('data-filter-chip="episodic"');
    expect(html).toContain('class="control-action subtle reset-graph-filters"');
    expect(html).toContain('class="ask-memory-bar"');
    expect(html).toContain('Second Brain');
    expect(html).toContain('지식 그래프');
    expect(html).toContain('노드 유형');
    expect(html).toContain('엣지 유형');
    expect(html).toContain('Initial loaded memory-brain graph');
    expect(html).toContain('Ask My Past Self');
    expect(html).toContain('Decision Replay');
    expect(html).toContain('Evidence drawer');
    expect(html).not.toContain('class="count-card"');
    expect(html).not.toContain('class="story-grid"');
    expect(html).not.toContain('class="editorial-band"');
    expect(html).not.toContain('status-planned');
    expect(html).not.toContain('status-skeleton');
    expect(html).not.toContain('status-fake-sample');
  });

  test('constrains benchmark graph controls to the left rail and keeps product panels secondary', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('data-first-screen-contract="benchmark-graph-dominant"');
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
    expect(documentHtml).toContain('Sign in to ask the Second Brain');
    expect(documentHtml).toContain('grid-template-columns: auto auto minmax(0, 1fr) auto;');
    expect(documentHtml).toContain('data-benchmark-drawer-tab="evidence-reports"');
    expect(documentHtml).toContain("shell.setAttribute('data-layout-mode', mode)");
    expect(documentHtml).toContain("shell.setAttribute('data-layout-explainer'");
    expect(documentHtml).toContain('Constellation pins decision and thesis nodes around the selected memory.');
    expect(documentHtml).toContain('Hierarchy stacks memories under source, pattern, decision, and outcome nodes.');
    expect(documentHtml).toContain('Timeline stretches the graph from old diary traces to recent imports.');
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

  test('renders Ask My Past Self as a cited path over the graph with evidence drawer trace', () => {
    const shell = buildInitialAppShellEvidenceLayout();
    const html = renderAppShellHtml();

    expect(html).toContain('aria-label="Ask My Past Self cited question flow"');
    expect(html).toContain('id="ask-my-past-self-question"');
    expect(html).toContain('이번에도 기능을 더 넣어야 할까?');
    expect(html).toContain('[mem_launch_may_anxiety_scope_delay]');
    expect(html).toContain(
      '<a href="#evidence-mem_launch_may_anxiety_scope_delay" class="citation-ref" data-citation-ref="mem_launch_may_anxiety_scope_delay">[mem_launch_may_anxiety_scope_delay]</a>',
    );
    expect(html).toContain('aria-label="Ask My Past Self citations"');
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
      'data-highlight-id="outcome:launch-delayed-by-two-days-after-adding-graph-filters"',
    );
    expect(html).toContain('data-current-question-id="question:이번에도-기능을-더-넣어야-할까"');
    expect(html).toContain('Evidence drawer');

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

    expect(html).toContain('class="product-value-strip"');
    expect(html).toContain('나보다 나를 더 잘 아는 개인 기억 AI');
    expect(html).toContain('앱에서 쓴 일기와 가져온 기록이 개인 기억 그래프로 연결된다');
    expect(html).toContain('비공개 기본값');
    expect(html).toContain('내보내기');
    expect(html).toContain('삭제');
    expect(html).not.toContain('public shared memory');

    expect(html).toContain('class="product-rail"');
    expect(html).toContain('Fast diary capture');
    expect(html).toContain('Import existing memories');
    expect(html).toContain('aria-label="App capture prototype"');
    expect(html).toContain('id="fast-diary-capture"');
    expect(html).toContain('data-capture-memory-id="mem_captured_ship_note"');
    expect(html).toContain('app-capture contract/prototype');
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
    expect(html).toContain('Markdown, JSON, Obsidian export');
    expect(html).toContain('Apply import');
    expect(html).toContain('Undo import');
    expect(html).toContain('data-import-duplicate-state="duplicate"');
    expect(html).toContain('data-import-duplicate-state="new"');

    expect(html).toContain('data-ask-answer-contract="citations-or-insufficient-evidence"');
    expect(html).toContain('data-insufficient-evidence-state="available"');
    expect(html).toContain('aria-label="Ask My Past Self citations"');
    expect(html).toContain('href="#evidence-mem_launch_may_anxiety_scope_delay"');

    expect(html).toContain('data-replay-outcome="launch delayed by two days after adding graph filters"');
    expect(html).toContain('data-replay-citation-id="mem_launch_may_anxiety_scope_delay"');

    expect(html).toContain('Weekly Pattern Report');
    expect(html).toContain('aria-label="Weekly Report cited memory summary"');
    expect(html).toContain('data-weekly-report-id="weekly_report_2026-05-01_2026-05-20"');
    expect(html).toContain('2026-05-01 to 2026-05-20');
    expect(html).toContain('data-weekly-aggregate-kind="emotions"');
    expect(html).toContain('data-weekly-aggregate-value="anxiety"');
    expect(html).toContain('data-weekly-pattern-id="pattern_anxiety_scope_expansion_launch_delay"');
    expect(html).toContain('Need at least 2 MemoryRecord citations in the weekly window.');
    expect(html).toContain('data-pattern-memory-id="mem_launch_may_anxiety_scope_delay"');
    expect(html).toContain('data-pattern-memory-id="mem_launch_june_anxiety_scope_delay"');

    expect(html).toContain('why connected');
    expect(html).toContain('data-evidence-source=');
    expect(html).toContain('data-evidence-date=');
    expect(html).toContain('data-evidence-raw-excerpt=');

    expect(html).toContain('aria-label="Private vault export and delete controls"');
    expect(html).toContain('data-privacy-scope="private"');
    expect(html).toContain('data-vault-access="owner-only"');
    expect(html).toContain('data-storage-mode="local-prototype"');
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

    expect(html).toContain('<label for="decision-replay-current">Current decision</label>');
    expect(html).toContain('id="decision-replay-current"');
    expect(html).toContain('Should I add more Decision Replay polish before review?');
    expect(html).toContain('Decision Replay');
    expect(html).toContain('Pattern detection');
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
    expect(documentHtml).toContain('transform: translateY(calc(100% - 52px));');
    expect(documentHtml).toContain('Personal Memory AI Second Brain');
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
    expect(documentHtml).toContain('canonical memory atoms');
    expect(documentHtml).toContain('const selectMemory = (node) =>');
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
    expect(documentHtml).toContain("fetch('/api/app-shell'");
    expect(documentHtml).toContain("shell.setAttribute('data-graph-rehydrate-state', 'ready')");
    expect(documentHtml).toContain("shell.setAttribute('data-rehydrated-memory-node-count'");
    expect(documentHtml).toContain('const rebuildCytoscapeGraphFromModel =');
    expect(documentHtml).toContain('cytoscapeGraph.elements().remove()');
    expect(documentHtml).toContain("shell.setAttribute('data-graph-rebuild-state', 'rebuilt')");
  });
});
