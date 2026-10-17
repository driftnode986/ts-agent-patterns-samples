import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// #region tier-step
const tierStep = createStep({
  id: 'tier-check',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ maxResults: z.number() }),
  execute: async ({ inputData, requestContext }) => {
    const userTier = requestContext.get('user-tier');
    return {
      maxResults: userTier === 'enterprise' ? 1000 : 50,
    };
  },
});
// #endregion

export const tierWorkflow = createWorkflow({
  id: 'tier',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ maxResults: z.number() }),
})
  .then(tierStep)
  .commit();
