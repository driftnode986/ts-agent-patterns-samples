import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const draftSchema = z.object({
  draft: z.string(),
  quality: z.number(),
  improvement: z.number(),
});

const initializeStep = createStep({
  id: 'initialize',
  inputSchema: z.object({ draft: z.string(), improvement: z.number() }),
  outputSchema: draftSchema,
  execute: async ({ inputData }) => ({ ...inputData, quality: 0 }),
});

// ループの本体。出力が次の回の inputData になる
const refineStep = createStep({
  id: 'refine',
  inputSchema: draftSchema,
  outputSchema: draftSchema,
  execute: async ({ inputData }) => ({
    ...inputData,
    draft: `${inputData.draft}+`,
    quality: inputData.quality + inputData.improvement,
  }),
});

const workflow = createWorkflow({
  id: 'refine',
  inputSchema: z.object({ draft: z.string(), improvement: z.number() }),
  outputSchema: draftSchema,
});

// #region dountil
// .dountil: 条件が true になるまで繰り返す
export const refineWorkflow = workflow
  .then(initializeStep)
  .dountil(
    refineStep,
    async ({ inputData }) => inputData.quality >= 0.9
  )
  .commit();
// #endregion

export const boundedRefineWorkflow = createWorkflow({
  id: 'bounded-refine',
  inputSchema: z.object({ draft: z.string(), improvement: z.number() }),
  outputSchema: draftSchema,
})
  .then(initializeStep)
  // #region limit
  .dountil(
    refineStep,
    async ({ inputData, iterationCount }) => {
      if (iterationCount >= 10) {
        throw new Error('ループ上限 (10 回) に到達');
      }
      return inputData.quality >= 0.9;
    }
  )
  // #endregion
  .commit();
