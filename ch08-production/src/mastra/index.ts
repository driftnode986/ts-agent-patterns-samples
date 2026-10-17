// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { supportAgent } from './agents';
import { resilientAgent } from './agents/resilient-agent';
import { bookingSaga } from './workflows/booking-saga';
import { approvalWorkflow } from './workflows/approval-workflow';

// suspend した Workflow の状態（スナップショット）は storage に保存される。
// storage が無いと resume() で再開できない
export const mastra = new Mastra({
  agents: { supportAgent, resilientAgent },
  workflows: { bookingSaga, approvalWorkflow },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),
});
