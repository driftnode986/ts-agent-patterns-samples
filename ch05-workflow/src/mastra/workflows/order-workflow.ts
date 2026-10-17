import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { approvalStep } from './steps/approval';

export const orderWorkflow = createWorkflow({
  id: 'order-approval',
  inputSchema: z.object({ orderId: z.string(), amount: z.number() }),
  outputSchema: z.object({ approved: z.boolean(), orderId: z.string() }),
})
  .then(approvalStep)
  .commit();
