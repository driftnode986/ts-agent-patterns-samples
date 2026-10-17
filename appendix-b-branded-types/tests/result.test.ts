import { afterEach, describe, expect, it, vi } from 'vitest';
import { RateLimitError, vectorStore } from '../src/lib/vector-store';
import { answerSearch } from '../src/mastra/tools/answer-search';
import { searchDocuments } from '../src/mastra/tools/search';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe('searchDocuments (Result 型)', () => {
  it('成功時は ok: true と検索結果を返す', async () => {
    const result = await searchDocuments('Zod');
    expect(result).toEqual({
      ok: true,
      value: ['Tool の inputSchema は Zod で書きます'],
    });
  });

  it('空のクエリは invalid_query', async () => {
    const result = await searchDocuments('  ');
    expect(result).toEqual({
      ok: false,
      error: { type: 'invalid_query', message: 'Empty query' },
    });
  });

  it('レート制限は rate_limit と retryAfter を返す', async () => {
    vi.spyOn(vectorStore, 'search').mockRejectedValue(new RateLimitError(30));
    const result = await searchDocuments('Mastra');
    expect(result).toEqual({
      ok: false,
      error: { type: 'rate_limit', retryAfter: 30 },
    });
  });

  it('その他の例外は timeout', async () => {
    vi.spyOn(vectorStore, 'search').mockRejectedValue(new Error('boom'));
    expect(await searchDocuments('Mastra')).toEqual({
      ok: false,
      error: { type: 'timeout' },
    });
  });
});

describe('answerSearch (ナローイング)', () => {
  it('成功時は文書を返す', async () => {
    expect(await answerSearch('Agent')).toContain('instructions');
  });

  it('エラーの種類ごとにメッセージを返す', async () => {
    expect(await answerSearch('')).toBe('クエリが不正です: Empty query');
    vi.spyOn(vectorStore, 'search').mockRejectedValueOnce(new Error('x'));
    expect(await answerSearch('a')).toBe('タイムアウトしました。再試行してください。');
  });

  it('レート制限では retryAfter 秒待ってから返す', async () => {
    vi.useFakeTimers();
    vi.spyOn(vectorStore, 'search').mockRejectedValue(new RateLimitError(2));
    const pending = answerSearch('Mastra');
    await vi.advanceTimersByTimeAsync(2000);
    expect(await pending).toBe('レート制限中です。しばらくお待ちください。');
  });
});
