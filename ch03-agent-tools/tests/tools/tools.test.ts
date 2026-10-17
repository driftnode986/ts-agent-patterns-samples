import { beforeEach, describe, expect, it, vi } from 'vitest';
import { isValidationError, noopObserve } from '@mastra/core/tools';
import { claude, resetModels } from '../helpers/models';

vi.mock('@ai-sdk/anthropic', async () => {
  const { anthropicMock } = await import('../helpers/models');
  return { anthropic: anthropicMock };
});

const {
  createInvoiceTool,
  queryDatabaseTool,
  delegateCodeReviewTool,
  searchKnowledgeBase,
  weatherTool,
  getCalendarTool,
} = await import('../../src/mastra/tools');

const context = { observe: noopObserve };
beforeEach(resetModels);

describe('createInvoiceTool (3.3)', () => {
  it('請求書を作成して ID とステータスを返す', async () => {
    const result = await createInvoiceTool.execute?.(
      { customerId: 'test-uuid-123', amount: 5000, currency: 'JPY', dueDate: '2026-11-30' },
      context,
    );
    expect(result).toEqual({ invoiceId: expect.stringMatching(/^inv-/), status: 'draft' });
  });

  it('スキーマに合わない入力はバリデーションエラーを返す', async () => {
    const result = await createInvoiceTool.execute?.(
      // @ts-expect-error amount は正の数でなければならない (実行時の検証を確かめる)
      { customerId: 'c1', amount: '-1', currency: 'JPY', dueDate: '2026-11-30' },
      context,
    );
    expect(isValidationError(result)).toBe(true);
  });
});

describe('queryDatabaseTool (3.4)', () => {
  it('SELECT 文を実行して行を返す', async () => {
    const result = await queryDatabaseTool.execute?.(
      { query: "SELECT name, plan FROM customers WHERE plan = 'pro'" },
      context,
    );
    expect(result).toMatchObject({ rowCount: 1, rows: [{ name: '山田 太郎', plan: 'pro' }] });
  });

  it('SELECT 以外は意味のあるメッセージで拒否する', async () => {
    await expect(
      queryDatabaseTool.execute?.({ query: 'DELETE FROM customers' }, context),
    ).rejects.toThrow('SELECT 文のみ実行できます');
  });

  it('SQL の誤りは原因つきのメッセージにする', async () => {
    await expect(
      queryDatabaseTool.execute?.({ query: 'SELECT * FROM no_such_table' }, context),
    ).rejects.toThrow(/クエリの実行に失敗しました: .*no_such_table.*SQL 構文を確認してください/);
  });
});

describe('delegateCodeReviewTool (3.6)', () => {
  it('コードレビュー Agent に委任して結果を返す', async () => {
    claude.enqueue({ text: 'SQL インジェクションの恐れがあります' });
    const result = await delegateCodeReviewTool.execute?.(
      { code: 'db.query(`SELECT * FROM t WHERE id = ${id}`)', language: 'TypeScript' },
      context,
    );
    expect(result).toEqual({ review: 'SQL インジェクションの恐れがあります', severity: 'info' });
    // 子 Agent への依頼文に言語とコードが入っている
    const prompt = JSON.stringify(claude.model.doGenerateCalls[0].prompt);
    expect(prompt).toContain('以下の TypeScript コードをレビューしてください');
  });
});

describe('その他の Tool', () => {
  it('searchKnowledgeBase はキーワードを含む FAQ を返す', async () => {
    const result = await searchKnowledgeBase.execute?.({ keyword: '請求書' }, context);
    expect(result).toEqual({ answers: ['請求書は毎月1日に発行されます'] });
  });

  it('weatherTool と getCalendarTool は固定のデータを返す', async () => {
    expect(await weatherTool.execute?.({ city: '東京' }, context)).toEqual({
      city: '東京',
      condition: '晴れ',
    });
    expect(await getCalendarTool.execute?.({ date: '2026-10-19' }, context)).toEqual({
      events: ['2026-10-19 10:00 定例会議'],
    });
  });
});
