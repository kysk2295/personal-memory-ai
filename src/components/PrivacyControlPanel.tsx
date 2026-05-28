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

  return `<section class="privacy-control-flow product-panel" aria-label="Private vault export and delete controls" data-privacy-scope="${escapeHtml(
    controls.privacyScope,
  )}" data-vault-access="${escapeHtml(controls.vaultAccess)}" data-storage-mode="${escapeHtml(
    controls.storageMode,
  )}" data-local-durable-store="unknown" data-auth-status="${escapeHtml(controls.authStatus)}" data-transport-status="${escapeHtml(
    controls.transportStatus,
  )}">
    <div class="section-header">
      <div>
        <p class="eyebrow">Privacy Controls</p>
        <h2>Owner-only local vault controls</h2>
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
        <span>Export private vault</span>
        <code>${escapeHtml(`${controls.exportControl.method} ${controls.exportControl.endpoint}`)}</code>
      </div>
      <h3>${escapeHtml(controls.exportControl.filename)}</h3>
      <p>${controls.exportControl.recordCount} private MemoryRecord items are included. Export stays scoped to owner <strong>${escapeHtml(
        controls.ownerUserId,
      )}</strong>.</p>
      <div class="entrypoint-grid">
        <button type="button">Export JSON</button>
      </div>
    </article>
    <article class="privacy-control-card" data-delete-endpoint="${escapeHtml(
      controls.selectedDeleteControl.endpoint,
    )}" data-delete-selected-ids="${escapeHtml(selectedIds)}" data-delete-disabled="${String(
      controls.selectedDeleteControl.disabled,
    )}">
      <div class="panel-topline">
        <span>Delete selected memory</span>
        <code>${escapeHtml(`${controls.selectedDeleteControl.method} ${controls.selectedDeleteControl.endpoint}`)}</code>
      </div>
      <h3>Selected memory delete is scoped by id.</h3>
      <p>${selectedIds ? escapeHtml(selectedIds) : 'No selected memory.'}</p>
      <div class="entrypoint-grid">
        <button type="button" ${controls.selectedDeleteControl.disabled ? 'disabled' : ''}>Delete selected</button>
      </div>
    </article>
    <article class="privacy-control-card danger-zone" data-hard-delete-endpoint="${escapeHtml(
      controls.hardDeleteControl.endpoint,
    )}" data-hard-delete-confirmation="${escapeHtml(controls.hardDeleteControl.confirmationPhrase)}" data-hard-delete-disabled="${String(
      controls.hardDeleteControl.disabled,
    )}">
      <div class="panel-topline">
        <span>Hard delete vault</span>
        <code>${escapeHtml(`${controls.hardDeleteControl.method} ${controls.hardDeleteControl.endpoint}`)}</code>
      </div>
      <h3>Requires exact confirmation phrase.</h3>
      <p><code>${escapeHtml(controls.hardDeleteControl.confirmationPhrase)}</code></p>
      <input type="text" readonly value="" aria-label="Hard delete confirmation phrase input" placeholder="${escapeHtml(
        controls.hardDeleteControl.confirmationPhrase,
      )}" />
      <div class="entrypoint-grid">
        <button type="button" disabled>Hard delete vault</button>
      </div>
    </article>
  </section>`;
}
