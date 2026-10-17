import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { supportAgent, weatherAgent } from './agents';

export const mastra = new Mastra({
  agents: { supportAgent, weatherAgent },
  storage: new LibSQLStore({
    id: 'mastra-storage',
    url: 'file:./mastra.db',
  }),
});
