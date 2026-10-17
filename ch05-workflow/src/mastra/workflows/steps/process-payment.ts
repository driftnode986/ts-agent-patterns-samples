// src/mastra/workflows/steps/process-payment.ts
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { paymentGateway } from '../../../lib/payment-gateway';

export const processPayment = createStep({
  id: 'process-payment',
  inputSchema: z.object({
    isValid: z.boolean(),
    email: z.string(),
    amount: z.number(),
  }),
  outputSchema: z.object({
    paymentId: z.string(),
    email: z.string(),
  }),
  execute: async ({ inputData }) => {
    if (!inputData.isValid) {
      throw new Error('入力が不正なため決済しません');
    }
    const paymentId = await paymentGateway.charge(inputData.amount);
    return { paymentId, email: inputData.email };
  },
});
