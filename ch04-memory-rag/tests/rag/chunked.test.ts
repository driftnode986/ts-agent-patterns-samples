import fs from 'node:fs/promises';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { LibSQLVector } from '@mastra/libsql';
import { fakeVector } from '../helpers/fake-embedding';

describe('index-chunked-documents', () => {
  it('ユーザーガイドをチャンクに分けて source と番号付きで登録する', async () => {
    // repo の docs/user-guide.md を、テスト用の作業ディレクトリ (tests/setup.ts) に写す
    const guide = await fs.readFile(
      path.join(import.meta.dirname, '../../docs/user-guide.md'),
      'utf-8',
    );
    await fs.writeFile('docs/user-guide.md', guide);

    await import('../../src/scripts/index-chunked-documents');

    const store = new LibSQLVector({ id: 'check', url: process.env.DATABASE_URL! });
    const results = await store.query({
      indexName: 'knowledge_base',
      queryVector: fakeVector('Agent の定義'),
      topK: 20,
    });
    expect(results.length).toBe(Math.ceil((guide.length - 200) / 800));
    expect(results[0].metadata).toMatchObject({ source: 'user-guide.md' });
    expect(results.length).toBeGreaterThan(1); // 1 チャンクに収まらない長さ
    expect(results.map((r) => r.metadata?.text).join('')).toContain('instructions');
    expect(results.map((r) => r.id)).toContain('doc-guide-chunk-0');
  });
});
