export type StagingEnvKey =
  | 'MEMORY_BACKEND_MODE'
  | 'DATABASE_URL'
  | 'PGVECTOR_DIMENSIONS'
  | 'OPENAI_API_KEY'
  | 'RAILWAY_ENVIRONMENT'
  | 'RAILWAY_PROJECT_ID';

export type EnvPresence = 'present' | 'missing';

export interface RedactedEnvPresenceEntry {
  key: StagingEnvKey;
  presence: EnvPresence;
}

export interface RedactedEnvPresenceReport {
  safeToLog: true;
  redaction: 'presence-only';
  entries: RedactedEnvPresenceEntry[];
}

export type PgvectorSmokeStepId =
  | 'extension-check'
  | 'insert-test-memory-a'
  | 'insert-test-memory-b'
  | 'save-test-embeddings'
  | 'semantic-search-user-a'
  | 'delete-test-user-a'
  | 'verify-user-b-isolation';

export interface PgvectorSmokeStep {
  id: PgvectorSmokeStepId;
  operation: string;
  assertion: string;
}

export interface PgvectorStagingSmokePlan {
  safeToLog: true;
  mutationScope: 'staging-test-users-only';
  embeddingDimensions: number;
  testUserIds: [string, string];
  prohibitedActions: ['print_raw_secrets', 'touch_production_data', 'run_without_test_user_ids'];
  steps: PgvectorSmokeStep[];
}

export interface BuildPgvectorStagingSmokePlanInput {
  dimensions: number;
  testUserId: string;
  isolationUserId: string;
}

const REQUIRED_ENV_KEYS: StagingEnvKey[] = [
  'MEMORY_BACKEND_MODE',
  'DATABASE_URL',
  'PGVECTOR_DIMENSIONS',
  'OPENAI_API_KEY',
  'RAILWAY_ENVIRONMENT',
  'RAILWAY_PROJECT_ID',
];

export function buildRedactedEnvPresenceReport(
  env: Record<string, string | undefined>,
): RedactedEnvPresenceReport {
  return {
    safeToLog: true,
    redaction: 'presence-only',
    entries: REQUIRED_ENV_KEYS.map((key) => ({
      key,
      presence: env[key] ? 'present' : 'missing',
    })),
  };
}

export function buildPgvectorStagingSmokePlan(
  input: BuildPgvectorStagingSmokePlanInput,
): PgvectorStagingSmokePlan {
  if (!input.testUserId || !input.isolationUserId) {
    throw new Error('Staging smoke requires explicit test user ids');
  }
  if (input.testUserId === input.isolationUserId) {
    throw new Error('Staging smoke isolation requires two different test user ids');
  }
  if (!Number.isInteger(input.dimensions) || input.dimensions <= 0) {
    throw new Error('Staging smoke requires a positive embedding dimension');
  }

  return {
    safeToLog: true,
    mutationScope: 'staging-test-users-only',
    embeddingDimensions: input.dimensions,
    testUserIds: [input.testUserId, input.isolationUserId],
    prohibitedActions: ['print_raw_secrets', 'touch_production_data', 'run_without_test_user_ids'],
    steps: [
      {
        id: 'extension-check',
        operation: 'CREATE EXTENSION IF NOT EXISTS vector; verify pg_extension contains vector',
        assertion: 'pgvector extension is available before semantic retrieval smoke runs',
      },
      {
        id: 'insert-test-memory-a',
        operation: `insert MemoryRecord fixture for ${input.testUserId}`,
        assertion: `${input.testUserId} has one staging smoke memory`,
      },
      {
        id: 'insert-test-memory-b',
        operation: `insert MemoryRecord fixture for ${input.isolationUserId}`,
        assertion: `${input.isolationUserId} has one isolation guard memory`,
      },
      {
        id: 'save-test-embeddings',
        operation: `save ${input.dimensions}d pgvector embeddings for both staging smoke users`,
        assertion: 'both staging smoke memories have pgvector embeddings',
      },
      {
        id: 'semantic-search-user-a',
        operation: `semanticSearch(${input.testUserId}, queryEmbedding, 5)`,
        assertion: `returns only ${input.testUserId} memories ordered by vector distance`,
      },
      {
        id: 'delete-test-user-a',
        operation: `hardDeleteUserData(${input.testUserId})`,
        assertion: `${input.testUserId} memory and embedding rows are deleted`,
      },
      {
        id: 'verify-user-b-isolation',
        operation: `listByUser(${input.isolationUserId})`,
        assertion: `${input.isolationUserId} memory still exists after deleting ${input.testUserId} data`,
      },
    ],
  };
}
