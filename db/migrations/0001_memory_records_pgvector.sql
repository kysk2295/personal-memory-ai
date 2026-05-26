CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS memory_records (
  memory_id text NOT NULL,
  user_id text NOT NULL,
  source_type text NOT NULL,
  source_ref text NOT NULL,
  import_batch_id text,
  created_at timestamptz NOT NULL,
  observed_at timestamptz,
  raw_text text NOT NULL,
  summary text NOT NULL,
  memory_type text NOT NULL,
  emotion_tags text[] NOT NULL DEFAULT '{}',
  topic_tags text[] NOT NULL DEFAULT '{}',
  project_tags text[] NOT NULL DEFAULT '{}',
  people_tags text[] NOT NULL DEFAULT '{}',
  decision_signal text NOT NULL,
  outcome_text text,
  privacy_scope text NOT NULL DEFAULT 'private',
  embedding_status text NOT NULL DEFAULT 'pending',
  extraction_status text NOT NULL DEFAULT 'pending',
  PRIMARY KEY (memory_id, user_id)
);

CREATE INDEX IF NOT EXISTS memory_records_user_created_idx ON memory_records (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS memory_embeddings (
  memory_id text NOT NULL,
  user_id text NOT NULL,
  embedding vector(1536) NOT NULL,
  model text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  PRIMARY KEY (memory_id, user_id),
  CONSTRAINT memory_embeddings_memory_fk
    FOREIGN KEY (memory_id, user_id)
    REFERENCES memory_records (memory_id, user_id)
    ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS memory_embeddings_user_idx ON memory_embeddings (user_id);
CREATE INDEX IF NOT EXISTS memory_embeddings_vector_cosine_idx
  ON memory_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
