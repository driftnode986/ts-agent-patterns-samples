import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const topicExtraction = createStep({
  id: 'topic-extraction',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ topics: z.array(z.string()) }),
  execute: async ({ inputData }) => {
    const words = inputData.text.split(/[\s、。]+/);
    return { topics: words.filter((w) => w.length >= 4).slice(0, 3) };
  },
});
