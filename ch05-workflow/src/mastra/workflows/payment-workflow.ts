// src/mastra/workflows/payment-workflow.ts
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { validateInput } from './steps/validate-input';
import { processPayment } from './steps/process-payment';
import { sendReceipt } from './steps/send-receipt';

export const paymentWorkflow = createWorkflow({
  id: 'payment-workflow',
  inputSchema: z.object({
    email: z.string(),
    amount: z.number(),
  }),
  outputSchema: z.object({
    receiptId: z.string(),
  }),
})
  .then(validateInput)
  .then(processPayment)
  .then(sendReceipt)
  .commit();
