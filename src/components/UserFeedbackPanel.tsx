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

  return `<section class="user-feedback-panel product-panel" aria-label="User correction feedback memory" data-feedback-panel="user-correction" data-feedback-endpoint="/api/feedback" data-feedback-method="POST" data-feedback-state="ready" data-feedback-target-memory-id="${escapeHtml(
    targetMemoryId,
  )}" data-feedback-target-artifact-id="${escapeHtml(targetArtifactId)}">
    <div class="section-header">
      <div>
        <p class="eyebrow">Correction Memory</p>
        <h2>Teach the agent what it missed</h2>
      </div>
      <span class="status-badge">private feedback</span>
    </div>
    <p class="section-intro">수정은 공개 메모리가 아니라, 다음 답변에서 더 잘 맞추기 위한 개인 피드백 기억으로 저장된다.</p>
    <label for="feedback-correction-text">Correction</label>
    <textarea id="feedback-correction-text" data-control="feedback-correction-text">${escapeHtml(correctionText)}</textarea>
    <div class="feedback-target-row">
      <span>target</span>
      <code>${escapeHtml(targetMemoryId)}</code>
    </div>
    <button type="button" class="feedback-submit-action" data-control="submit-feedback-correction" data-feedback-submitted-label="Feedback saved">Save correction</button>
  </section>`;
}
