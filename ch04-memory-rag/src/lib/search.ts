import { embed } from 'ai';
import { PgVector } from '@mastra/pg';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

export async function searchKnowledgeBase(query: string) {
  const { embedding } = await embed({
    value: query,
    model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  });

  const pgVector = new PgVector({
    id: 'knowledge-vector',
    connectionString: process.env.DATABASE_URL!,
  });

  const results = await pgVector.query({
    indexName: 'knowledge_base',
    queryVector: embedding,
    topK: 5,
  });

  return results.map((r) => String(r.metadata?.text ?? ''));
}
