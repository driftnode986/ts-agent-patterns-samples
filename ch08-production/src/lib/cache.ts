import { Redis } from 'ioredis';
import crypto from 'crypto';

const redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');

export async function cachedLLMCall(
  prompt: string,
  generator: () => Promise<string>
): Promise<string> {
  const hash = crypto.createHash('sha256').update(prompt).digest('hex');
  const key = `llm:${hash}`;

  const cached = await redis.get(key);
  if (cached) return cached;

  const result = await generator();
  await redis.set(key, result, 'EX', 3600); // 1時間キャッシュ
  return result;
}
