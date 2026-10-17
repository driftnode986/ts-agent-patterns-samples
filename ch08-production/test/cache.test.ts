import { describe, expect, it, vi } from 'vitest';
import { MockEmbeddingModelV4 } from 'ai/test';

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

// 埋め込みモデルと pgvector の代わり
const embedding = vi.hoisted(() => ({ model: null as unknown }));
vi.mock('@ai-sdk/openai', () => ({
  openai: { embedding: () => embedding.model },
}));
const query = vi.hoisted(() => vi.fn());
vi.mock('../src/lib/db', () => ({ db: { query } }));

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

describe('semanticCacheLookup', () => {
  it('埋め込みベクトルとしきい値で検索し、最も近い応答を返す', async () => {
    embedding.model = new MockEmbeddingModelV4({
      doEmbed: { embeddings: [[0.1, 0.2, 0.3]], warnings: [] },
    });
    query.mockResolvedValue({ rows: [{ response: '晴れです' }] });
    const { semanticCacheLookup } = await import('../src/lib/semantic-cache');

    const hit = await semanticCacheLookup('東京の今日の天気を教えてください');
    expect(hit).toBe('晴れです');
    expect(query.mock.calls[0][1]).toEqual(['[0.1,0.2,0.3]', 0.95]);

    query.mockResolvedValue({ rows: [] });
    expect(await semanticCacheLookup('大阪の天気は?')).toBeNull();
  });
});
