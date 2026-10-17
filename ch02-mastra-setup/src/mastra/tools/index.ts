import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const weatherTool = createTool({
  id: 'get-weather',
  description: '指定された都市の現在の天気を取得します',
  inputSchema: z.object({
    city: z.string().describe('天気を取得する都市名'),
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string(),
  }),
  execute: async ({ city }) => {
    // 実際には天気 API を呼び出す
    return {
      temperature: 22,
      condition: '晴れ',
    };
  },
});
