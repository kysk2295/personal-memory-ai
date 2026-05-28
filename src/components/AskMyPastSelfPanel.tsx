import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';
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

export function renderAskMyPastSelfPanel(layout: InitialAppShellEvidenceLayout): string {
  const questionHighlightId = layout.ask.graphHighlightIds[0] ?? '';
  const answerCitationRefs = layout.ask.citationMemoryIds.map(renderCitationReference).join(' ');
  const visibleBullets = layout.ask.evidenceBullets.slice(0, 2);
  const hasCitations = layout.ask.citationMemoryIds.length > 0;
  const saveAction = findSavedArtifactAction(layout.savedArtifactActions, 'ask_answer');

  return `<section class="ask-flow product-panel" aria-label="Ask My Past Self cited question flow" data-ask-highlight="${escapeHtml(
    questionHighlightId,
  )}" data-ask-answer-contract="citations-or-insufficient-evidence">
    <div class="section-header">
      <div>
        <p class="eyebrow">Ask My Past Self</p>
        <h2>Cited answer first, explanation second</h2>
      </div>
      ${renderStatus(layout.ask.status)}
    </div>
    <p class="section-intro">The first question stays emotionally legible, but the answer is still bounded to memory evidence instead of generic coaching.</p>
    <div class="ask-question-row">
      <label for="ask-my-past-self-question">Question</label>
      <input id="ask-my-past-self-question" type="text" name="question" value="${escapeHtml(layout.askQuestion)}" />
      <button type="button">Ask</button>
    </div>
    <article class="ask-answer-cited">
      <div class="panel-topline">
        <span>${escapeHtml(layout.ask.evidenceLabel)}</span>
        <span>confidence <strong>${Math.round(layout.ask.confidence * 100)}%</strong></span>
      </div>
      <h3>${escapeHtml(layout.ask.recommendation)}</h3>
      <p>${escapeHtml(layout.ask.answer)} ${
        hasCitations ? `Citations: ${answerCitationRefs}` : '근거가 충분하지 않으면 답변을 보류한다.'
      }</p>
      ${renderSavedArtifactActionButton(saveAction)}
    </article>
    <section class="coaching-brief" aria-label="Citation-bounded coaching brief" data-coaching-brief="citation-bounded" data-coaching-boundary="cited-personal-memories">
      <div class="panel-topline">
        <span>coaching brief</span>
        <span><strong>${layout.ask.citationMemoryIds.length}</strong> citations</span>
      </div>
      <p>Recommendation is bounded to cited personal memories and should not be treated as generic advice.</p>
      <ul class="decision-tag-list" aria-label="Citation-bounded next actions">
        <li data-coaching-next-action="freeze-scope">Freeze the current feature scope before adding more work.</li>
        <li data-coaching-next-action="user-feedback">Show the current build to a user feedback source.</li>
        <li data-coaching-next-action="review-citations">Review the citation-backed memory path before overriding the recommendation.</li>
      </ul>
    </section>
    <article class="insufficient-evidence-state" data-insufficient-evidence-state="available">
      <strong>Insufficient evidence state</strong>
      <p>관련 기억이 부족하면 일반 조언을 생성하지 않고, 어떤 기록이 더 필요한지 먼저 요청한다.</p>
    </article>
    <ol class="ask-citations" aria-label="Ask My Past Self citations">
      ${visibleBullets
        .map(
          (bullet) => `<li id="citation-${escapeHtml(bullet.citationId)}" data-citation-id="${escapeHtml(bullet.citationId)}">
            <strong>${renderCitationReference(bullet.citationId)} ${escapeHtml(bullet.sourceType)} ${escapeHtml(
              bullet.observedAt ?? 'undated',
            )}</strong>
            <p>${escapeHtml(bullet.text)}</p>
            <code>${bullet.graphHighlightIds.map(escapeHtml).join(' · ')}</code>
          </li>`,
        )
        .join('')}
    </ol>
  </section>`;
}
