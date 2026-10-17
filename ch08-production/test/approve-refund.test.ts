import { describe, expect, it, vi } from 'vitest';

// スクリプトが使う mastra を、メモリ上の LibSQL を storage にしたものに差し替える
vi.mock('../src/mastra', async () => {
  const { Mastra } = await import('@mastra/core');
  const { LibSQLStore } = await import('@mastra/libsql');
  const { approvalWorkflow } = await import(
    '../src/mastra/workflows/approval-workflow'
  );
  return {
    mastra: new Mastra({
      workflows: { approvalWorkflow },
      storage: new LibSQLStore({ id: 'test-storage', url: ':memory:' }),
      logger: false,
    }),
  };
});

describe('approve-refund.ts', () => {
  it('承認待ちで止まり、runId で取り出した実行を承認で再開する', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/scripts/approve-refund');
    expect(log.mock.calls).toEqual([
      [
        '承認待ち:',
        { reason: '高リスク操作: refund (¥50000)', notifyChannel: 'slack' },
      ],
      ['結果:', { approved: true }],
    ]);
  });
});
