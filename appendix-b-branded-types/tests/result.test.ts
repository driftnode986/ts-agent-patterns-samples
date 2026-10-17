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

  it('TimeoutError は timeout', async () => {
    vi.spyOn(vectorStore, 'search').mockRejectedValue(
      new DOMException('The operation timed out.', 'TimeoutError'),
    );
    expect(await searchDocuments('Mastra')).toEqual({
      ok: false,
      error: { type: 'timeout' },
    });
  });

  it('AbortSignal.timeout() で打ち切った検索は timeout', async () => {
    // 応答しない検索先。signal が打ち切られたら、その理由で失敗する
    vi.spyOn(vectorStore, 'search').mockImplementation(
      (_query, signal) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener('abort', () => reject(signal.reason));
        }),
    );
    expect(await searchDocuments('Mastra', 10)).toEqual({
      ok: false,
      error: { type: 'timeout' },
    });
  });

  it('それ以外の例外は unknown (timeout にまとめない)', async () => {
    vi.spyOn(vectorStore, 'search').mockRejectedValue(new Error('boom'));
    expect(await searchDocuments('Mastra')).toEqual({
      ok: false,
      error: { type: 'unknown', message: 'Error: boom' },
    });
  });
});

describe('answerSearch (ナローイング)', () => {
  it('成功時は文書を返す', async () => {
    expect(await answerSearch('Agent')).toContain('instructions');
  });

  it('エラーの種類ごとにメッセージを返す', async () => {
    expect(await answerSearch('')).toBe('クエリが不正です: Empty query');
    vi.spyOn(vectorStore, 'search').mockRejectedValueOnce(
      new DOMException('timed out', 'TimeoutError'),
    );
    expect(await answerSearch('a')).toBe('タイムアウトしました。再試行してください。');
    vi.spyOn(vectorStore, 'search').mockRejectedValueOnce(new Error('x'));
    expect(await answerSearch('a')).toBe('検索に失敗しました: Error: x');
  });

  it('レート制限では待たずに、再試行までの秒数を返す', async () => {
    vi.spyOn(vectorStore, 'search').mockRejectedValue(new RateLimitError(2));
    expect(await answerSearch('Mastra')).toBe(
      'レート制限中です。2 秒後に再試行してください。',
    );
  });
});
