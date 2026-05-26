import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
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

  return `<section class="ask-flow" aria-label="Ask My Past Self cited question flow" data-ask-highlight="${escapeHtml(questionHighlightId)}">
    <div class="section-header">
      <div>
        <p class="eyebrow">Ask My Past Self</p>
        <h2>Cited answer, graph path, and drawer evidence</h2>
      </div>
      ${renderStatus(layout.ask.status)}
    </div>
    <div class="ask-question-row">
      <label for="ask-my-past-self-question">Question</label>
      <input id="ask-my-past-self-question" type="text" value="${escapeHtml(layout.askQuestion)}" readonly />
      <button type="button">Ask</button>
    </div>
    <article class="ask-answer-cited">
      <div class="panel-topline">
        <span>${escapeHtml(layout.ask.evidenceLabel)}</span>
        <span>confidence <strong>${Math.round(layout.ask.confidence * 100)}%</strong></span>
      </div>
      <h3>${escapeHtml(layout.ask.recommendation)}</h3>
      <p>${escapeHtml(layout.ask.answer)} Citations: ${answerCitationRefs}</p>
    </article>
    <ol class="ask-citations" aria-label="Ask My Past Self citations">
      ${layout.ask.evidenceBullets
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
