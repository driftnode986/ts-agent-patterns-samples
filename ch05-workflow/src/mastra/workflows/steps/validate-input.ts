import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const validateInput = createStep({
  id: 'validate-input',
  inputSchema: z.object({
    email: z.string(),
    amount: z.number(),
  }),
  outputSchema: z.object({
    isValid: z.boolean(),
    email: z.string(),
    amount: z.number(),
  }),
  execute: async ({ inputData }) => {
    const isValid =
      inputData.email.includes('@') && inputData.amount > 0;
    return {
      isValid,
      email: inputData.email,
      amount: inputData.amount,
    };
  },
});
