import { describe, expect, it, vi } from 'vitest';
import type { Connection } from 'agents';
import type { Reply } from '../../testing/mock-model';

// Durable Objects の実行環境は Node.js では動かないため、Agent の基底クラスを
// 最小の偽物に差し替える。state / setState はメモリ上に持ち、runFiber は
// 関数をそのまま実行する。getAgentByName は名前を記録した偽のスタブを返す
const fakes = vi.hoisted(() => {
  class FakeAgent<S> {
    env: unknown;
    state: S | undefined;
    messages: unknown[] = [];
    constructor(_ctx: unknown, env: unknown) {
      this.env = env;
    }
    setState(state: S) {
      this.state = state;
    }
    async runFiber<T>(name: string, fn: (ctx: object) => Promise<T>) {
      fibers.push(name);
      return fn({});
    }
  }
  const fibers: string[] = [];
  return { FakeAgent, fibers };
});
vi.mock('agents', () => ({
  Agent: fakes.FakeAgent,
  getAgentByName: async (ns: { get(name: string): unknown }, name: string) =>
    ns.get(name),
}));
vi.mock('@cloudflare/ai-chat', () => ({ AIChatAgent: fakes.FakeAgent }));

const replies = vi.hoisted(() => [] as Reply[]);
vi.mock('@ai-sdk/anthropic', async () => {
  const { scriptedModel } = await import('../../testing/mock-model');
  return { anthropic: (id: string) => scriptedModel(replies, id) };
});

function fakeEnv(answers: string[]) {
  const run = vi.fn(async () => ({ response: answers.shift() }));
  return { env: { AI: { run } } as unknown as Env, run };
}
const ctx = {} as DurableObjectState;

describe('CustomerSupport', () => {
  it('answers and keeps the conversation history in state', async () => {
    const { CustomerSupport } = await import('../src/index');
    const { env, run } = fakeEnv(['こんにちは', '承知しました']);
    const agent = new CustomerSupport(ctx, env);
    const send = vi.fn();
    const conn = { send } as unknown as Connection;

    await agent.onMessage(conn, '返品したい');
    await agent.onMessage(conn, 'お願いします');

    expect(send.mock.calls).toEqual([['こんにちは'], ['承知しました']]);
    expect(agent.state?.history).toHaveLength(4);
    // 2回目の呼び出しには1回目のやりとりが入っている
    const second = run.mock.calls[1] as unknown as [string, { messages: unknown[] }];
    expect(second[1].messages).toHaveLength(4);
  });

  it('routes requests to the named agent instance', async () => {
    const worker = (await import('../src/index')).default;
    const fetch = vi.fn(async () => new Response('ok'));
    const get = vi.fn(() => ({ fetch }));
    const env = { CUSTOMER_SUPPORT: { get } } as unknown as Env;
    const res = await worker.fetch(new Request('http://x/'), env);
    expect(get).toHaveBeenCalledWith('user-123');
    expect(await res.text()).toBe('ok');
  });
});

describe('ChatAgent', () => {
  it('streams the Claude answer for the stored messages', async () => {
    const { ChatAgent } = await import('../src/chat-agent');
    const agent = new ChatAgent(ctx, {} as Env);
    agent.messages = [
      { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'やあ' }] },
    ];
    replies.push({ text: 'こんにちは' });
    const res = await agent.onChatMessage();
    expect(await res.text()).toContain('こんにちは');
  });
});

describe('ResearchAgent', () => {
  it('runs search and summarize as two durable fibers', async () => {
    const { ResearchAgent } = await import('../src/research-agent');
    const { env, run } = fakeEnv(['検索結果', '要約']);
    const agent = new ResearchAgent(ctx, env);
    const send = vi.fn();
    await agent.onMessage({ send } as unknown as Connection, 'Workers AI');
    expect(fakes.fibers).toEqual(['search', 'summarize']);
    const second = run.mock.calls[1] as unknown as [string, { messages: { content: string }[] }];
    expect(second[1].messages[0]?.content).toBe('Summarize: 検索結果');
    expect(send).toHaveBeenCalledWith('要約');
  });
});
