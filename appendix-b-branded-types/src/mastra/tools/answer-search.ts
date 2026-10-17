// src/mastra/tools/answer-search.ts
import { setTimeout as sleep } from 'node:timers/promises';
import { searchDocuments } from './search';

export async function answerSearch(query: string): Promise<string> {
  // #region narrowing
  const result = await searchDocuments(query);

  if (!result.ok) {
    switch (result.error.type) {
      case 'rate_limit':
        await sleep(result.error.retryAfter * 1000);
        return 'レート制限中です。しばらくお待ちください。';
      case 'invalid_query':
        return `クエリが不正です: ${result.error.message}`;
      case 'timeout':
        return 'タイムアウトしました。再試行してください。';
    }
  }

  // ここでは result.ok === true に narrowing 済み
  const docs = result.value;
  // #endregion
  return docs.join('\n');
}
