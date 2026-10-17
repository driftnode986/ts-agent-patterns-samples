// src/mastra/memory.ts
import { Memory } from '@mastra/memory';
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

export const memory = new Memory({
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
    messageHistory: { maxTokens: 8000 },
    semanticRecall: {
      topK: 3,
      messageRange: {
        before: 2,
        after: 1,
      },
    },
  },
});
