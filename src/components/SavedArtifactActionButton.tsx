import type { SavedArtifactAction } from '../lib/savedArtifactActions';
import type { SavedMemoryArtifactKind } from '../lib/savedMemoryArtifact';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function findSavedArtifactAction(
  actions: readonly SavedArtifactAction[],
  kind: SavedMemoryArtifactKind,
): SavedArtifactAction {
  const action = actions.find((candidate) => candidate.kind === kind);
  if (!action) throw new Error(`Missing saved artifact action for ${kind}`);
  return action;
}

export function renderSavedArtifactActionButton(action: SavedArtifactAction): string {
  return `<button type="button" class="save-artifact-action" data-control="save-artifact" data-save-artifact-action="${escapeHtml(
    action.kind,
  )}" data-artifact-id="${escapeHtml(action.artifact.id)}" data-future-memory-id="${escapeHtml(
    action.futureMemoryId,
  )}" data-artifact-source-ref="${escapeHtml(action.sourceRef)}" data-artifact-citation-count="${action.citationCount}" data-artifact-save-endpoint="${escapeHtml(
    action.endpoint,
  )}" data-artifact-save-method="${escapeHtml(action.method)}" data-artifact-save-state="${escapeHtml(
    action.initialState,
  )}" data-artifact-saved-label="${escapeHtml(action.savedLabel)}">${escapeHtml(action.label)}</button>`;
}
