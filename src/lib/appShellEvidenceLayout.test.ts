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
  });

  test('labels graph-supporting surfaces and sample data status honestly', () => {
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

  test('renders the rebuilt first screen as hero + graph + curated story surfaces', () => {
    const html = renderAppShellHtml();

    expect(html).toContain('class="hero-stage"');
    expect(html).toContain('class="hero-graph-card"');
    expect(html).toContain('class="story-grid"');
    expect(html).toContain('class="editorial-band"');
    expect(html).toContain('The graph is the evidence surface, not the whole product.');
    expect(html).toContain('Initial loaded memory-brain graph');
    expect(html).toContain('daily diary capture');
    expect(html).toContain('imported memory');
    expect(html).toContain('Ask My Past Self');
    expect(html).toContain('Decision Replay');
    expect(html).toContain('Evidence drawer');
    expect(html).toContain('status-planned');
    expect(html).toContain('status-skeleton');
    expect(html).toContain('status-fake-sample');
  });

  test('renders Ask My Past Self as a cited visual flow with graph highlights and evidence drawer trace', () => {
    const shell = buildInitialAppShellEvidenceLayout();
    const html = renderAppShellHtml();

    expect(html).toContain('aria-label="Ask My Past Self cited question flow"');
    expect(html).toContain('<label for="ask-my-past-self-question">Question</label>');
    expect(html).toContain('id="ask-my-past-self-question"');
    expect(html).toContain('이번에도 기능을 더 넣어야 할까?');
    expect(html).toContain('class="ask-answer-cited"');
    expect(html).toContain('[mem_launch_may_anxiety_scope_delay]');
    expect(html).toContain(
      '<a href="#evidence-mem_launch_may_anxiety_scope_delay" class="citation-ref">[mem_launch_may_anxiety_scope_delay]</a>',
    );
    expect(html).toContain('aria-label="Ask My Past Self citations"');
    expect(html).toContain('data-citation-id="mem_launch_june_anxiety_scope_delay"');
    expect(html).toContain('data-ask-highlight="question:이번에도-기능을-더-넣어야-할까"');
    expect(html).toContain('data-highlight-id="memory:mem_launch_may_anxiety_scope_delay"');
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

  test('renders Decision Replay as a cited visual flow with current decision and graph evidence', () => {
    const shell = buildInitialAppShellEvidenceLayout();
    const html = renderAppShellHtml();

    expect(html).toContain('aria-label="Decision Replay cited visual flow"');
    expect(html).toContain('<label for="decision-replay-current">Current decision</label>');
    expect(html).toContain('id="decision-replay-current"');
    expect(html).toContain('Should I add more Decision Replay polish before review?');
    expect(html).toContain('aria-label="Current decision emotions"');
    expect(html).toContain('anxiety');
    expect(html).toContain('pressure');
    expect(html).toContain('aria-label="Current decision choices"');
    expect(html).toContain('add polish');
    expect(html).toContain('freeze for review');
    expect(html).toContain('aria-label="Similar past decisions with citations"');
    expect(html).toContain('data-replay-memory-id="mem_launch_may_anxiety_scope_delay"');
    expect(html).toContain('data-replay-memory-id="mem_launch_june_anxiety_scope_delay"');
    expect(html).toContain(
      '<a href="#evidence-mem_launch_may_anxiety_scope_delay" class="citation-ref">[mem_launch_may_anxiety_scope_delay]</a>',
    );
    expect(html).toContain('aria-label="Decision Replay recommendation and uncertainty"');
    expect(html).toContain(
      'Based on cited memories, freeze Decision Replay scope for review instead of adding more polish.',
    );
    expect(html).toContain('Recommendation is bounded to cited personal memories');
    expect(html).toContain('data-replay-highlight="decision:decision_current_add_replay_polish"');
    expect(html).toContain('data-current-decision-id="decision:decision_current_add_replay_polish"');

    for (const highlightId of shell.replay.graphHighlightIds.slice(0, 5)) {
      expect(html).toContain(`data-highlight-id="${highlightId}"`);
    }
    for (const citationId of shell.replay.citationMemoryIds.slice(0, 2)) {
      expect(html).toContain(`href="#evidence-${citationId}"`);
      expect(html).toContain(`id="evidence-${citationId}"`);
    }
  });

  test('exports a complete responsive document for screenshot evidence', () => {
    const documentHtml = renderAppShellDocument();

    expect(documentHtml).toContain('<!doctype html>');
    expect(documentHtml).toContain('<meta name="viewport" content="width=device-width, initial-scale=1" />');
    expect(documentHtml).toContain('.hero-stage');
    expect(documentHtml).toContain('Memory becomes usable when it can answer back.');
  });
});
