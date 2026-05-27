import type { ImportPreviewCandidate } from './importPreview';
import type { MemorySourceType } from './memoryRecord';

export interface ImportUploadFileInput {
  name: string;
  path?: string;
  text: string;
  lastModified?: string;
}

export interface ImportUploadDraftFile {
  name: string;
  path?: string;
  candidateCount: number;
  blocked: boolean;
  reason?: 'empty_file';
}

export interface ImportUploadDraft {
  batchId: string;
  createdAt: string;
  requiresLiveOAuth: false;
  files: ImportUploadDraftFile[];
  candidates: ImportPreviewCandidate[];
}

export interface BuildImportUploadDraftInput {
  batchId: string;
  createdAt: string;
  files: readonly ImportUploadFileInput[];
}

function stripMarkdownHeading(text: string): string {
  return text
    .split('\n')
    .filter((line) => !line.trim().startsWith('# '))
    .join('\n')
    .trim();
}

function dateFromNameOrCreatedAt(name: string, createdAt: string): string {
  return name.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? createdAt.slice(0, 10);
}

function sourceRefForFile(file: ImportUploadFileInput, index?: number): string {
  const path = file.path ?? file.name;
  return `markdown://${path}${index === undefined ? '' : `#${index + 1}`}`;
}

function isSupportedSourceType(value: unknown): value is Extract<MemorySourceType, 'notion' | 'obsidian' | 'markdown'> {
  return value === 'notion' || value === 'obsidian' || value === 'markdown';
}

function textFromJsonItem(item: Record<string, unknown>): string {
  const rawText = typeof item.rawText === 'string' ? item.rawText : undefined;
  const text = typeof item.text === 'string' ? item.text : undefined;
  return (rawText ?? text ?? '').trim();
}

function candidateFromJsonItem(
  file: ImportUploadFileInput,
  item: Record<string, unknown>,
  index: number,
  createdAt: string,
): ImportPreviewCandidate | null {
  const rawText = textFromJsonItem(item);
  if (!rawText) return null;
  const sourceType = isSupportedSourceType(item.sourceType) ? item.sourceType : 'markdown';
  const sourceRef = typeof item.sourceRef === 'string' ? item.sourceRef : sourceRefForFile(file, index);
  const observedAt = typeof item.observedAt === 'string' ? item.observedAt : dateFromNameOrCreatedAt(file.name, createdAt);
  const summary = typeof item.summary === 'string' ? item.summary : undefined;

  return {
    sourceType,
    sourceRef,
    observedAt,
    rawText,
    summary,
    provenance: {
      importer: 'local-file-upload',
      sourceName: file.name,
      ...(file.path ? { sourcePath: file.path } : {}),
    },
  };
}

function jsonCandidates(
  file: ImportUploadFileInput,
  createdAt: string,
): ImportPreviewCandidate[] | null {
  if (!file.name.toLocaleLowerCase().endsWith('.json')) return null;
  try {
    const parsed = JSON.parse(file.text) as unknown;
    const rows = Array.isArray(parsed) ? parsed : [parsed];
    return rows
      .filter((row): row is Record<string, unknown> => typeof row === 'object' && row !== null)
      .map((row, index) => candidateFromJsonItem(file, row, index, createdAt))
      .filter((candidate): candidate is ImportPreviewCandidate => Boolean(candidate));
  } catch {
    return null;
  }
}

function textCandidate(
  file: ImportUploadFileInput,
  createdAt: string,
): ImportPreviewCandidate | null {
  const rawText = stripMarkdownHeading(file.text);
  if (!rawText) return null;
  return {
    sourceType: 'markdown',
    sourceRef: sourceRefForFile(file),
    observedAt: file.lastModified?.slice(0, 10) ?? dateFromNameOrCreatedAt(file.name, createdAt),
    rawText,
    provenance: {
      importer: 'local-file-upload',
      sourceName: file.name,
      ...(file.path ? { sourcePath: file.path } : {}),
    },
  };
}

export function buildImportUploadDraft(input: BuildImportUploadDraftInput): ImportUploadDraft {
  const files: ImportUploadDraftFile[] = [];
  const candidates: ImportPreviewCandidate[] = [];

  for (const file of input.files) {
    const fileCandidates = jsonCandidates(file, input.createdAt) ?? [textCandidate(file, input.createdAt)].filter(
      (candidate): candidate is ImportPreviewCandidate => Boolean(candidate),
    );
    files.push({
      name: file.name,
      ...(file.path ? { path: file.path } : {}),
      candidateCount: fileCandidates.length,
      blocked: fileCandidates.length === 0,
      ...(fileCandidates.length === 0 ? { reason: 'empty_file' as const } : {}),
    });
    candidates.push(...fileCandidates);
  }

  return {
    batchId: input.batchId,
    createdAt: input.createdAt,
    requiresLiveOAuth: false,
    files,
    candidates,
  };
}
