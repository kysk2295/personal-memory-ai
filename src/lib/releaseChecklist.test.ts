import { describe, expect, test } from 'vitest';
import { buildReleaseChecklist } from './releaseChecklist';

describe('release checklist', () => {
  test('lists release gates for verified remote push without allowing secret output', () => {
    const checklist = buildReleaseChecklist({
      localUrl: 'http://127.0.0.1:3001',
      branch: 'product-reset-superpowers',
      commitSha: 'abc1234',
    });

    expect(checklist.status).toBe('ready_for_local_review');
    expect(checklist.branch).toBe('product-reset-superpowers');
    expect(checklist.commitSha).toBe('abc1234');
    expect(checklist.requiredCommands.map((command) => command.name)).toEqual([
      'typecheck',
      'unit-tests',
      'static-build',
      'service-flow-smoke',
      'playwright-evidence',
      'evidence-cleanup',
      'diff-check',
    ]);
    expect(checklist.requiredCommands.find((command) => command.name === 'service-flow-smoke')).toEqual(
      expect.objectContaining({
        command: 'PMI_LOCAL_URL=http://127.0.0.1:3001 npm run evidence:service-flow',
        requiresRunningServer: true,
      }),
    );
    expect(checklist.prohibitedActions).toEqual(['print_secrets']);
    expect(checklist.remoteActionsAllowedWhenExplicitlyRequested).toEqual([
      'push_remote',
      'merge_deploy_branch',
      'deploy_configured_staging',
    ]);
    expect(checklist.humanApprovalRequiredFor).toEqual(['secret_access', 'production_secret_rotation']);
    expect(checklist.evidenceArtifacts).toContain(
      'artifacts/web-second-brain-product-surface/local-app-capture-playwright.png',
    );
    expect(checklist.evidenceArtifacts).toContain(
      'artifacts/web-second-brain-product-surface/local-service-flow-playwright.png',
    );
    expect(JSON.stringify(checklist)).not.toContain('DATABASE_URL');
    expect(JSON.stringify(checklist)).not.toContain('secret-password');
    expect(JSON.stringify(checklist)).not.toContain('sk-');
  });
});
