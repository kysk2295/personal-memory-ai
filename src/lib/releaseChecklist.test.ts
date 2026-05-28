import { describe, expect, test } from 'vitest';
import { buildReleaseChecklist } from './releaseChecklist';

describe('release checklist', () => {
  test('lists local release gates without allowing remote mutation or secret output', () => {
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
      'playwright-evidence',
      'evidence-cleanup',
      'diff-check',
    ]);
    expect(checklist.prohibitedActions).toEqual(['push_remote', 'merge_main', 'deploy_production', 'print_secrets']);
    expect(checklist.humanApprovalRequiredFor).toEqual(['remote_push', 'main_merge', 'production_deploy', 'secret_access']);
    expect(JSON.stringify(checklist)).not.toContain('DATABASE_URL');
    expect(JSON.stringify(checklist)).not.toContain('secret-password');
    expect(JSON.stringify(checklist)).not.toContain('sk-');
  });
});
