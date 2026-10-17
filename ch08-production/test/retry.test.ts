import { describe, expect, it } from 'vitest';
import { APICallError } from 'ai';
import { MockLanguageModelV4 } from 'ai/test';
import { Agent } from '@mastra/core/agent';
import { StreamErrorRetryProcessor } from '@mastra/core/processors';

// 503 を返す偽のモデル（一時的なエラーとして isRetryable が true）
function unavailableModel() {
  let calls = 0;
  const fail = async (): Promise<never> => {
    calls++;
    throw new APICallError({
      message: 'Service Unavailable',
      url: 'https://example.com',
      requestBodyValues: {},
      statusCode: 503,
      isRetryable: true,
    });
  };
  const model = new MockLanguageModelV4({
    doGenerate: fail,
    doStream: fail,
  });
  return { model, calls: () => calls };
}

describe('Agent の既定のリトライ（8.2）', () => {
  it('既定では一時的なエラーを 2 回リトライし、3 回呼ぶ', async () => {
    const { model, calls } = unavailableModel();
    const agent = new Agent({
      id: 'retry-default',
      name: 'retry-default',
      instructions: 'テスト用',
      model,
    });
    await expect(agent.generate('こんにちは')).rejects.toThrow();
    expect(calls()).toBe(3);
  }, 20_000);

  it('maxRetries: 0 の StreamErrorRetryProcessor に置き換えると 1 回', async () => {
    const { model, calls } = unavailableModel();
    const agent = new Agent({
      id: 'retry-off',
      name: 'retry-off',
      instructions: 'テスト用',
      model,
      // 同じ ID の既定のプロセッサと置き換わる
      errorProcessors: [new StreamErrorRetryProcessor({ maxRetries: 0 })],
    });
    await expect(agent.generate('こんにちは')).rejects.toThrow();
    expect(calls()).toBe(1);
  });
});
