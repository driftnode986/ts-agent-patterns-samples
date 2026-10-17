import { Memory } from '@mastra/memory';
import { PostgresStore, PgVector } from '@mastra/pg';

export const memory = new Memory({
  storage: new PostgresStore({
    id: 'pg-storage',
    connectionString: process.env.DATABASE_URL!,
  }),
  vector: new PgVector({
    id: 'pg-vector',
    connectionString: process.env.DATABASE_URL!,
  }),
  embedder: 'openai/text-embedding-3-small',
  options: {
    semanticRecall: true,
  },
});
