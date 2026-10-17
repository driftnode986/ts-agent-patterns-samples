// src/mastra/tools/search.ts
type SearchError =
  | { type: 'rate_limit'; retryAfter: number }
  | { type: 'invalid_query'; message: string }
  | { type: 'timeout' };

async function searchDocuments(
  query: string
): Promise<Result<string[], SearchError>> {
  if (!query.trim()) {
    return failure({ type: 'invalid_query', message: 'Empty query' });
  }

  try {
    const results = await vectorStore.search(query);
    return success(results);
  } catch (e) {
    if (isRateLimitError(e)) {
      return failure({ type: 'rate_limit', retryAfter: e.retryAfter });
    }
    return failure({ type: 'timeout' });
  }
}
