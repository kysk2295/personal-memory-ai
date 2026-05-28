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
      <p><span>결과</span> ${escapeHtml(outcome)}</p>
    </div>
    <div class="decision-columns">
      <div>
        <span>감정</span>
        ${renderTagList(`Past decision ${decision.memoryId} emotions`, decision.emotions)}
      </div>
      <div>
        <span>선택지</span>
        ${renderTagList(`Past decision ${decision.memoryId} choices`, decision.choices.length ? decision.choices : ['none captured'])}
      </div>
    </div>
    <ol class="decision-citations" aria-label="결정 되짚기 인용 ${escapeHtml(decision.memoryId)}">
      ${decision.citations.slice(0, 1).map(renderCitation).join('')}
    </ol>
  </article>`;
}

export function renderDecisionReplayPanel(layout: InitialAppShellEvidenceLayout): string {
  const replay = layout.replay;
  const currentDecisionHighlightId = `decision:${replay.currentDecision.id}`;
  const pattern = replay.pattern;
  const saveAction = findSavedArtifactAction(layout.savedArtifactActions, 'decision_replay');

  return `<section class="decision-replay-flow" aria-label="결정 되짚기 인용 흐름" data-replay-highlight="${escapeHtml(
    currentDecisionHighlightId,
  )}" data-replay-endpoint="/api/replay" data-replay-state="ready">
    <div class="section-header">
      <div>
        <p class="eyebrow">결정 되짚기</p>
        <h2>지금 선택을 과거 결과와 비교</h2>
      </div>
      ${renderStatus(replay.status)}
    </div>
    <p class="section-intro">현재 고민, 추천, 가장 비슷한 과거 기억만 남겨서 결정의 반복 패턴을 확인한다.</p>
    <div class="decision-current-card" data-current-decision-id="${escapeHtml(currentDecisionHighlightId)}">
      <label for="decision-replay-current">지금 결정</label>
      <input id="decision-replay-current" type="text" value="${escapeHtml(replay.currentDecision.prompt)}" data-control="decision-replay-current" />
      <button type="button" class="save-artifact-action" data-control="run-decision-replay">결정 되짚기 실행</button>
      <div class="decision-columns">
        <div>
          <span>감정</span>
          ${renderTagList('현재 결정 감정', replay.currentDecision.emotions)}
        </div>
        <div>
          <span>선택지</span>
          ${renderTagList('현재 결정 선택지', replay.currentDecision.choices)}
        </div>
      </div>
      ${renderTagList('현재 결정 주제', replay.currentDecision.topicTags)}
    </div>
    <div class="decision-recommendation" aria-label="결정 되짚기 추천과 불확실성" data-live-replay-result="recommendation">
      <div class="panel-topline">
        <span>${escapeHtml(replay.evidenceLabel)}</span>
        <span>신뢰도 <strong>${Math.round(replay.confidence * 100)}%</strong></span>
      </div>
      <h3>${escapeHtml(replay.recommendation)}</h3>
      <p>${escapeHtml(replay.uncertainty)}</p>
      ${
        pattern
          ? `<p><strong>${escapeHtml(pattern.title)}</strong>: ${escapeHtml(pattern.explanation)}</p>`
          : '<p>인용 근거가 충분하지 않으면 개인 패턴을 보여주지 않는다.</p>'
      }
      ${renderSavedArtifactActionButton(saveAction)}
    </div>
    <div class="similar-decision-list" aria-label="비슷한 과거 결정과 인용">
      ${replay.similarPastDecisions.slice(0, 2).map(renderSimilarDecision).join('')}
    </div>
    <div class="graph-highlight-manifest decision-highlight-manifest" aria-label="결정 되짚기 그래프 하이라이트">
      ${replay.graphHighlightIds
        .slice(0, 5)
        .map((highlightId) => `<span data-highlight-id="${escapeHtml(highlightId)}">${escapeHtml(highlightId)}</span>`)
        .join('')}
    </div>
  </section>`;
}
