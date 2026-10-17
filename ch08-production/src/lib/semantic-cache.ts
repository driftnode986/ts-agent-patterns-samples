// #region embed
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from './db';

// 文章を 1536 次元のベクトルにし、
// pgvector が読める '[0.1,0.2,...]' の形にする
export async function toVector(text: string): Promise<string> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: text,
  });
  return JSON.stringify(embedding);
}
// #endregion

// #region lookup
export async function semanticCacheLookup(
  vector: string,
  threshold: number = 0.95
): Promise<string | null> {
  // pgvector で cosine similarity 検索（<=> はコサイン距離）
  const result = await db.query(
    `SELECT response, 1 - (embedding <=> $1) as similarity
     FROM llm_cache
     WHERE 1 - (embedding <=> $1) > $2
     ORDER BY similarity DESC
     LIMIT 1`,
    [vector, threshold]
  );
  return result.rows[0]?.response ?? null;
}

export async function semanticCacheStore(
  vector: string,
  response: string
): Promise<void> {
  await db.query(
    'INSERT INTO llm_cache (embedding, response) VALUES ($1, $2)',
    [vector, response]
  );
}
// #endregion

// #region cached-call
// Cache-Aside: 近い質問の応答があれば返し、無ければ生成して保存する
export async function semanticCachedLLMCall(
  prompt: string,
  generator: () => Promise<string>
): Promise<string> {
  const vector = await toVector(prompt); // 埋め込みは 1 回だけ計算する
  const cached = await semanticCacheLookup(vector);
  if (cached !== null) return cached;

  const result = await generator();
  await semanticCacheStore(vector, result);
  return result;
}
// #endregion
