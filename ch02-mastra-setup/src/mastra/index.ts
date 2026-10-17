// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { supportAgent } from './agents';

export const mastra = new Mastra({
  agents: { supportAgent },
  storage: new LibSQLStore({
    url: 'file:./mastra.db',
  }),
});
