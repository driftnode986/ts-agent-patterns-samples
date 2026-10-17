// src/lib/semantic-cache.ts
import { embed } from 'ai';
import { openai } from '@ai-sdk/openai';
import { db } from './db';

export async function semanticCacheLookup(
  prompt: string,
  threshold: number = 0.95
): Promise<string | null> {
  const { embedding } = await embed({
    model: openai.embedding('text-embedding-3-small'),
    value: prompt,
  });

  // pgvector で cosine similarity 検索
  const result = await db.query(
    `SELECT response, 1 - (embedding <=> $1) as similarity
     FROM llm_cache
     WHERE 1 - (embedding <=> $1) > $2
     ORDER BY similarity DESC
     LIMIT 1`,
    [JSON.stringify(embedding), threshold]
  );

  return result.rows[0]?.response || null;
}
