// src/mastra/tools/answer-search.ts
import { searchDocuments } from './search';

export async function answerSearch(query: string): Promise<string> {
  // #region narrowing
  const result = await searchDocuments(query);

  if (!result.ok) {
    switch (result.error.type) {
      case 'rate_limit': {
        const sec = result.error.retryAfter;
        return `レート制限中です。${sec} 秒後に再試行してください。`;
      }
      case 'invalid_query':
        return `クエリが不正です: ${result.error.message}`;
      case 'timeout':
        return 'タイムアウトしました。再試行してください。';
      case 'unknown':
        return `検索に失敗しました: ${result.error.message}`;
    }
  }

  // ここでは result.ok === true に narrowing 済み
  const docs = result.value;
  // #endregion
  return docs.join('\n');
}
