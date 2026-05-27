import { describe, expect, test } from 'vitest';
import {
  buildPgvectorStagingSmokePlan,
  buildRedactedEnvPresenceReport,
} from './stagingReadiness';

describe('staging backend readiness', () => {
  test('reports env presence without leaking secret values', () => {
    const report = buildRedactedEnvPresenceReport({
      MEMORY_BACKEND_MODE: 'postgres',
      DATABASE_URL: 'postgres://user:secret-password@example.internal:5432/db',
      OPENAI_API_KEY: 'sk-secret-key',
      RAILWAY_ENVIRONMENT: 'staging',
    });

    expect(report.safeToLog).toBe(true);
    expect(report.entries).toEqual(
      expect.arrayContaining([
        { key: 'MEMORY_BACKEND_MODE', presence: 'present' },
        { key: 'DATABASE_URL', presence: 'present' },
        { key: 'OPENAI_API_KEY', presence: 'present' },
        { key: 'PGVECTOR_DIMENSIONS', presence: 'missing' },
      ]),
    );
    const serialized = JSON.stringify(report);
    expect(serialized).not.toContain('secret-password');
    expect(serialized).not.toContain('sk-secret-key');
    expect(serialized).not.toContain('example.internal');
  });

  test('builds a staging-only pgvector smoke plan that covers extension, search, delete, and isolation', () => {
    const plan = buildPgvectorStagingSmokePlan({
      dimensions: 3,
      testUserId: 'staging-smoke-user-a',
      isolationUserId: 'staging-smoke-user-b',
    });

    expect(plan.mutationScope).toBe('staging-test-users-only');
    expect(plan.safeToLog).toBe(true);
    expect(plan.embeddingDimensions).toBe(3);
    expect(plan.prohibitedActions).toEqual([
      'print_raw_secrets',
      'touch_production_data',
      'run_without_test_user_ids',
    ]);
    expect(plan.steps.map((step) => step.id)).toEqual([
      'extension-check',
      'insert-test-memory-a',
      'insert-test-memory-b',
      'save-test-embeddings',
      'semantic-search-user-a',
      'delete-test-user-a',
      'verify-user-b-isolation',
    ]);
    expect(plan.steps.find((step) => step.id === 'semantic-search-user-a')).toMatchObject({
      assertion: 'returns only staging-smoke-user-a memories ordered by vector distance',
    });
    expect(plan.steps.find((step) => step.id === 'verify-user-b-isolation')).toMatchObject({
      assertion: 'staging-smoke-user-b memory still exists after deleting staging-smoke-user-a data',
    });
    expect(JSON.stringify(plan)).not.toContain('DATABASE_URL');
  });
});
