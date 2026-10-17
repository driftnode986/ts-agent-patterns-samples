// src/mastra/memory.prod.ts
import { PostgresStorage } from '@mastra/pg';
import { PgVector } from '@mastra/pg';

const memory = new Memory({
  storage: new PostgresStorage({
    connectionString: process.env.DATABASE_URL!,
  }),
  vector: new PgVector({
    id: 'pg-vector',
    connectionString: process.env.DATABASE_URL!,
  }),
  embedder: 'openai/text-embedding-3-small',
});
