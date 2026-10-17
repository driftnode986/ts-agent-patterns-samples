// test/schedule.test.ts
import { afterAll, describe, expect, it } from 'vitest';
import { Mastra } from '@mastra/core';
import { LibSQLStore } from '@mastra/libsql';
import { mastra } from '../src/mastra';
import { dailyReport } from '../src/mastra/workflows/daily-report-workflow';

afterAll(async () => {
  await mastra.stopWorkers();
});

describe('Scheduled Workflows (5.10)', () => {
  it('Mastra に登録すると、起動時に schedule の行が作られる', async () => {
    // mastra build のサーバーは自動で呼ぶ。サーバーアダプターでは自分で呼ぶ
    await mastra.startWorkers();
    const schedule = await mastra.schedules.get('wf_daily-report');
    expect(schedule).toMatchObject({
      workflowId: 'daily-report',
      cron: '0 9 * * *',
      timezone: 'Asia/Tokyo',
      status: 'active',
      inputData: { reportType: 'daily' },
    });
    expect(schedule?.nextFireAt).toBeGreaterThan(Date.now());
  });

  it('Mastra に登録しない Workflow は、schedule を書いても行が作られない', async () => {
    const other = new Mastra({
      storage: new LibSQLStore({ id: 'no-schedule', url: ':memory:' }),
    });
    await other.startWorkers();
    expect(await other.schedules.get('wf_daily-report')).toBeNull();
    await other.stopWorkers();
  });

  it('schedule を書いた Workflow も、直接 run.start() で実行できる', async () => {
    const run = await dailyReport.createRun();
    const result = await run.start({ inputData: { reportType: 'weekly' } });
    expect(result.status === 'success' && result.result).toEqual({
      title: 'weekly レポート',
    });
  });
});
