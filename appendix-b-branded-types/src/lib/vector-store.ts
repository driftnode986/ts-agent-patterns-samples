// 検索先の代わり。メモリ上の文書から、クエリを含むものを返す
export class RateLimitError extends Error {
  constructor(public readonly retryAfter: number) {
    super(`Rate limited. Retry after ${retryAfter}s`);
  }
}

export function isRateLimitError(e: unknown): e is RateLimitError {
  return e instanceof RateLimitError;
}

const documents = [
  'Mastra の Agent は instructions と model で定義します',
  'Tool の inputSchema は Zod で書きます',
];

export const vectorStore = {
  async search(query: string): Promise<string[]> {
    return documents.filter((doc) => doc.includes(query));
  },
};
