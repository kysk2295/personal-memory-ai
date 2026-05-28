import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderUserFeedbackPanel(layout: InitialAppShellEvidenceLayout): string {
  const targetMemoryId = 'mem_freeze_vs_feature_addition';
  const targetArtifactId = layout.savedArtifactActions.find((action) => action.kind === 'ask_answer')?.artifact.id ?? '';
  const correctionText = '다음에는 결론보다 먼저 관련 과거 기억과 citation을 보여줘.';

  return `<section class="user-feedback-panel product-panel" aria-label="사용자 수정 피드백 기억" data-feedback-panel="user-correction" data-feedback-endpoint="/api/feedback" data-feedback-method="POST" data-feedback-state="ready" data-feedback-target-memory-id="${escapeHtml(
    targetMemoryId,
  )}" data-feedback-target-artifact-id="${escapeHtml(targetArtifactId)}">
    <div class="section-header">
      <div>
        <p class="eyebrow">수정 기억</p>
        <h2>에이전트가 놓친 점을 가르치기</h2>
      </div>
      <span class="status-badge">비공개 피드백</span>
    </div>
    <p class="section-intro">수정은 공개 메모리가 아니라, 다음 답변에서 더 잘 맞추기 위한 개인 피드백 기억으로 저장된다.</p>
    <label for="feedback-correction-text">수정 내용</label>
    <textarea id="feedback-correction-text" data-control="feedback-correction-text">${escapeHtml(correctionText)}</textarea>
    <div class="feedback-target-row">
      <span>대상</span>
      <code>${escapeHtml(targetMemoryId)}</code>
    </div>
    <button type="button" class="feedback-submit-action" data-control="submit-feedback-correction" data-feedback-submitted-label="피드백 저장됨">수정 기억 저장</button>
  </section>`;
}
