import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { mastra } from '../src/mastra';
import { payWithRetry } from '../src/retry-payment';
import { paymentGateway } from '../src/lib/payment-gateway';
import { inventory } from '../src/lib/inventory';
import { externalApi } from '../src/lib/external-api';
import { sent } from '../src/lib/notifier';
import { resilientWorkflow } from '../src/mastra/workflows/retry-workflow';
import { orderAlertWorkflow } from '../src/mastra/workflows/alert-workflow';
import {
  compensatePayment,
  orderSagaWorkflow,
} from '../src/mastra/workflows/steps/compensate-payment';
import { dailyReport } from '../src/mastra/workflows/daily-report-workflow';

beforeEach(() => {
  paymentGateway.refunded.length = 0;
  inventory.stock = 10;
  sent.length = 0;
});
afterEach(() => vi.restoreAllMocks());

describe('time-travel (5.8)', () => {
  it('決済が一度失敗しても、timeTravel で失敗した Step から再実行できる', async () => {
    vi.spyOn(paymentGateway, 'charge').mockRejectedValueOnce(
      new Error('決済サービスに接続できません'),
    );
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await payWithRetry();
    expect(log).toHaveBeenCalledWith('success');
  });

  it('restart() は失敗した run を再実行しない（実行中に止まった run 向け）', async () => {
    const charge = vi
      .spyOn(paymentGateway, 'charge')
      .mockRejectedValueOnce(new Error('NG'));
    const run = await mastra.getWorkflow('paymentWorkflow').createRun();
    const result = await run.start({
      inputData: { email: 'user@example.com', amount: 5000 },
    });
    expect(result.status).toBe('failed');
    const restarted = await run.restart();
    expect(restarted.status).toBe('failed');
    expect(charge).toHaveBeenCalledTimes(1);
  });
});

describe('Retry (5.9)', () => {
  it('Step の retries で一時的な失敗を再試行し、retryCount が増える', async () => {
    vi.spyOn(externalApi, 'get').mockRejectedValueOnce(new Error('503'));
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const run = await resilientWorkflow.createRun();
    const result = await run.start({ inputData: { url: 'https://example.com' } });
    expect(result.status === 'success' && result.result).toEqual({ status: 200 });
    expect(log.mock.calls.map((c) => c[0])).toEqual(['試行 1 回目', '試行 2 回目']);
  });
});

describe('onError (5.9)', () => {
  it('失敗したときだけ Slack に通知する', async () => {
    const ok = await (await orderAlertWorkflow.createRun()).start({
      inputData: { orderId: 'OK-1' },
    });
    expect(ok.status).toBe('success');
    expect(sent).toEqual([]);

    const ng = await (await orderAlertWorkflow.createRun()).start({
      inputData: { orderId: 'NG-1' },
    });
    expect(ng.status).toBe('failed');
    expect(sent).toEqual(['slack: Workflow 失敗: 注文 NG-1 を出荷できません']);
  });
});

describe('Saga (5.9)', () => {
  it('在庫の引き当てに失敗したら、完了済みの決済を返金する', async () => {
    inventory.stock = 0;
    const run = await orderSagaWorkflow.createRun();
    const result = await run.start({ inputData: { orderId: 'O-1', amount: 3000 } });
    expect(result.status).toBe('failed');
    const payment = result.steps['process-payment'];
    expect(paymentGateway.refunded).toHaveLength(1);
    expect(payment).toMatchObject({
      status: 'success',
      output: { paymentId: paymentGateway.refunded[0] },
    });
  });

  it('すべて成功したときは返金しない', async () => {
    const run = await orderSagaWorkflow.createRun();
    const result = await run.start({ inputData: { orderId: 'O-2', amount: 3000 } });
    expect(result.status === 'success' && result.result).toEqual({
      result: '注文 O-2 を確定しました',
    });
    expect(paymentGateway.refunded).toEqual([]);
  });

  it('compensatePayment: 補償用の Step として返金できる', async () => {
    const paymentId = await paymentGateway.charge(100);
    const wf = createWorkflow({
      id: 'compensate-only',
      inputSchema: z.object({ paymentId: z.string() }),
      outputSchema: z.object({ refunded: z.boolean() }),
    })
      .then(compensatePayment)
      .commit();
    const result = await (await wf.createRun()).start({ inputData: { paymentId } });
    expect(result.status === 'success' && result.result).toEqual({ refunded: true });
    expect(paymentGateway.refunded).toEqual([paymentId]);
  });
});

describe('Scheduled Workflows (5.10)', () => {
  it('schedule を宣言した Workflow も直接実行できる', async () => {
    const result = await (await dailyReport.createRun()).start({
      inputData: { reportType: 'daily' },
    });
    expect(result.status === 'success' && result.result).toEqual({
      title: 'daily レポート',
    });
  });

  it('cron 式が不正なら作成時にエラーになる', () => {
    expect(() =>
      createWorkflow({
        id: 'bad-cron',
        inputSchema: z.object({}),
        outputSchema: z.object({}),
        schedule: { cron: 'not a cron' },
      }),
    ).toThrow();
  });
});
