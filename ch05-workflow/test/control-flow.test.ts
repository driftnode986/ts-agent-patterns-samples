import { describe, it, expect } from 'vitest';
import { sequentialWorkflow } from '../src/mastra/workflows/sequential-workflow';
import { analysisWorkflow } from '../src/mastra/workflows/analysis-workflow';
import { foreachWorkflow } from '../src/mastra/workflows/foreach-workflow';
import { routingWorkflow } from '../src/mastra/workflows/routing-workflow';
import {
  boundedRefineWorkflow,
  refineWorkflow,
} from '../src/mastra/workflows/refine-workflow';
import { paginationWorkflow } from '../src/mastra/workflows/pagination-workflow';

async function start<T>(workflow: { createRun: () => Promise<any> }, inputData: T) {
  const run = await workflow.createRun();
  return run.start({ inputData });
}

describe('制御フロー (5.3)', () => {
  it('.then: 前の Step の出力が次の Step の入力になる', async () => {
    const result = await start(sequentialWorkflow, { text: '  hello ' });
    expect(result.status).toBe('success');
    expect(result.result).toEqual({ text: 'HELLO!' });
  });

  it('.parallel: 出力は Step の ID をキーにしたオブジェクトになる', async () => {
    const result = await start(analysisWorkflow, {
      text: 'この製品はとても良い。配送スピードも満足できる',
    });
    expect(result.status).toBe('success');
    expect(result.steps['combine-results'].payload).toHaveProperty(
      'sentiment-analysis',
    );
    expect(result.result.report).toMatch(/^\[positive\] /);
  });

  it('.foreach: 配列の各要素に同じ Step を適用し、結果は配列になる', async () => {
    const result = await start(foreachWorkflow, [
      { value: 1 },
      { value: 2 },
      { value: 3 },
    ]);
    expect(result.status).toBe('success');
    expect(result.steps['aggregate-results'].payload).toEqual([
      { processed: 2 },
      { processed: 4 },
      { processed: 6 },
    ]);
    expect(result.result).toEqual({ total: 12 });
  });

  it.each([
    ['high', '至急対応: 障害'],
    ['medium', '通常対応: 障害'],
    ['low', '夜間バッチで対応: 障害'],
  ] as const)('.branch: priority=%s は対応する分岐だけを実行する', async (priority, expected) => {
    const result = await start(routingWorkflow, { priority, content: '障害' });
    expect(result.status).toBe('success');
    expect(result.result).toEqual({ result: expected });
    const ran = ['urgent-handler', 'normal-handler', 'batch-handler'].filter(
      (id) => result.steps[id]?.status === 'success',
    );
    expect(ran).toHaveLength(1);
  });

  it('.dountil: 条件が true になるまで繰り返す', async () => {
    const result = await start(refineWorkflow, { draft: '案', improvement: 0.5 });
    expect(result.status).toBe('success');
    expect(result.result).toEqual({ draft: '案++', quality: 1, improvement: 0.5 });
  });

  it('.dountil: iterationCount が上限に達したら条件関数の throw で止まる', async () => {
    // 品質が上がらない入力。iterationCount が無ければ止まらずテストが時間切れになる
    const run = await boundedRefineWorkflow.createRun();
    // 条件関数で投げたエラーは status: 'failed' ではなく、run.start() の例外になる
    await expect(
      run.start({ inputData: { draft: '案', improvement: 0 } }),
    ).rejects.toThrow('ループ上限 (10 回) に到達');
  });

  it('.dowhile: 条件が true の間、繰り返す', async () => {
    const result = await start(paginationWorkflow, {});
    expect(result.status).toBe('success');
    expect(result.result).toEqual({
      page: 3,
      items: ['a', 'b', 'c', 'd', 'e'],
      hasMore: false,
    });
  });
});
