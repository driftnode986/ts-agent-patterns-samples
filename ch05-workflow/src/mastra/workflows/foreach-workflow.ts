import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const processItem = createStep({
  id: 'process-item',
  inputSchema: z.object({ value: z.number() }),
  outputSchema: z.object({ processed: z.number() }),
  execute: async ({ inputData }) => ({ processed: inputData.value * 2 }),
});

const aggregateResults = createStep({
  id: 'aggregate-results',
  // .foreach() の出力は各要素の結果の配列
  inputSchema: z.array(z.object({ processed: z.number() })),
  outputSchema: z.object({ total: z.number() }),
  execute: async ({ inputData }) => ({
    total: inputData.reduce((sum, item) => sum + item.processed, 0),
  }),
});

const workflow = createWorkflow({
  id: 'foreach-items',
  inputSchema: z.array(z.object({ value: z.number() })),
  outputSchema: z.object({ total: z.number() }),
});

// #region foreach
export const foreachWorkflow = workflow
  .foreach(processItem, { concurrency: 4 })
  .then(aggregateResults)
  .commit();
// #endregion
