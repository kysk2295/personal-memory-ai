import { askMyPastSelf } from './askMyPastSelf';
import { replayDecision } from './decisionReplay';
import { buildGraphEvidence, type EvidenceDrawerItem } from './graphEvidence';
import { buildImportPreview } from './importPreview';
import { compileMemoryRecordsToWikiGraph, type CompiledWikiGraph } from './llmWikiCompiler';
import { buildMemoryDetailTimeline, type MemoryDetailTimeline } from './memoryDetailTimeline';
import { isMemoryReviewLedgerRecord } from './memoryReviewLedger';
import { personalMemoryRecords } from './__fixtures__/personalMemoryRecords';
import type { MemoryRecord } from './memoryRecord';
import type { MemoryStore } from './memoryStore';
import { detectRepeatedPatterns, type PatternDetectionStatus } from './patternDetector';
import { buildPrivacyControlState, type PrivacyControlState } from './privacyControls';
import { buildSavedArtifactActions, type SavedArtifactAction } from './savedArtifactActions';
import { savedArtifactToMemoryRecord } from './savedMemoryArtifact';
import { generateWeeklyReport, type WeeklyReport } from './weeklyReport';

export type ShellLinkKind = 'emotion' | 'project' | 'decision' | 'outcome' | 'source';

export interface ShellPrimaryNode {
  id: string;
  recordId: string;
  label: string;
  recordType: MemoryRecord['memoryType'];
  sourceType: MemoryRecord['sourceType'];
  observedAt: string;
  summary: string;
  status: PatternDetectionStatus;
}

export interface ShellLink {
  id: string;
  from: string;
  to: string;
  kind: ShellLinkKind;
  label: string;
  status: PatternDetectionStatus;
}

export interface ShellSurfaceStatus {
  id: string;
  label: string;
  status: PatternDetectionStatus;
  description: string;
}

export interface InitialAppShellEvidenceLayout {
  northStar: '나보다 나를 더 잘 아는 개인 기억 AI.';
  askQuestion: string;
  records: MemoryRecord[];
  primaryNodes: ShellPrimaryNode[];
  links: ShellLink[];
  surfaces: ShellSurfaceStatus[];
  ask: ReturnType<typeof askMyPastSelf>;
  patterns: ReturnType<typeof detectRepeatedPatterns>;
  replay: ReturnType<typeof replayDecision>;
  weeklyReport: WeeklyReport;
  importPreview: ReturnType<typeof buildImportPreview>;
  compiledWiki: CompiledWikiGraph;
  memoryTimeline: MemoryDetailTimeline;
  savedArtifactActions: SavedArtifactAction[];
  privacyControls: PrivacyControlState;
  evidenceDrawer: {
    status: PatternDetectionStatus;
    items: EvidenceDrawerItem[];
  };
}

function slugifyGraphValue(value: string): string {
  return value
    .trim()
    .toLocaleLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function appendUniqueLink(target: ShellLink[], link: ShellLink): void {
  if (target.some((existing) => existing.id === link.id)) return;
  target.push(link);
}

function buildPrimaryNodes(records: readonly MemoryRecord[]): ShellPrimaryNode[] {
  return records.map((record) => ({
    id: `memory:${record.id}`,
    recordId: record.id,
    label: record.summary,
    recordType: record.memoryType,
    sourceType: record.sourceType,
    observedAt: record.observedAt ?? record.createdAt.slice(0, 10),
    summary: record.summary,
    status: 'implemented',
  }));
}

function buildRecordLinks(records: readonly MemoryRecord[]): ShellLink[] {
  const links: ShellLink[] = [];

  for (const record of records) {
    const memoryNodeId = `memory:${record.id}`;
    for (const emotion of record.emotionTags) {
      const target = `emotion:${slugifyGraphValue(emotion)}`;
      appendUniqueLink(links, {
        id: `${memoryNodeId}->${target}`,
        from: memoryNodeId,
        to: target,
        kind: 'emotion',
        label: emotion,
        status: 'implemented',
      });
    }
    for (const project of record.projectTags) {
      const target = `project:${slugifyGraphValue(project)}`;
      appendUniqueLink(links, {
        id: `${memoryNodeId}->${target}`,
        from: memoryNodeId,
        to: target,
        kind: 'project',
        label: project,
        status: 'implemented',
      });
    }
    if (record.decisionSignal !== 'none') {
      const target = `decision:${slugifyGraphValue(record.decisionSignal)}`;
      appendUniqueLink(links, {
        id: `${memoryNodeId}->${target}`,
        from: memoryNodeId,
        to: target,
        kind: 'decision',
        label: record.decisionSignal,
        status: 'implemented',
      });
    }
    if (record.outcomeText) {
      const target = `outcome:${slugifyGraphValue(record.outcomeText)}`;
      appendUniqueLink(links, {
        id: `${memoryNodeId}->${target}`,
        from: memoryNodeId,
        to: target,
        kind: 'outcome',
        label: record.outcomeText,
        status: 'implemented',
      });
    }
    const sourceTarget = `source:${record.sourceType}`;
    appendUniqueLink(links, {
      id: `${memoryNodeId}->${sourceTarget}`,
      from: memoryNodeId,
      to: sourceTarget,
      kind: 'source',
      label: record.sourceType,
      status: 'implemented',
    });
  }

  return links;
}

export function buildAppShellEvidenceLayoutFromRecords(records: readonly MemoryRecord[]): InitialAppShellEvidenceLayout {
  const allRecords = [...records];
  const baseRecords = allRecords.filter((record) => !isMemoryReviewLedgerRecord(record));
  const patterns = detectRepeatedPatterns(records);
  const askQuestion = '이번에도 기능을 더 넣어야 할까?';
  const ask = askMyPastSelf({
    question: askQuestion,
    memories: baseRecords,
    patterns: patterns.patterns,
  });
  const replay = replayDecision({
    currentDecision: {
      id: 'decision_current_add_replay_polish',
      prompt: 'Should I add more Decision Replay polish before review?',
      emotions: ['anxiety', 'pressure'],
      choices: ['add polish', 'freeze for review'],
      topicTags: ['launch', 'feature addition', 'Decision Replay'],
    },
    memories: baseRecords,
    patterns: patterns.patterns,
  });
  const weeklyReport = generateWeeklyReport({
    records: baseRecords,
    startDate: '2026-05-01',
    endDate: '2026-05-20',
    generatedAt: '2026-05-27T11:00:00.000Z',
  });
  const graphEvidence = buildGraphEvidence({
    currentQuery: {
      id: 'ask_current_more_features',
      text: askQuestion,
      createdAt: '2026-05-26T10:00:00.000Z',
    },
    memories: baseRecords,
    askAnswer: ask,
    patterns: patterns.patterns,
    replay,
  });
  const importPreview = buildImportPreview({
    batchId: 'first-screen-import-preview',
    createdAt: '2026-05-26T09:00:00.000Z',
    existingRecords: baseRecords,
    candidates: [
      {
        sourceType: 'notion',
        sourceRef: 'notion://launch-journal/may',
        observedAt: '2026-05-01',
        rawText:
          'Felt anxious before shipping the memory import demo, so I expanded scope with graph filters and extra polish. Launch slipped by two days.',
        summary: 'Duplicate Notion launch journal import candidate.',
        memoryType: 'decision',
        emotionTags: ['anxiety'],
        projectTags: ['personal-memory-ai'],
      },
      {
        sourceType: 'markdown',
        sourceRef: 'markdown://daily/2026-05-26.md',
        observedAt: '2026-05-26',
        rawText: 'Captured a review note: keep the graph as evidence, not the whole product.',
        summary: 'Review note to keep the graph as evidence.',
        memoryType: 'reflection',
        emotionTags: ['resolve'],
        projectTags: ['personal-memory-ai'],
      },
    ],
  });
  const savedArtifactActions = buildSavedArtifactActions({
    askQuestion,
    ask,
    replay,
    weeklyReport,
    createdAt: '2026-05-28T00:00:00.000Z',
  });
  const savedArtifactRecords = savedArtifactActions.map((action) => savedArtifactToMemoryRecord(action.artifact));
  const displayRecords = [...baseRecords, ...savedArtifactRecords];
  const compiledWiki = compileMemoryRecordsToWikiGraph(displayRecords);
  const privacyControls = buildPrivacyControlState({
    userId: 'local-user',
    records: displayRecords,
    selectedMemoryIds: ['mem_freeze_vs_feature_addition'],
    generatedAt: '2026-05-27T14:00:00.000Z',
  });
  const memoryTimeline = buildMemoryDetailTimeline(
    [...displayRecords, ...allRecords.filter(isMemoryReviewLedgerRecord)],
    'mem_freeze_vs_feature_addition',
  );

  return {
    northStar: '나보다 나를 더 잘 아는 개인 기억 AI.',
    askQuestion,
    records: displayRecords,
    primaryNodes: buildPrimaryNodes(displayRecords),
    links: buildRecordLinks(displayRecords),
    surfaces: [
      {
        id: 'seed-memory-fixtures',
        label: 'Initial loaded memory seed',
        status: 'fake/sample',
        description: 'Review dataset only: diary/imported MemoryRecords are seeded so the first screen is loaded without reading private files.',
      },
      {
        id: 'app-quick-diary-capture',
        label: 'App quick diary capture',
        status: 'partial',
        description: 'Fast capture contract exists in lib; native app surface is still separate from this web shell.',
      },
      {
        id: 'app-capture-native-client',
        label: 'Native app capture client',
        status: 'skeleton',
        description: 'Two-surface product boundary is represented, but iOS/Android/macOS capture clients are not built in this web cycle.',
      },
      {
        id: 'web-graph-workspace',
        label: 'Web graph workspace',
        status: 'implemented',
        description: 'Initial loaded browser graph connects diary/import memories by emotion, project, decision, outcome, and source.',
      },
      {
        id: 'import-preview',
        label: 'Notion/Obsidian/Markdown import preview',
        status: importPreview.contract.status,
        description: 'Preview contract and sample batch are wired; live OAuth import is intentionally not required here.',
      },
      {
        id: 'ask-my-past-self',
        label: 'Ask My Past Self',
        status: ask.status,
        description: 'Answer is generated only from cited MemoryRecord evidence.',
      },
      {
        id: 'pattern-panel',
        label: 'Pattern panel',
        status: patterns.status,
        description: 'Repeated anxiety -> scope expansion -> launch delay pattern is detected from citations.',
      },
      {
        id: 'decision-replay',
        label: 'Decision Replay',
        status: replay.status,
        description: 'Current decision is compared with cited past decision memories.',
      },
      {
        id: 'weekly-report',
        label: 'Weekly report',
        status: weeklyReport.status,
        description: 'Weekly synthesis is generated from dated MemoryRecord citations and rendered as a private report surface.',
      },
      {
        id: 'memory-detail-timeline',
        label: 'Memory detail timeline',
        status: 'implemented',
        description: 'Dated diary/import memories are inspectable as source-backed timeline entries linked to the active graph selection.',
      },
      {
        id: 'saved-artifact-actions',
        label: 'Saved artifact actions',
        status: 'implemented',
        description: 'Ask, Decision Replay, and Weekly Report outputs expose save actions that point to private future MemoryRecords.',
      },
      {
        id: 'evidence-drawer',
        label: 'Evidence drawer',
        status: graphEvidence.status,
        description: 'Highlighted graph nodes and actions expose source/date/citation traces.',
      },
      {
        id: 'privacy-export-delete',
        label: 'Privacy export/delete controls',
        status: 'partial',
        description: 'Local prototype exposes owner-only export, selected delete, and hard-delete confirmation before auth is connected.',
      },
    ],
    ask,
    patterns,
    replay,
    weeklyReport,
    importPreview,
    compiledWiki,
    memoryTimeline,
    savedArtifactActions,
    privacyControls,
    evidenceDrawer: {
      status: graphEvidence.status,
      items: graphEvidence.drawerItems,
    },
  };
}

export interface BuildAppShellEvidenceLayoutFromMemoryStoreInput {
  store: MemoryStore;
  userId: string;
}

export async function buildAppShellEvidenceLayoutFromMemoryStore(
  input: BuildAppShellEvidenceLayoutFromMemoryStoreInput,
): Promise<InitialAppShellEvidenceLayout> {
  return buildAppShellEvidenceLayoutFromRecords(await input.store.listByUser(input.userId));
}

export function buildInitialAppShellEvidenceLayout(): InitialAppShellEvidenceLayout {
  return buildAppShellEvidenceLayoutFromRecords(personalMemoryRecords);
}
