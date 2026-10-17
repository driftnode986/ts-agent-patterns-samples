// 全テスト共通の準備:
// - 作業ディレクトリを一時フォルダに移す（file:./memory.db などがここに作られる）
// - PostgreSQL + pgvector の代わりに LibSQL のベクトル機能を使う
// - 埋め込みモデルと Anthropic のモデルを偽物に差し替える（API を呼ばない）
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { vi } from 'vitest';

const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ch04-'));
process.chdir(dir);
fs.mkdirSync('docs');
process.env.DATABASE_URL = `file:${path.join(dir, 'pg.db')}`;

vi.mock('@mastra/pg', async (importOriginal) => {
  const original = await importOriginal<typeof import('@mastra/pg')>();
  const { LibSQLVector } = await import('@mastra/libsql');
  class PgVector extends LibSQLVector {
    constructor(config: { id: string; connectionString: string }) {
      super({ id: config.id, url: config.connectionString });
    }
  }
  return { ...original, PgVector };
});

vi.mock('@mastra/core/llm', async (importOriginal) => {
  const original = await importOriginal<typeof import('@mastra/core/llm')>();
  const { fakeEmbeddingModel } = await import('./helpers/fake-embedding');
  return {
    ...original,
    ModelRouterEmbeddingModel: function () {
      return fakeEmbeddingModel();
    },
  };
});

vi.mock('@ai-sdk/anthropic', async () => {
  const { model } = await import('./helpers/mock-llm');
  return { anthropic: () => model };
});
