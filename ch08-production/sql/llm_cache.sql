-- sql/llm_cache.sql（Semantic Cache のテーブル。
-- 最初に 1 回だけ実行する）
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS llm_cache (
  id bigserial PRIMARY KEY,
  embedding vector(1536) NOT NULL, -- text-embedding-3-small の次元数
  response text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
