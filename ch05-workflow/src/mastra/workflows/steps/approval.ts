// #region approval-schemas
// src/mastra/workflows/steps/approval.ts
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const approvalStep = createStep({
  id: 'human-approval',
  inputSchema: z.object({
    orderId: z.string(),
    amount: z.number(),
  }),
  outputSchema: z.object({
    approved: z.boolean(),
    orderId: z.string(),
  }),
  resumeSchema: z.object({
    approved: z.boolean(),
    approverNote: z.string().optional(),
  }),
  suspendSchema: z.object({
    reason: z.string(),
    requiredApprover: z.string(),
  }),
  // #endregion
  // #region approval-execute
  execute: async ({ inputData, resumeData, suspend }) => {
    if (!resumeData?.approved) {
      await suspend({
        reason: `注文 ${inputData.orderId} (¥${inputData.amount}) の承認が必要`,
        requiredApprover: 'manager',
      });
    }
    return {
      approved: resumeData?.approved ?? false,
      orderId: inputData.orderId,
    };
  },
});
// #endregion
