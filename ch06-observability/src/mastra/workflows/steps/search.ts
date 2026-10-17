// #region search-imports
import { createStep } from '@mastra/core/workflows';
import { SpanType } from '@mastra/core/observability';
import { z } from 'zod';
import { db } from '../../../lib/db';
// #endregion

// #region search-step
export const searchStep = createStep({
  id: 'search',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ results: z.array(z.string()) }),
  execute: async ({ inputData, tracingContext }) => {
    const dbSpan = tracingContext?.currentSpan?.createChildSpan({
      type: SpanType.GENERIC,
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
        error: error instanceof Error ? error : new Error(String(error)),
        metadata: { retryable: true },
      });
      throw error;
    }
  },
});
// #endregion
