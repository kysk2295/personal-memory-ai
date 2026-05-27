import { describe, expect, test } from 'vitest';
import { renderAppShellDocument, renderAppShellHtml } from '../App';
import { buildInitialAppShellEvidenceLayout } from './appShellEvidenceLayout';

describe('buildInitialAppShellEvidenceLayout', () => {
  test('loads the first-screen memory-brain graph around diary and imported memories', () => {
    const shell = buildInitialAppShellEvidenceLayout();

    expect(shell.northStar).toBe('나보다 나를 더 잘 아는 개인 기억 AI.');
    expect(shell.primaryNodes.map((node) => node.recordId)).toEqual([
      'mem_launch_may_anxiety_scope_delay',
      'mem_launch_june_anxiety_scope_delay',
      'mem_freeze_vs_feature_addition',
      'mem_unrelated_calm_import',
      'mem_captured_ship_note',
    ]);
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
        expect.objectContaining({ id: 'weekly-report', status: 'planned' }),
      ]),
    );
    expect(shell.evidenceDrawer.items.length).toBeGreaterThan(0);
    expect(shell.compiledWiki.nodeCount).toBeGreaterThan(10);
    expect(shell.compiledWiki.atomCount).toBe(5);
    expect(shell.compiledWiki.operationCounts).toEqual({ retain: 5, recall: 5, reflect: 3 });
    expect(shell.compiledWiki.freshnessCounts).toEqual({ strengthening: 2, stable: 2, stale: 1 });
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
        expect.objectContaining({ id: 'weekly-report', status: 'planned' }),
      ]),
    );
    expect(shell.surfaces.map((surface) => surface.status)).toEqual(
      expect.arrayContaining(['implemented', 'partial', 'skeleton', 'fake/sample', 'planned']),
    );
  });

  test('renders a benchmark-like second-brain graph workspace instead of a dashboard shell', () => {
    const html = renderAppShellHtml();

    expect(html).toContain('class="second-brain-shell"');
    expect(html).toContain('class="brain-sidebar"');
    expect(html).toContain('class="brain-canvas"');
    expect(html).toContain('class="graph-meta-line"');
    expect(html).toContain('graph-control-panel');
    expect(html).toContain('class="control-row node-spacing-controls"');
    expect(html).toContain('class="control-action rearrange-graph"');
    expect(html).toContain('class="control-action hide-secondary-labels"');
    expect(html).toContain('data-control="toggle-labels"');
    expect(html).toContain('data-control="select-memory"');
    expect(html).toContain('class="memory-node obsidian-memory-node');
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
    expect(html).toContain('data-memory-atom-id="atom:mem_captured_ship_note"');
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

    expect(html).toContain('data-ask-answer-contract="citations-or-insufficient-evidence"');
    expect(html).toContain('data-insufficient-evidence-state="available"');
    expect(html).toContain('aria-label="Ask My Past Self citations"');
    expect(html).toContain('href="#evidence-mem_launch_may_anxiety_scope_delay"');

    expect(html).toContain('data-replay-outcome="launch delayed by two days after adding graph filters"');
    expect(html).toContain('data-replay-citation-id="mem_launch_may_anxiety_scope_delay"');

    expect(html).toContain('Weekly Pattern Report');
    expect(html).toContain('data-pattern-memory-id="mem_launch_may_anxiety_scope_delay"');
    expect(html).toContain('data-pattern-memory-id="mem_launch_june_anxiety_scope_delay"');

    expect(html).toContain('why connected');
    expect(html).toContain('data-evidence-source=');
    expect(html).toContain('data-evidence-date=');
    expect(html).toContain('data-evidence-raw-excerpt=');
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
    expect(documentHtml).toContain('Personal Memory AI Second Brain');
    expect(documentHtml).toContain('data-graph-control-script="pmi019"');
    expect(documentHtml).toContain('data-inspector-panel="pmi015"');
    expect(documentHtml).toContain('data-wiki-compiler="pmi017"');
    expect(documentHtml).toContain('canonical memory atoms');
    expect(documentHtml).toContain('const selectMemory = (node) =>');
    expect(documentHtml).toContain("inspector.setAttribute('data-selected-memory', citation)");
    expect(documentHtml).toContain("edge.setAttribute('data-edge-active', String(active))");
    expect(documentHtml).toContain("shell.setAttribute('data-labels', hidden ? 'visible' : 'hidden')");
    expect(documentHtml).toContain("setSpacing('normal')");
  });
});
