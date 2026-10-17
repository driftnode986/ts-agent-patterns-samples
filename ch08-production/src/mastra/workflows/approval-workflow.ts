// src/mastra/workflows/approval-workflow.ts
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
  execute: async ({ context }) => {
    // LLM がリクエストを分析し、リスクレベルを判定
    return { action: 'refund', riskLevel: 'high', amount: 50000 };
  },
});

const humanApproval = createStep({
  id: 'human-approval',
  inputSchema: z.object({
    action: z.string(),
    riskLevel: z.string(),
    amount: z.number().optional(),
  }),
  outputSchema: z.object({ approved: z.boolean() }),
  execute: async ({ context, suspend }) => {
    if (context.riskLevel === 'high' || (context.amount && context.amount > 10000)) {
      // Workflow を一時停止し、人間の承認を待つ
      const approval = await suspend({
        reason: `高リスク操作: ${context.action} (¥${context.amount})`,
        notifyChannel: 'slack',
      });
      return { approved: approval.decision === 'approve' };
    }
    return { approved: true };
  },
});

export const approvalWorkflow = createWorkflow({
  id: 'approval-workflow',
  inputSchema: z.object({ request: z.string() }),
  outputSchema: z.object({ result: z.string() }),
})
  .then(analyzeRequest)
  .then(humanApproval)
  .commit();
