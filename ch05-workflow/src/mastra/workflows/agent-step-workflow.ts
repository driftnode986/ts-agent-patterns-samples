// #region agent-imports
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { reviewerAgent } from '../agents/reviewer';
// #endregion
import { z } from 'zod';

const workflow = createWorkflow({
  id: 'agent-step',
  inputSchema: z.object({ document: z.string() }),
  outputSchema: z.object({ text: z.string() }),
});

// #region agent-step
const agentStep = createStep(reviewerAgent);

export const agentStepWorkflow = workflow
  .map(async ({ inputData }) => ({
    prompt: `レビュー対象: ${inputData.document}`,
  }))
  .then(agentStep)
  .commit();
// #endregion

// #region structured
const structuredAgentStep = createStep(reviewerAgent, {
  structuredOutput: {
    schema: z.object({
      summary: z.string(),
      issues: z.array(z.string()),
      score: z.number().min(0).max(1),
    }),
  },
});
// #endregion

export const structuredReviewWorkflow = createWorkflow({
  id: 'structured-review',
  inputSchema: z.object({ document: z.string() }),
  outputSchema: z.object({
    summary: z.string(),
    issues: z.array(z.string()),
    score: z.number(),
  }),
})
  .map(async ({ inputData }) => ({
    prompt: `レビュー対象: ${inputData.document}`,
  }))
  .then(structuredAgentStep)
  .commit();
