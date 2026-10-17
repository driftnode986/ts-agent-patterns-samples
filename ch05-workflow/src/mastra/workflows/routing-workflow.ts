// #region imports
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import {
  batchHandler,
  formatResponse,
  normalHandler,
  urgentHandler,
} from './steps/handlers';
// #endregion

// #region define
export const routingWorkflow = createWorkflow({
  id: 'request-routing',
  inputSchema: z.object({
    priority: z.enum(['high', 'medium', 'low']),
    content: z.string(),
  }),
  outputSchema: z.object({ result: z.string() }),
})
  .branch([
    [
      async ({ inputData }) => inputData.priority === 'high',
      urgentHandler,
    ],
    [
      async ({ inputData }) => inputData.priority === 'medium',
      normalHandler,
    ],
    [
      async ({ inputData }) => inputData.priority === 'low',
      batchHandler,
    ],
  ])
  .then(formatResponse)
  .commit();
// #endregion
