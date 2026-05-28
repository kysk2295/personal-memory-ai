export type ReleaseChecklistStatus = 'ready_for_local_review';

export interface ReleaseChecklistCommand {
  name: string;
  command: string;
  purpose: string;
  requiresRunningServer?: boolean;
}

export interface BuildReleaseChecklistInput {
  localUrl: string;
  branch: string;
  commitSha: string;
}

export interface ReleaseChecklist {
  status: ReleaseChecklistStatus;
  branch: string;
  commitSha: string;
  localUrl: string;
  requiredCommands: ReleaseChecklistCommand[];
  evidenceArtifacts: string[];
  prohibitedActions: string[];
  humanApprovalRequiredFor: string[];
}

export function buildReleaseChecklist(input: BuildReleaseChecklistInput): ReleaseChecklist {
  return {
    status: 'ready_for_local_review',
    branch: input.branch,
    commitSha: input.commitSha,
    localUrl: input.localUrl,
    requiredCommands: [
      {
        name: 'typecheck',
        command: 'npm run typecheck',
        purpose: 'verify TypeScript contracts before release review',
      },
      {
        name: 'unit-tests',
        command: 'npm test',
        purpose: 'verify memory, privacy, API, import, Ask, report, and graph contracts',
      },
      {
        name: 'static-build',
        command: 'npm run build',
        purpose: 'render the static second-brain shell used by local review',
      },
      {
        name: 'playwright-evidence',
        command: `PMI_LOCAL_URL=${input.localUrl} npm run evidence:playwright`,
        purpose: 'verify browser interactions, graph rendering, live Ask, follow-up context, save actions, imports, and screenshots',
        requiresRunningServer: true,
      },
      {
        name: 'evidence-cleanup',
        command: 'npm run cleanup:evidence',
        purpose: 'confirm no Playwright-created evidence records remain in the private local vault',
        requiresRunningServer: true,
      },
      {
        name: 'diff-check',
        command: 'git diff --check',
        purpose: 'catch whitespace or patch formatting issues before review',
      },
    ],
    evidenceArtifacts: [
      'artifacts/web-second-brain-product-surface/benchmark-careerhacker-memory-playwright.png',
      'artifacts/web-second-brain-product-surface/local-graph-density-playwright.png',
      'artifacts/web-second-brain-product-surface/local-graph-interactions-playwright.png',
      'artifacts/web-second-brain-product-surface/local-memory-search-detail-playwright.png',
      'artifacts/web-second-brain-product-surface/local-app-capture-playwright.png',
    ],
    prohibitedActions: ['push_remote', 'merge_main', 'deploy_production', 'print_secrets'],
    humanApprovalRequiredFor: ['remote_push', 'main_merge', 'production_deploy', 'secret_access'],
  };
}
