import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const sentimentAnalysis = createStep({
  id: 'sentiment-analysis',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ sentiment: z.string() }),
  execute: async ({ inputData }) => {
    // 本番では LLM や感情分析 API を呼ぶ。ここでは語で判定する
    if (inputData.text.includes('良い')) return { sentiment: 'positive' };
    if (inputData.text.includes('悪い')) return { sentiment: 'negative' };
    return { sentiment: 'neutral' };
  },
});
