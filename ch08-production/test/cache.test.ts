import { readFile } from 'node:fs/promises';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { vector } from '@electric-sql/pglite-pgvector';

// Redis の代わり: get / set だけを持つメモリ上の偽物
const store = vi.hoisted(() => new Map<string, string>());
vi.mock('ioredis', () => ({
  Redis: class {
    async get(key: string) {
      return store.get(key) ?? null;
    }
    async set(key: string, value: string, mode: string, ttl: number) {
      expect([mode, ttl]).toEqual(['EX', 3600]);
      store.set(key, value);
      return 'OK';
    }
  },
}));

// 埋め込みモデルの代わり。文章ごとに決まった 1536 次元のベクトルを返す
const vectors = vi.hoisted(() => new Map<string, number[]>());
vi.mock('@ai-sdk/openai', async () => {
  const { MockEmbeddingModelV4 } = await import('ai/test');
  const model = new MockEmbeddingModelV4({
    doEmbed: async ({ values }) => ({
      embeddings: values.map((v) => vectors.get(v)!),
      warnings: [],
    }),
  });
  return { openai: { embedding: () => model } };
});

// PostgreSQL の代わりに、pgvector 入りの PGlite（メモリ上の PostgreSQL）を使う
const pg = vi.hoisted(() => ({ db: null as unknown }));
vi.mock('../src/lib/db', () => ({
  get db() {
    return pg.db;
  },
}));

// 1536 次元のうち、先頭の 2 つだけを使ったベクトル（角度で近さが決まる）
const direction = (x: number, y: number) => [x, y, ...Array(1534).fill(0)];
vectors.set('東京の天気は?', direction(1, 0));
vectors.set('東京の今日の天気を教えてください', direction(1, 0.1)); // ほぼ同じ向き
vectors.set('大阪の株価は?', direction(0, 1)); // 直交する

describe('cachedLLMCall', () => {
  it('同じプロンプトの 2 回目は generator を呼ばずにキャッシュを返す', async () => {
    const { cachedLLMCall } = await import('../src/lib/cache');
    const generator = vi.fn().mockResolvedValue('晴れです');
    expect(await cachedLLMCall('東京の天気は?', generator)).toBe('晴れです');
    expect(await cachedLLMCall('東京の天気は?', generator)).toBe('晴れです');
    expect(generator).toHaveBeenCalledTimes(1);
    expect([...store.keys()][0]).toMatch(/^llm:[0-9a-f]{64}$/);
  });
});

describe('semanticCachedLLMCall', () => {
  beforeAll(async () => {
    const db = new PGlite({ extensions: { vector } });
    await db.exec(await readFile(new URL('../sql/llm_cache.sql', import.meta.url), 'utf8'));
    pg.db = db;
  });

  it('近い質問には保存した応答を返し、遠い質問では生成して保存する', async () => {
    const { semanticCachedLLMCall } = await import('../src/lib/semantic-cache');
    const generator = vi.fn(async () => '晴れです');

    expect(await semanticCachedLLMCall('東京の天気は?', generator)).toBe('晴れです');
    expect(
      await semanticCachedLLMCall('東京の今日の天気を教えてください', generator)
    ).toBe('晴れです');
    expect(generator).toHaveBeenCalledTimes(1); // 2 回目はキャッシュから

    generator.mockResolvedValueOnce('値上がりしました');
    expect(await semanticCachedLLMCall('大阪の株価は?', generator)).toBe('値上がりしました');
    expect(generator).toHaveBeenCalledTimes(2);

    const rows = await (pg.db as PGlite).query('SELECT response FROM llm_cache');
    expect(rows.rows).toEqual([{ response: '晴れです' }, { response: '値上がりしました' }]);
  });

  it('しきい値を下回る近さでは null を返す', async () => {
    const { semanticCacheLookup, toVector } = await import('../src/lib/semantic-cache');
    const vec = await toVector('東京の今日の天気を教えてください');
    expect(await semanticCacheLookup(vec)).toBe('晴れです'); // cos 類似度 ≈ 0.995
    expect(await semanticCacheLookup(vec, 0.999)).toBeNull();
  });
});
