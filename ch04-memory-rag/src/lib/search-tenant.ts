// src/lib/search-tenant.ts
import { embed } from 'ai';
import { PgVector } from '@mastra/pg';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';

export async function searchTenantDocs(query: string, tenantId: string) {
  const { embedding } = await embed({
    value: query,
    model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  });

  const pgVector = new PgVector({
    id: 'tenant-vector',
    connectionString: process.env.DATABASE_URL!,
  });

  const results = await pgVector.query({
    indexName: 'tenant-knowledge-base',
    queryVector: embedding,
    topK: 5,
    filter: {
      tenantId: { $eq: tenantId },
    },
  });

  return results.map(r => r.metadata.text);
}
