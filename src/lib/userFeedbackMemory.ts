import { normalizeMemoryRecord, type MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';

export interface UserFeedbackMemoryInput {
  feedbackId?: string;
  createdAt?: string;
  correctionText: string;
  targetMemoryIds?: string[];
  targetArtifactId?: string;
  emotionTags?: string[];
  projectTags?: string[];
}

export interface SaveUserFeedbackMemoryInput {
  store: MemoryStore;
  userId: string;
  input: UserFeedbackMemoryInput;
}

export interface SaveUserFeedbackMemoryResult {
  createdMemoryIds: string[];
  record: MemoryRecord;
}

function stableHash(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).padStart(7, '0');
}

function dateOnly(createdAt: string): string {
  return createdAt.slice(0, 10);
}

export function createUserFeedbackMemoryRecord(input: UserFeedbackMemoryInput): MemoryRecord {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const targetMemoryIds = input.targetMemoryIds ?? [];
  const feedbackId =
    input.feedbackId ??
    `feedback-${stableHash([input.correctionText, targetMemoryIds.join(','), input.targetArtifactId ?? ''].join('\u001f'))}`;
  const rawText = [
    `User correction: ${input.correctionText}`,
    `Target memories: ${targetMemoryIds.join(', ') || 'none'}`,
    `Target artifact: ${input.targetArtifactId ?? 'none'}`,
    'Learning instruction: prefer this user correction over the earlier generated interpretation when the same context appears again.',
  ].join('\n');

  return normalizeMemoryRecord({
    id: `mem_api_feedback_${stableHash([feedbackId, rawText].join('\u001f'))}`,
    sourceType: 'api',
    sourceRef: `personal-memory-ai://feedback/${feedbackId}`,
    createdAt,
    observedAt: dateOnly(createdAt),
    rawText,
    summary: `User correction: ${input.correctionText}`,
    memoryType: 'reflection',
    emotionTags: input.emotionTags,
    topicTags: ['agent feedback', 'correction'],
    projectTags: input.projectTags ?? ['personal-memory-ai'],
    extractionStatus: 'manual',
  });
}

export async function saveUserFeedbackMemory(
  input: SaveUserFeedbackMemoryInput,
): Promise<SaveUserFeedbackMemoryResult> {
  const record = createUserFeedbackMemoryRecord(input.input);
  await input.store.create(input.userId, record);
  return {
    createdMemoryIds: [record.id],
    record,
  };
}
