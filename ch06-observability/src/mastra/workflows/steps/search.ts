// src/mastra/workflows/steps/search.ts
export const searchStep = createStep({
  id: 'search',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ results: z.array(z.string()) }),
  execute: async ({ inputData, context }) => {
    const dbSpan = context?.tracingContext.currentSpan?.createChildSpan({
      type: 'generic',
      name: 'database-query',
      input: { query: inputData.query },
    });

    try {
      const results = await db.search(inputData.query);
      dbSpan?.end({
        output: results,
        metadata: { rowCount: results.length },
      });
      return { results };
    } catch (error) {
      dbSpan?.error({
        error,
        metadata: { retryable: true },
      });
      throw error;
    }
  },
});
