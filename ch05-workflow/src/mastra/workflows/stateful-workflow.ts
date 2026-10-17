// #region imports
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
// #endregion

// #region count-step
const step1 = createStep({
  id: 'count-step',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ userId: z.string() }),
  // この Step が読み書きする State の部分だけを宣言する
  stateSchema: z.object({ processedCount: z.number() }),
  execute: async ({ inputData, state, setState }) => {
    await setState({
      ...state,
      processedCount: state.processedCount + 1,
    });
    return { userId: inputData.userId };
  },
});
// #endregion

const step2 = createStep({
  id: 'summary-step',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  stateSchema: z.object({
    processedCount: z.number(),
    errors: z.array(z.string()),
  }),
  execute: async ({ inputData, state }) => ({
    summary: `${inputData.userId}: ${state.processedCount} 件処理、` +
      `エラー ${state.errors.length} 件`,
  }),
});

// #region define
export const statefulWorkflow = createWorkflow({
  id: 'stateful',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  stateSchema: z.object({
    processedCount: z.number().default(0),
    errors: z.array(z.string()).default([]),
  }),
})
  .then(step1)
  .then(step2)
  .commit();
// #endregion
