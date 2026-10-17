// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { paymentWorkflow } from './workflows/payment-workflow';

export const mastra = new Mastra({
  workflows: { paymentWorkflow },
  storage: new LibSQLStore({
    id: 'workflow-storage',
    url: process.env.DATABASE_URL ?? 'file:./mastra.db',
  }),
});
