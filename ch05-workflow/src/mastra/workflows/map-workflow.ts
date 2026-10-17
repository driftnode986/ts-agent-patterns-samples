import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const analyzeStep = createStep({
  id: 'analyze',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ score: z.number() }),
  execute: async ({ inputData }) => ({ score: inputData.userId.length * 10 }),
});

const formatStep = createStep({
  id: 'format',
  inputSchema: z.object({ report: z.string() }),
  outputSchema: z.object({ report: z.string() }),
  execute: async ({ inputData }) => ({ report: `レポート: ${inputData.report}` }),
});

const workflow = createWorkflow({
  id: 'map-example',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ report: z.string() }),
});

// #region map
export const mapWorkflow = workflow
  .then(analyzeStep)
  .map(async ({ inputData, getStepResult, getInitData }) => {
    const analysisResult = getStepResult(analyzeStep);
    const initData = getInitData<{ userId: string }>();
    return {
      report: `${initData.userId}: ${analysisResult.score}`,
    };
  })
  .then(formatStep)
  .commit();
// #endregion
