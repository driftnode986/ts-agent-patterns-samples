// src/scripts/index-chunked-documents.ts
const fullDocument = await fs.readFile('docs/user-guide.md', 'utf-8');
const chunks = chunkDocument(fullDocument, {
  maxChunkSize: 1000,
  overlap: 200,
});

// 各チャンクを個別に embedding して pgvector に保存
for (let i = 0; i < chunks.length; i++) {
  const { embedding } = await embed({
    value: chunks[i],
    model: new ModelRouterEmbeddingModel('openai/text-embedding-3-small'),
  });

  await pgVector.upsert({
    indexName: 'knowledge-base',
    vectors: [{
      id: `doc-guide-chunk-${i}`,
      vector: embedding,
      metadata: {
        text: chunks[i],
        source: 'user-guide.md',
        chunkIndex: i,
      },
    }],
  });
}
