import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';
import type { DecisionReplayCitation, SimilarPastDecision } from '../lib/decisionReplay';
import { findSavedArtifactAction, renderSavedArtifactActionButton } from './SavedArtifactActionButton';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderStatus(status: string): string {
  return `<span class="status status-${escapeHtml(status.replace('/', '-'))}">${escapeHtml(status)}</span>`;
}

function renderCitationReference(citationId: string): string {
  return `<a href="#evidence-${escapeHtml(citationId)}" class="citation-ref">[${escapeHtml(citationId)}]</a>`;
}

function renderTagList(label: string, values: readonly string[]): string {
  return `<ul class="decision-tag-list" aria-label="${escapeHtml(label)}">
    ${values.map((value) => `<li>${escapeHtml(value)}</li>`).join('')}
  </ul>`;
}

function renderCitation(citation: DecisionReplayCitation): string {
  return `<li data-replay-citation-id="${escapeHtml(citation.citationId)}">
    <strong>${renderCitationReference(citation.citationId)} ${escapeHtml(citation.sourceType)} ${escapeHtml(
      citation.observedAt ?? 'undated',
    )}</strong>
    <p>${escapeHtml(citation.text)}</p>
    <code>${citation.graphHighlightIds.map(escapeHtml).join(' · ')}</code>
  </li>`;
}

function renderOutcomeAttribute(outcome: string): string {
  return outcome.replace(/[.。]+$/g, '').toLocaleLowerCase();
}

function renderSimilarDecision(decision: SimilarPastDecision): string {
  const outcome = decision.outcome ?? 'Outcome not captured yet.';

  return `<article class="similar-decision" data-replay-memory-id="${escapeHtml(decision.memoryId)}" data-replay-outcome="${escapeHtml(
    renderOutcomeAttribute(outcome),
  )}">
    <div>
      <strong>${escapeHtml(decision.summary)}</strong>
      <p><span>outcome</span> ${escapeHtml(outcome)}</p>
    </div>
    <div class="decision-columns">
      <div>
        <span>emotions</span>
        ${renderTagList(`Past decision ${decision.memoryId} emotions`, decision.emotions)}
      </div>
      <div>
        <span>choices</span>
        ${renderTagList(`Past decision ${decision.memoryId} choices`, decision.choices.length ? decision.choices : ['none captured'])}
      </div>
    </div>
    <ol class="decision-citations" aria-label="Decision Replay citations for ${escapeHtml(decision.memoryId)}">
      ${decision.citations.slice(0, 1).map(renderCitation).join('')}
    </ol>
  </article>`;
}

export function renderDecisionReplayPanel(layout: InitialAppShellEvidenceLayout): string {
  const replay = layout.replay;
  const currentDecisionHighlightId = `decision:${replay.currentDecision.id}`;
  const pattern = replay.pattern;
  const saveAction = findSavedArtifactAction(layout.savedArtifactActions, 'decision_replay');

  return `<section class="decision-replay-flow" aria-label="Decision Replay cited visual flow" data-replay-highlight="${escapeHtml(
    currentDecisionHighlightId,
  )}">
    <div class="section-header">
      <div>
        <p class="eyebrow">Decision Replay</p>
        <h2>Current choice replayed against past outcomes</h2>
      </div>
      ${renderStatus(replay.status)}
    </div>
    <p class="section-intro">Replay stays visible as a product pillar, but the screen now edits the story down to the current decision, recommendation, and the strongest similar memories.</p>
    <div class="decision-current-card" data-current-decision-id="${escapeHtml(currentDecisionHighlightId)}">
      <label for="decision-replay-current">Current decision</label>
      <input id="decision-replay-current" type="text" value="${escapeHtml(replay.currentDecision.prompt)}" readonly />
      <div class="decision-columns">
        <div>
          <span>emotions</span>
          ${renderTagList('Current decision emotions', replay.currentDecision.emotions)}
        </div>
        <div>
          <span>choices</span>
          ${renderTagList('Current decision choices', replay.currentDecision.choices)}
        </div>
      </div>
      ${renderTagList('Current decision topics', replay.currentDecision.topicTags)}
    </div>
    <div class="decision-recommendation" aria-label="Decision Replay recommendation and uncertainty">
      <div class="panel-topline">
        <span>${escapeHtml(replay.evidenceLabel)}</span>
        <span>confidence <strong>${Math.round(replay.confidence * 100)}%</strong></span>
      </div>
      <h3>${escapeHtml(replay.recommendation)}</h3>
      <p>${escapeHtml(replay.uncertainty)}</p>
      ${
        pattern
          ? `<p><strong>${escapeHtml(pattern.title)}</strong>: ${escapeHtml(pattern.explanation)}</p>`
          : '<p>No sufficient personal pattern is shown without cited support.</p>'
      }
      ${renderSavedArtifactActionButton(saveAction)}
    </div>
    <div class="similar-decision-list" aria-label="Similar past decisions with citations">
      ${replay.similarPastDecisions.slice(0, 2).map(renderSimilarDecision).join('')}
    </div>
    <div class="graph-highlight-manifest decision-highlight-manifest" aria-label="Decision Replay graph highlights">
      ${replay.graphHighlightIds
        .slice(0, 5)
        .map((highlightId) => `<span data-highlight-id="${escapeHtml(highlightId)}">${escapeHtml(highlightId)}</span>`)
        .join('')}
    </div>
  </section>`;
}
