import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { paymentWorkflow } from './workflows/payment-workflow';
import { orderWorkflow } from './workflows/order-workflow';
import { documentReviewWorkflow } from './workflows/document-review-workflow';
import { dailyReport } from './workflows/daily-report-workflow';
import { reviewerAgent } from './agents/reviewer';

export const mastra = new Mastra({
  agents: { reviewerAgent },
  workflows: {
    paymentWorkflow,
    orderWorkflow,
    documentReviewWorkflow,
    dailyReport, // schedule の cron は、ここに登録して初めて動く
  },
  storage: new LibSQLStore({
    id: 'workflow-storage',
    // .env の DATABASE_URL (PostgreSQL 用) とは別の名前にする
    url: process.env.WORKFLOW_DB_URL ?? 'file:./mastra.db',
  }),
});
