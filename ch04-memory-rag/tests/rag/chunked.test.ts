import fs from 'node:fs/promises';
import { describe, it, expect } from 'vitest';
import { LibSQLVector } from '@mastra/libsql';
import { fakeVector } from '../helpers/fake-embedding';

describe('index-chunked-documents', () => {
  it('ユーザーガイドをチャンクに分けて source と番号付きで登録する', async () => {
    const guide = '# ガイド\n' + 'Agent の使い方。'.repeat(150) + 'Workflow の使い方。'.repeat(150);
    await fs.writeFile('docs/user-guide.md', guide);

    await import('../../src/scripts/index-chunked-documents');

    const store = new LibSQLVector({ id: 'check', url: process.env.DATABASE_URL! });
    const results = await store.query({
      indexName: 'knowledge_base',
      queryVector: fakeVector('Workflow の使い方。'),
      topK: 10,
    });
    expect(results.length).toBe(Math.ceil((guide.length - 200) / 800));
    expect(results[0].metadata).toMatchObject({ source: 'user-guide.md' });
    expect(results[0].metadata?.text).toContain('Workflow');
    expect(results.map((r) => r.id)).toContain('doc-guide-chunk-0');
  });
});
