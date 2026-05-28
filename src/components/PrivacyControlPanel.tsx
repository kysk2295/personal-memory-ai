import type { InitialAppShellEvidenceLayout } from '../lib/appShellEvidenceLayout';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderPrivacyControlPanel(layout: InitialAppShellEvidenceLayout): string {
  const controls = layout.privacyControls;
  const selectedIds = controls.selectedDeleteControl.memoryIds.join(',');

  return `<section class="privacy-control-flow product-panel" aria-label="개인 보관함 내보내기와 삭제 제어" data-privacy-scope="${escapeHtml(
    controls.privacyScope,
  )}" data-vault-access="${escapeHtml(controls.vaultAccess)}" data-storage-mode="${escapeHtml(
    controls.storageMode,
  )}" data-local-durable-store="unknown" data-auth-status="${escapeHtml(controls.authStatus)}" data-transport-status="${escapeHtml(
    controls.transportStatus,
  )}">
    <div class="section-header">
      <div>
        <p class="eyebrow">비공개 제어</p>
        <h2>소유자만 접근하는 로컬 보관함</h2>
      </div>
      <span class="status-badge">${escapeHtml(controls.storageMode)}</span>
    </div>
    <p class="section-intro">이 세컨브레인은 공개 공유 메모리가 아니라, 한 사용자만 접근하는 private vault로 다룬다. 현재는 로컬 프로토타입 상태를 그대로 표시한다.</p>
    <article class="privacy-control-card" data-export-endpoint="${escapeHtml(
      controls.exportControl.endpoint,
    )}" data-export-filename="${escapeHtml(controls.exportControl.filename)}" data-export-format="${escapeHtml(
      controls.exportControl.format,
    )}" data-export-record-count="${controls.exportControl.recordCount}">
      <div class="panel-topline">
        <span>개인 보관함 내보내기</span>
        <code>${escapeHtml(`${controls.exportControl.method} ${controls.exportControl.endpoint}`)}</code>
      </div>
      <h3>${escapeHtml(controls.exportControl.filename)}</h3>
      <p>비공개 MemoryRecord ${controls.exportControl.recordCount}개가 포함된다. 내보내기는 소유자 <strong>${escapeHtml(
        controls.ownerUserId,
      )}</strong> 범위 안에서만 실행된다.</p>
      <div class="entrypoint-grid">
        <button type="button">JSON 내보내기</button>
      </div>
    </article>
    <article class="privacy-control-card" data-delete-endpoint="${escapeHtml(
      controls.selectedDeleteControl.endpoint,
    )}" data-delete-selected-ids="${escapeHtml(selectedIds)}" data-delete-disabled="${String(
      controls.selectedDeleteControl.disabled,
    )}">
      <div class="panel-topline">
        <span>선택 기억 삭제</span>
        <code>${escapeHtml(`${controls.selectedDeleteControl.method} ${controls.selectedDeleteControl.endpoint}`)}</code>
      </div>
      <h3>선택한 기억만 id 기준으로 삭제한다.</h3>
      <p>${selectedIds ? escapeHtml(selectedIds) : '선택한 기억 없음'}</p>
      <div class="entrypoint-grid">
        <button type="button" ${controls.selectedDeleteControl.disabled ? 'disabled' : ''}>선택 삭제</button>
      </div>
    </article>
    <article class="privacy-control-card danger-zone" data-hard-delete-endpoint="${escapeHtml(
      controls.hardDeleteControl.endpoint,
    )}" data-hard-delete-confirmation="${escapeHtml(controls.hardDeleteControl.confirmationPhrase)}" data-hard-delete-disabled="${String(
      controls.hardDeleteControl.disabled,
    )}">
      <div class="panel-topline">
        <span>보관함 완전 삭제</span>
        <code>${escapeHtml(`${controls.hardDeleteControl.method} ${controls.hardDeleteControl.endpoint}`)}</code>
      </div>
      <h3>정확한 확인 문구가 필요하다.</h3>
      <p><code>${escapeHtml(controls.hardDeleteControl.confirmationPhrase)}</code></p>
      <input type="text" readonly value="" aria-label="완전 삭제 확인 문구 입력" placeholder="${escapeHtml(
        controls.hardDeleteControl.confirmationPhrase,
      )}" />
      <div class="entrypoint-grid">
        <button type="button" disabled>보관함 완전 삭제</button>
      </div>
    </article>
  </section>`;
}
