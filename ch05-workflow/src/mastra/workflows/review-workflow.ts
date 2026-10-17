// src/mastra/workflows/review-workflow.ts
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { reviewRequestStep } from './steps/review-request';

const shipOrder = createStep({
  id: 'ship-order',
  inputSchema: z.object({ approved: z.boolean(), orderId: z.string() }),
  outputSchema: z.object({ shipped: z.boolean() }),
  execute: async () => ({ shipped: true }),
});

// bail() した場合、後続の ship-order は実行されない
export const reviewWorkflow = createWorkflow({
  id: 'order-review',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.object({ shipped: z.boolean() }),
})
  .then(reviewRequestStep)
  .then(shipOrder)
  .commit();
