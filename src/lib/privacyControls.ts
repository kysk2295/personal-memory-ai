import type { MemoryRecord } from './memoryRecord';

export type PrivacyStorageMode = 'local-prototype';
export type PrivacyVaultAccess = 'owner-only';
export type PrivacyAuthStatus = 'not-connected-local-prototype';
export type PrivacyTransportStatus = 'local-only-static-prototype';
export type PrivacyControlMethod = 'GET' | 'POST';

export interface PrivacyExportControl {
  method: Extract<PrivacyControlMethod, 'GET'>;
  endpoint: '/api/export';
  format: 'memory-record-json';
  filename: string;
  recordCount: number;
  memoryIds: string[];
  generatedAt: string;
}

export interface PrivacySelectedDeleteControl {
  method: Extract<PrivacyControlMethod, 'POST'>;
  endpoint: '/api/delete';
  memoryIds: string[];
  disabled: boolean;
  disabledReason?: 'no_selected_memory';
}

export interface PrivacyHardDeleteControl {
  method: Extract<PrivacyControlMethod, 'POST'>;
  endpoint: '/api/delete';
  confirmationPhrase: string;
  disabled: boolean;
  disabledReason: 'confirmation_required';
}

export interface PrivacyControlState {
  privacyScope: 'private';
  vaultAccess: PrivacyVaultAccess;
  storageMode: PrivacyStorageMode;
  authStatus: PrivacyAuthStatus;
  transportStatus: PrivacyTransportStatus;
  ownerUserId: string;
  recordCount: number;
  exportControl: PrivacyExportControl;
  selectedDeleteControl: PrivacySelectedDeleteControl;
  hardDeleteControl: PrivacyHardDeleteControl;
  apiBoundary: ['GET /api/export', 'POST /api/delete'];
}

export interface BuildPrivacyControlStateInput {
  userId: string;
  records: readonly MemoryRecord[];
  selectedMemoryIds?: readonly string[];
  generatedAt?: string;
}

export interface HardDeleteConfirmationInput {
  expectedPhrase: string;
  enteredPhrase: string;
}

export interface HardDeleteConfirmationResult {
  disabled: boolean;
  reason: 'confirmation_required' | 'confirmation_mismatch' | 'confirmation_matched';
}

const HARD_DELETE_CONFIRMATION_PHRASE = 'DELETE MY PRIVATE MEMORY VAULT';

function dateStamp(value: string): string {
  return value.slice(0, 10);
}

export function evaluateHardDeleteConfirmation(input: HardDeleteConfirmationInput): HardDeleteConfirmationResult {
  if (!input.enteredPhrase) {
    return { disabled: true, reason: 'confirmation_required' };
  }
  if (input.enteredPhrase !== input.expectedPhrase) {
    return { disabled: true, reason: 'confirmation_mismatch' };
  }
  return { disabled: false, reason: 'confirmation_matched' };
}

export function buildPrivacyControlState(input: BuildPrivacyControlStateInput): PrivacyControlState {
  const generatedAt = input.generatedAt ?? '2026-05-27T14:00:00.000Z';
  const memoryIds = input.records.map((record) => record.id);
  const selectedMemoryIds = [...(input.selectedMemoryIds ?? memoryIds.slice(0, 1))].filter((memoryId) =>
    memoryIds.includes(memoryId),
  );

  return {
    privacyScope: 'private',
    vaultAccess: 'owner-only',
    storageMode: 'local-prototype',
    authStatus: 'not-connected-local-prototype',
    transportStatus: 'local-only-static-prototype',
    ownerUserId: input.userId,
    recordCount: input.records.length,
    exportControl: {
      method: 'GET',
      endpoint: '/api/export',
      format: 'memory-record-json',
      filename: `personal-memory-export-${input.userId}-${dateStamp(generatedAt)}.json`,
      recordCount: input.records.length,
      memoryIds,
      generatedAt,
    },
    selectedDeleteControl: {
      method: 'POST',
      endpoint: '/api/delete',
      memoryIds: selectedMemoryIds,
      disabled: selectedMemoryIds.length === 0,
      disabledReason: selectedMemoryIds.length === 0 ? 'no_selected_memory' : undefined,
    },
    hardDeleteControl: {
      method: 'POST',
      endpoint: '/api/delete',
      confirmationPhrase: HARD_DELETE_CONFIRMATION_PHRASE,
      disabled: true,
      disabledReason: 'confirmation_required',
    },
    apiBoundary: ['GET /api/export', 'POST /api/delete'],
  };
}
