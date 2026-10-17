import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Mastra } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { LibSQLStore } from '@mastra/libsql';
import { z } from 'zod';
import { mastra } from '../src/mastra';
import { approveOrder } from '../src/approve-order';
import { resumeLater, showSuspendedStep } from '../src/inspect-run';
import { startOrder } from '../src/start-order';
import { approvalStep } from '../src/mastra/workflows/steps/approval';
import { reviewWorkflow } from '../src/mastra/workflows/review-workflow';
import { reminderWorkflow } from '../src/mastra/workflows/reminder-workflow';
import { sent } from '../src/lib/notifier';

beforeEach(() => {
  sent.length = 0;
});

describe('Suspend & Resume (5.6)', () => {
  it('承認待ちで suspended になり、suspendSchema どおりの理由が保存される', async () => {
    const run = await mastra.getWorkflow('orderWorkflow').createRun();
    const result = await run.start({
      inputData: { orderId: 'ORD-001', amount: 50000 },
    });
    expect(result.status).toBe('suspended');
    if (result.status !== 'suspended') return;
    expect(result.suspended).toEqual([['human-approval']]);
    expect(result.steps['human-approval'].suspendPayload).toEqual({
      reason: '注文 ORD-001 (¥50000) の承認が必要',
      requiredApprover: 'manager',
    });
  });

  it('approveOrder(): resume すると success で終わる', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await approveOrder();
    expect(log).toHaveBeenCalledWith('success');
    log.mockRestore();
  });

  it('resume の結果に resumeData の approved が反映される', async () => {
    const run = await mastra.getWorkflow('orderWorkflow').createRun();
    await run.start({ inputData: { orderId: 'ORD-002', amount: 1000 } });
    const resumed = await run.resume({
      step: approvalStep,
      resumeData: { approved: true },
    });
    expect(resumed.status === 'success' && resumed.result).toEqual({
      approved: true,
      orderId: 'ORD-002',
    });
  });

  it('Mastra に登録していない Workflow は保存先が無く resume できない', async () => {
    const wf = createWorkflow({
      id: 'unregistered',
      inputSchema: z.object({ orderId: z.string(), amount: z.number() }),
      outputSchema: z.object({ approved: z.boolean(), orderId: z.string() }),
    })
      .then(approvalStep)
      .commit();
    const run = await wf.createRun();
    await run.start({ inputData: { orderId: 'X', amount: 1 } });
    await expect(
      run.resume({ step: approvalStep, resumeData: { approved: true } }),
    ).rejects.toThrow(/No snapshot found/);
  });

  it('bail(): 拒否すると後続の Step を実行せず success で終わる', async () => {
    const workflow = new Mastra({
      workflows: { reviewWorkflow },
      storage: new LibSQLStore({ id: 'review-test', url: ':memory:' }),
    }).getWorkflow('reviewWorkflow');
    const run = await workflow.createRun();
    const first = await run.start({ inputData: { orderId: 'ORD-9' } });
    expect(first.status).toBe('suspended');
    const rejected = await run.resume({
      step: 'review-request',
      resumeData: { approved: false },
    });
    expect(rejected.status).toBe('success');
    expect(rejected.steps['ship-order']).toBeUndefined();
    expect(rejected.status === 'success' && rejected.result).toEqual({
      reason: 'ユーザーが拒否しました',
    });
  });

  describe('sleep (5.6)', () => {
    beforeEach(() => vi.useFakeTimers());
    afterEach(() => vi.useRealTimers());

    it('.sleep(3600000) の後に次の Step へ進む', async () => {
      const run = await reminderWorkflow.createRun();
      const pending = run.start({ inputData: { userId: 'u1' } });
      await vi.advanceTimersByTimeAsync(3_600_000);
      const result = await pending;
      expect(result.status).toBe('success');
      expect(result.status === 'success' && result.result.waitedMs).toBe(3_600_000);
    });
  });
});

describe('永続化と状態の読み出し (5.7)', () => {
  it('getWorkflowRunById + createWorkflowStateReader で中断中の Step を取り出す', async () => {
    const run = await mastra.getWorkflow('orderWorkflow').createRun();
    await run.start({ inputData: { orderId: 'ORD-003', amount: 3000 } });
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await showSuspendedStep(run.runId);
    expect(log).toHaveBeenCalledWith(
      '中断中の Step:',
      expect.objectContaining({ stepId: 'human-approval' }),
    );
    log.mockRestore();
  });

  it('createRun({ runId }) で同じ run を取り出して resume() できる', async () => {
    const run = await mastra.getWorkflow('orderWorkflow').createRun();
    await run.start({ inputData: { orderId: 'ORD-005', amount: 700 } });
    // run オブジェクトを捨てて、runId だけで再開する
    const result = await resumeLater(run.runId);
    expect(result.status === 'success' && result.result).toEqual({
      approved: true,
      orderId: 'ORD-005',
    });
  });
});

describe('結果のステータス (5.10)', () => {
  it('suspended なら承認者に通知する', async () => {
    const output = await startOrder({ orderId: 'ORD-004', amount: 100 });
    expect(output).toBeUndefined();
    expect(sent).toEqual(['approver: human-approval']);
  });
});
