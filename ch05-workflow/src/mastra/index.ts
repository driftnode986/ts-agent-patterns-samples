// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { paymentWorkflow } from './workflows/payment-workflow';
import { orderWorkflow } from './workflows/order-workflow';
import { documentReviewWorkflow } from './workflows/document-review-workflow';
import { reviewerAgent } from './agents/reviewer';

export const mastra = new Mastra({
  agents: { reviewerAgent },
  workflows: { paymentWorkflow, orderWorkflow, documentReviewWorkflow },
  storage: new LibSQLStore({
    id: 'workflow-storage',
    url: process.env.DATABASE_URL ?? 'file:./mastra.db',
  }),
});
