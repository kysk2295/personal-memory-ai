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
      prompt: '오늘 MVP를 보여줄까, 아니면 결정 되짚기 화면을 더 다듬을까?',
      emotions: ['anxiety', 'pressure', '불안'],
      choices: ['더 다듬기', '리뷰용으로 고정하기'],
      topicTags: ['launch', 'feature addition', '결정 되짚기'],
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
          '기억 가져오기 데모를 내보내기 전 불안해서 그래프 필터와 추가 다듬기를 붙였다. 결국 출시가 이틀 늦어졌다.',
        summary: '이미 들어온 Notion 출시 일기 후보.',
        memoryType: 'decision',
        emotionTags: ['anxiety'],
        projectTags: ['personal-memory-ai'],
      },
      {
        sourceType: 'markdown',
        sourceRef: 'markdown://daily/2026-05-26.md',
        observedAt: '2026-05-26',
        rawText: '리뷰 메모: 그래프는 제품 전체가 아니라 근거를 보여주는 장치로 남긴다.',
        summary: '그래프를 근거 장치로 유지하자는 리뷰 메모.',
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
        label: '처음 불러온 일기 기억 씨앗',
        status: 'fake/sample',
        description: '리뷰용 데이터입니다. 개인 파일을 읽지 않아도 첫 화면에서 일기/가져온 기억 흐름을 볼 수 있게 MemoryRecord를 심어둡니다.',
      },
      {
        id: 'app-quick-diary-capture',
        label: '앱 빠른 일기 기록',
        status: 'partial',
        description: '빠른 기록 계약은 연결되어 있고, 네이티브 앱 화면은 웹 세컨브레인과 분리된 표면으로 남겨둡니다.',
      },
      {
        id: 'app-capture-native-client',
        label: '네이티브 일기 앱 클라이언트',
        status: 'skeleton',
        description: '앱 기록과 웹 세컨브레인의 경계는 표시되어 있지만 iOS/Android/macOS 클라이언트는 아직 별도 구현 대상입니다.',
      },
      {
        id: 'web-graph-workspace',
        label: '웹 세컨브레인 그래프',
        status: 'implemented',
        description: '브라우저 그래프가 일기/가져온 기억을 감정, 프로젝트, 결정, 결과, 출처로 연결합니다.',
      },
      {
        id: 'import-preview',
        label: 'Notion/Obsidian/Markdown 일기 가져오기 미리보기',
        status: importPreview.contract.status,
        description: '미리보기 계약과 샘플 배치가 연결되어 있고, 실시간 OAuth 가져오기는 별도 게이트로 둡니다.',
      },
      {
        id: 'ask-my-past-self',
        label: '과거의 나에게 묻기',
        status: ask.status,
        description: '답변은 인용된 MemoryRecord 근거에서만 생성됩니다.',
      },
      {
        id: 'pattern-panel',
        label: '반복 패턴',
        status: patterns.status,
        description: '인용된 기억에서 불안 -> 범위 확장 -> 출시 지연 패턴을 감지합니다.',
      },
      {
        id: 'decision-replay',
        label: '결정 되짚기',
        status: replay.status,
        description: '지금의 결정을 인용된 과거 결정 기억과 비교합니다.',
      },
      {
        id: 'weekly-report',
        label: '주간 패턴',
        status: weeklyReport.status,
        description: '날짜가 있는 MemoryRecord 인용으로 주간 흐름을 만들고 비공개 리포트로 보여줍니다.',
      },
      {
        id: 'memory-detail-timeline',
        label: '기억 상세 타임라인',
        status: 'implemented',
        description: '날짜가 있는 일기/가져온 기억을 활성 그래프 선택과 연결된 출처 기반 타임라인으로 확인합니다.',
      },
      {
        id: 'saved-artifact-actions',
        label: '세션 결과 다시 기억으로 저장',
        status: 'implemented',
        description: '묻기, 결정 되짚기, 주간 패턴 결과를 미래의 비공개 MemoryRecord로 저장하는 액션을 제공합니다.',
      },
      {
        id: 'evidence-drawer',
        label: '근거 서랍',
        status: graphEvidence.status,
        description: '하이라이트된 그래프 노드와 액션이 출처, 날짜, 인용 흔적을 보여줍니다.',
      },
      {
        id: 'privacy-export-delete',
        label: '비공개 내보내기/삭제 제어',
        status: 'partial',
        description: '인증 연결 전에도 로컬 프로토타입에서 소유자 전용 내보내기, 선택 삭제, 영구 삭제 확인을 보여줍니다.',
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
