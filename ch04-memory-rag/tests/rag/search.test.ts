import { describe, it, expect, vi, beforeAll } from 'vitest';
import { searchKnowledgeBase } from '../../src/lib/search';
import { searchDocsTool } from '../../src/mastra/tools/search-docs';

beforeAll(async () => {
  // 4.8 ステップ 1: 2 件のドキュメントを登録するスクリプトを実行
  await import('../../src/scripts/index-documents');
});

describe('searchKnowledgeBase', () => {
  it('質問に近いドキュメントが先頭に返る', async () => {
    const results = await searchKnowledgeBase('Tool は createTool で定義しますか');
    expect(results).toHaveLength(2);
    expect(results[0]).toContain('createTool');
  });
});

describe('searchDocsTool', () => {
  it('検索結果と件数を返す', async () => {
    const out = await searchDocsTool.execute!(
      { query: 'Agent の instructions' },
      {} as never,
    );
    expect(out).toMatchObject({ resultCount: 2 });
    expect((out as { results: string[] }).results[0]).toContain('instructions');
  });
});

describe('eval-rag', () => {
  it('テストケースごとに Precision と取得件数を出力する', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../../src/scripts/eval-rag');
    const lines = log.mock.calls.map((c) => String(c[0]));
    log.mockRestore();
    expect(lines).toContain('Query: Mastra の Agent はどうやって定義しますか');
    expect(lines).toContain('  Precision: 50%');
    expect(lines.filter((l) => l === '  Retrieved: 2 chunks')).toHaveLength(2);
  });
});
