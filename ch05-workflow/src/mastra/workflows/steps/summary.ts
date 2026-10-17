// src/mastra/workflows/steps/summary.ts
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const summaryGeneration = createStep({
  id: 'summary-generation',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  execute: async ({ inputData }) => ({
    summary: inputData.text.slice(0, 40),
  }),
});
