import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const combineResults = createStep({
  id: 'combine-results',
  // .parallel() の出力は Step の ID をキーにしたオブジェクト
  inputSchema: z.object({
    'sentiment-analysis': z.object({ sentiment: z.string() }),
    'topic-extraction': z.object({ topics: z.array(z.string()) }),
    'summary-generation': z.object({ summary: z.string() }),
  }),
  outputSchema: z.object({ report: z.string() }),
  execute: async ({ inputData }) => {
    const { sentiment } = inputData['sentiment-analysis'];
    const { topics } = inputData['topic-extraction'];
    const { summary } = inputData['summary-generation'];
    return {
      report: `[${sentiment}] ${summary} (${topics.join(', ')})`,
    };
  },
});
