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

  return `<section class="ask-flow product-panel" aria-label="과거의 나에게 묻기 인용 질문 흐름" data-ask-highlight="${escapeHtml(
    questionHighlightId,
  )}" data-ask-answer-contract="citations-or-insufficient-evidence">
    <div class="section-header">
      <div>
        <p class="eyebrow">과거의 나에게 묻기</p>
        <h2>답은 먼저, 근거는 바로 아래에</h2>
      </div>
      ${renderStatus(layout.ask.status)}
    </div>
    <p class="section-intro">감정이 담긴 질문을 그대로 받되, 일반 조언이 아니라 내 기억 인용 안에서만 답한다.</p>
    <div class="ask-question-row">
      <label for="ask-my-past-self-question">질문</label>
      <input id="ask-my-past-self-question" type="text" name="question" value="${escapeHtml(layout.askQuestion)}" />
      <button type="button">묻기</button>
    </div>
    <article class="ask-answer-cited">
      <div class="panel-topline">
        <span>${escapeHtml(layout.ask.evidenceLabel)}</span>
        <span>신뢰도 <strong>${Math.round(layout.ask.confidence * 100)}%</strong></span>
      </div>
      <h3>${escapeHtml(layout.ask.recommendation)}</h3>
      <p>${escapeHtml(layout.ask.answer)} ${
        hasCitations ? `인용: ${answerCitationRefs}` : '근거가 충분하지 않으면 답변을 보류한다.'
      }</p>
      ${renderSavedArtifactActionButton(saveAction)}
    </article>
    <section class="coaching-brief" aria-label="인용 기반 코칭 요약" data-coaching-brief="citation-bounded" data-coaching-boundary="cited-personal-memories">
      <div class="panel-topline">
        <span>코칭 요약</span>
        <span><strong>${layout.ask.citationMemoryIds.length}</strong> 인용</span>
      </div>
      <p>추천은 인용된 개인 기억 안에서만 만들어지며, 일반 조언처럼 취급하지 않는다.</p>
      <ul class="decision-tag-list" aria-label="Citation-bounded next actions">
        <li data-coaching-next-action="freeze-scope">새 일을 더 넣기 전에 현재 범위를 고정한다.</li>
        <li data-coaching-next-action="user-feedback">현재 빌드를 피드백 받을 사람에게 보여준다.</li>
        <li data-coaching-next-action="review-citations">추천을 무시하기 전에 인용된 기억 경로를 먼저 본다.</li>
      </ul>
    </section>
    <article class="insufficient-evidence-state" data-insufficient-evidence-state="available">
      <strong>근거 부족 상태</strong>
      <p>관련 기억이 부족하면 일반 조언을 생성하지 않고, 어떤 기록이 더 필요한지 먼저 요청한다.</p>
    </article>
    <ol class="ask-citations" aria-label="과거의 나에게 묻기 인용">
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
