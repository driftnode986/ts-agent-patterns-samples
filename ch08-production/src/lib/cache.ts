// src/lib/cache.ts
import { Redis } from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL);

export async function cachedLLMCall(
  prompt: string,
  generator: () => Promise<string>
): Promise<string> {
  const key = `llm:${crypto.createHash('sha256').update(prompt).digest('hex')}`;

  const cached = await redis.get(key);
  if (cached) return cached;

  const result = await generator();
  await redis.set(key, result, 'EX', 3600); // 1時間キャッシュ
  return result;
}
