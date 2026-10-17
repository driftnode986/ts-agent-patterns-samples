import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const sendReceipt = createStep({
  id: 'send-receipt',
  inputSchema: z.object({
    paymentId: z.string(),
    email: z.string(),
  }),
  outputSchema: z.object({
    receiptId: z.string(),
  }),
  execute: async ({ inputData }) => {
    // 本番ではここでメールを送る
    return { receiptId: `rcpt_${inputData.paymentId}` };
  },
});
