// #region setup
import fs from 'node:fs/promises';
import { embed } from 'ai';
import { PgVector } from '@mastra/pg';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { chunkDocument } from '../lib/chunker';

const pgVector = new PgVector({
  id: 'knowledge-vector',
  connectionString: process.env.DATABASE_URL!,
});
await pgVector.createIndex({
  indexName: 'knowledge_base',
  dimension: 1536,
});
// #endregion

// #region chunk-and-index
const fullDocument = await fs.readFile('docs/user-guide.md', 'utf-8');
const chunks = chunkDocument(fullDocument, {
  maxChunkSize: 1000,
  overlap: 200,
});

// 各チャンクを個別に embedding して pgvector に保存
for (let i = 0; i < chunks.length; i++) {
  const { embedding } = await embed({
    value: chunks[i],
    model: new ModelRouterEmbeddingModel(
      'openai/text-embedding-3-small',
    ),
  });

  await pgVector.upsert({
    indexName: 'knowledge_base',
    vectors: [embedding],
    ids: [`doc-guide-chunk-${i}`],
    metadata: [{
      text: chunks[i],
      source: 'user-guide.md',
      chunkIndex: i,
    }],
  });
}
// #endregion
