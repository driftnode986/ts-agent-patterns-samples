import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { externalApi } from '../../lib/external-api';

// #region step-retries
// Step レベル (個別オーバーライド)
const apiCall = createStep({
  id: 'api-call',
  inputSchema: z.object({ url: z.string() }),
  outputSchema: z.object({ status: z.number() }),
  retries: 5,
  execute: async ({ inputData, retryCount }) => {
    console.log(`試行 ${retryCount + 1} 回目`);
    const response = await externalApi.get(inputData.url);
    return { status: response.status };
  },
});
// #endregion

// #region workflow-retries
// Workflow レベル (全 Step 共通)
export const resilientWorkflow = createWorkflow({
  id: 'resilient-workflow',
  retryConfig: { attempts: 3, delay: 2000 },
  inputSchema: z.object({ url: z.string() }),
  outputSchema: z.object({ status: z.number() }),
})
  .then(apiCall)
  .commit();
// #endregion
