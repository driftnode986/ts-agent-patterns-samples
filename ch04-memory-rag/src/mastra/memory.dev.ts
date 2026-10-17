// src/mastra/memory.dev.ts
import { LibSQLStore, LibSQLVector } from '@mastra/libsql';

const memory = new Memory({
  storage: new LibSQLStore({
    id: 'dev-storage',
    url: 'file:./memory.db',
  }),
  vector: new LibSQLVector({
    id: 'dev-vector',
    url: 'file:./vector.db',
  }),
  embedder: 'openai/text-embedding-3-small',
});
