// #region setup
import { embed } from 'ai';
import { PgVector } from '@mastra/pg';
import { ModelRouterEmbeddingModel } from '@mastra/core/llm';
import { chunkDocument } from '../lib/chunker';

const pgVector = new PgVector({
  id: 'tenant-vector',
  connectionString: process.env.DATABASE_URL!,
});
await pgVector.createIndex({
  indexName: 'tenant_knowledge_base',
  dimension: 1536,
});
// #endregion

// #region index-tenant-document
export async function indexTenantDocument(
  tenantId: string,
  docId: string,
  filename: string,
  text: string,
) {
  const chunks = chunkDocument(text, { maxChunkSize: 1000, overlap: 200 });

  for (const [i, chunk] of chunks.entries()) {
    const { embedding } = await embed({
      value: chunk,
      model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
    });

    // #region upsert
    // ドキュメント登録時にテナント ID を metadata に含める
    await pgVector.upsert({
      indexName: 'tenant_knowledge_base',
      vectors: [embedding],
      ids: [`${tenantId}-doc-${docId}-chunk-${i}`],
      metadata: [{
        text: chunk,
        tenantId: tenantId,
        source: filename,
      }],
    });
    // #endregion
  }
}
// #endregion
