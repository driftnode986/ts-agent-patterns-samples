// src/mastra/tools/search.ts
import { isRateLimitError, vectorStore } from '../../lib/vector-store';
import { failure, success, type Result } from '../../types/result';

export type SearchError =
  | { type: 'rate_limit'; retryAfter: number }
  | { type: 'invalid_query'; message: string }
  | { type: 'timeout' }
  | { type: 'unknown'; message: string };

export async function searchDocuments(
  query: string,
): Promise<Result<string[], SearchError>> {
  if (!query.trim()) {
    return failure({ type: 'invalid_query', message: 'Empty query' });
  }
  try {
    return success(await vectorStore.search(query));
  } catch (e) {
    if (isRateLimitError(e)) {
      return failure({ type: 'rate_limit', retryAfter: e.retryAfter });
    }
    // AbortSignal.timeout() で打ち切ると TimeoutError になる
    if (e instanceof Error && e.name === 'TimeoutError') {
      return failure({ type: 'timeout' });
    }
    return failure({ type: 'unknown', message: String(e) });
  }
}
