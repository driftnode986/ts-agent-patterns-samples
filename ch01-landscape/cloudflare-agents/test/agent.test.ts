import { describe, expect, it, vi } from 'vitest';
import type { Connection } from 'agents';

// Durable Objects の実行環境は Node.js では動かないため、Agent の基底クラスを
// 最小の偽物に差し替える（env を受け取り、runFiber は関数をそのまま実行する）
vi.mock('agents', () => ({
  Agent: class {
    env: unknown;
    constructor(_ctx: unknown, env: unknown) {
      this.env = env;
    }
    async runFiber<T>(_name: string, fn: (ctx: object) => Promise<T>) {
      return fn({});
    }
  },
}));

describe('MyAgent', () => {
  it('replies to a WebSocket message with the Workers AI answer', async () => {
    const { MyAgent } = await import('../src/index');
    const run = vi.fn(async () => ({ response: 'こんにちは' }));
    const env = { AI: { run } } as unknown as Env;
    const agent = new MyAgent({} as DurableObjectState, env);
    const send = vi.fn();
    await agent.onMessage({ send } as unknown as Connection, 'やあ');
    expect(run).toHaveBeenCalledWith('@cf/meta/llama-3.1-8b-instruct-fp8', {
      prompt: 'やあ',
    });
    expect(send).toHaveBeenCalledWith('こんにちは');
  });
});
