// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';
import { supportAgent } from './agents';

const memory = new Memory({
  storage: new LibSQLStore({
    id: 'app-storage',
    url: 'file:./memory.db',
  }),
  vector: new LibSQLVector({
    id: 'app-vector',
    url: 'file:./vector.db',
  }),
  embedder: 'openai/text-embedding-3-small',
  options: {
    lastMessages: 20,
    semanticRecall: {
      topK: 3,
      messageRange: { before: 2, after: 1 },
    },
    workingMemory: {
      enabled: true,
    },
  },
});

export const mastra = new Mastra({
  agents: { supportAgent },
});
