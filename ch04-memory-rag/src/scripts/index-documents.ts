// src/scripts/index-documents.ts
import { embed } from 'ai';
import { PgVector } from '@mastra/pg';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

const pgVector = new PgVector({
  id: 'knowledge-vector',
  connectionString: process.env.DATABASE_URL!,
});

const documents = [
  { id: 'doc-1', text: 'Mastra の Agent は instructions でシステムプロンプトを定義します...' },
  { id: 'doc-2', text: 'Tool は createTool 関数で定義し、Zod スキーマで入出力を固定します...' },
];

for (const doc of documents) {
  const { embedding } = await embed({
    value: doc.text,
    model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  });

  await pgVector.upsert({
    indexName: 'knowledge-base',
    vectors: [{
      id: doc.id,
      vector: embedding,
      metadata: { text: doc.text },
    }],
  });
}
