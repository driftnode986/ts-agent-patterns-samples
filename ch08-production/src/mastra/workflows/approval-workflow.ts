// src/mastra/workflows/approval-workflow.ts
// #region analyze
import { createWorkflow, createStep } from '@mastra/core/workflows';
import { z } from 'zod';

const analyzeRequest = createStep({
  id: 'analyze-request',
  inputSchema: z.object({ request: z.string() }),
  outputSchema: z.object({
    action: z.string(),
    riskLevel: z.enum(['low', 'medium', 'high']),
    amount: z.number().optional(),
  }),
  execute: async () => {
    // LLM がリクエストを分析し、リスクレベルを判定
    return { action: 'refund', riskLevel: 'high' as const, amount: 50000 };
  },
});
// #endregion

// #region approval
const humanApproval = createStep({
  id: 'human-approval',
  inputSchema: z.object({
    action: z.string(),
    riskLevel: z.string(),
    amount: z.number().optional(),
  }),
  outputSchema: z.object({ approved: z.boolean() }),
  suspendSchema: z.object({ reason: z.string(), notifyChannel: z.string() }),
  resumeSchema: z.object({ decision: z.enum(['approve', 'reject']) }),
  execute: async ({ inputData, resumeData, suspend }) => {
    // resume() で再開されたときは、人間の判断が resumeData に入っている
    if (resumeData) {
      return { approved: resumeData.decision === 'approve' };
    }
    const { action, riskLevel, amount } = inputData;
    if (riskLevel === 'high' || (amount && amount > 10000)) {
      // Workflow を一時停止し、人間の承認を待つ
      return await suspend({
        reason: `高リスク操作: ${action} (¥${amount})`,
        notifyChannel: 'slack',
      });
    }
    return { approved: true };
  },
});
// #endregion

// #region workflow
export const approvalWorkflow = createWorkflow({
  id: 'approval-workflow',
  inputSchema: z.object({ request: z.string() }),
  outputSchema: z.object({ approved: z.boolean() }),
})
  .then(analyzeRequest)
  .then(humanApproval)
  .commit();
// #endregion
