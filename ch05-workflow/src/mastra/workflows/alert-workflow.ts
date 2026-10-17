// src/mastra/workflows/alert-workflow.ts
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { notifySlack } from '../../lib/notifier';

const shipStep = createStep({
  id: 'ship',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.object({ orderId: z.string() }),
  execute: async ({ inputData }) => {
    if (inputData.orderId.startsWith('NG-')) {
      throw new Error(`注文 ${inputData.orderId} を出荷できません`);
    }
    return inputData;
  },
});

// #region on-error
export const orderAlertWorkflow = createWorkflow({
  id: 'order-workflow',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.object({ orderId: z.string() }),
  options: {
    onError: async (errorInfo) => {
      await notifySlack(`Workflow 失敗: ${errorInfo.error?.message}`);
    },
  },
})
  .then(shipStep)
  .commit();
// #endregion
