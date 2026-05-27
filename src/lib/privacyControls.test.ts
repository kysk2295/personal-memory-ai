import { describe, expect, test } from 'vitest';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import { buildPrivacyControlState, evaluateHardDeleteConfirmation } from './privacyControls';

describe('privacy control state', () => {
  test('builds a private local export and delete control surface from user memories', () => {
    const state = buildPrivacyControlState({
      userId: 'local-user',
      records: personalMemoryRecords,
      selectedMemoryIds: ['mem_freeze_vs_feature_addition'],
      generatedAt: '2026-05-27T14:00:00.000Z',
    });

    expect(state).toMatchObject({
      privacyScope: 'private',
      vaultAccess: 'owner-only',
      storageMode: 'local-prototype',
      authStatus: 'not-connected-local-prototype',
      transportStatus: 'local-only-static-prototype',
      recordCount: personalMemoryRecords.length,
      exportControl: {
        method: 'GET',
        endpoint: '/api/export',
        format: 'memory-record-json',
        recordCount: personalMemoryRecords.length,
        filename: 'personal-memory-export-local-user-2026-05-27.json',
      },
      selectedDeleteControl: {
        method: 'POST',
        endpoint: '/api/delete',
        memoryIds: ['mem_freeze_vs_feature_addition'],
        disabled: false,
      },
      hardDeleteControl: {
        method: 'POST',
        endpoint: '/api/delete',
        confirmationPhrase: 'DELETE MY PRIVATE MEMORY VAULT',
        disabled: true,
      },
    });
    expect(state.exportControl.memoryIds).toEqual(personalMemoryRecords.map((record) => record.id));
    expect(state.apiBoundary).toEqual(['GET /api/export', 'POST /api/delete']);
  });

  test('keeps hard delete disabled until the exact confirmation phrase is entered', () => {
    const phrase = 'DELETE MY PRIVATE MEMORY VAULT';

    expect(evaluateHardDeleteConfirmation({ expectedPhrase: phrase, enteredPhrase: '' })).toEqual({
      disabled: true,
      reason: 'confirmation_required',
    });
    expect(evaluateHardDeleteConfirmation({ expectedPhrase: phrase, enteredPhrase: 'delete my private memory vault' })).toEqual({
      disabled: true,
      reason: 'confirmation_mismatch',
    });
    expect(evaluateHardDeleteConfirmation({ expectedPhrase: phrase, enteredPhrase: phrase })).toEqual({
      disabled: false,
      reason: 'confirmation_matched',
    });
  });

  test('keeps selected delete disabled when no memory ids are selected', () => {
    const state = buildPrivacyControlState({
      userId: 'local-user',
      records: personalMemoryRecords,
      selectedMemoryIds: [],
    });

    expect(state.selectedDeleteControl).toMatchObject({
      memoryIds: [],
      disabled: true,
      disabledReason: 'no_selected_memory',
    });
  });
});
