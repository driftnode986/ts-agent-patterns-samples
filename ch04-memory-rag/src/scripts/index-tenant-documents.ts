// src/scripts/index-tenant-documents.ts
// ドキュメント登録時にテナント ID を metadata に含める
await pgVector.upsert({
  indexName: 'tenant-knowledge-base',
  vectors: [{
    id: `${tenantId}-doc-${docId}-chunk-${i}`,
    vector: embedding,
    metadata: {
      text: chunk,
      tenantId: tenantId,
      source: filename,
    },
  }],
});
