import { describe, it, expect } from 'vitest';
import { statefulWorkflow } from '../src/mastra/workflows/stateful-workflow';
import { mapWorkflow } from '../src/mastra/workflows/map-workflow';
import { checkTier } from '../src/check-tier';

describe('State とデータの受け渡し (5.4・5.5)', () => {
  it('stateSchema の default が初期値になり、setState の更新が後の Step から見える', async () => {
    const run = await statefulWorkflow.createRun();
    const result = await run.start({ inputData: { userId: 'u1' } });
    expect(result.status).toBe('success');
    if (result.status !== 'success') return;
    expect(result.result).toEqual({ summary: 'u1: 1 件処理、エラー 0 件' });
  });

  it('initialState を渡すと、その値から始まる', async () => {
    const run = await statefulWorkflow.createRun();
    const result = await run.start({
      inputData: { userId: 'u1' },
      initialState: { processedCount: 5, errors: ['timeout'] },
    });
    expect(result.status === 'success' && result.result).toEqual({
      summary: 'u1: 6 件処理、エラー 1 件',
    });
  });

  it('.map: getStepResult と getInitData で前の Step と初期入力を参照する', async () => {
    const run = await mapWorkflow.createRun();
    const result = await run.start({ inputData: { userId: 'abc' } });
    expect(result.status === 'success' && result.result).toEqual({
      report: 'レポート: abc: 30',
    });
  });

  it.each([
    ['enterprise', 1000],
    ['free', 50],
  ])('requestContext の user-tier=%s で maxResults が %i になる', async (tier, max) => {
    const result = await checkTier(tier);
    expect(result.status === 'success' && result.result).toEqual({ maxResults: max });
  });
});
