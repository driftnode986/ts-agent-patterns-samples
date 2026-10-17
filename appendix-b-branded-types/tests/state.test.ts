import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

// api-path.ts は読み込み時に callApi を呼ぶので、先に fetch を偽物にする
vi.hoisted(() => {
  globalThis.fetch = async () => new Response('[]');
});
import { callApi, type ApiPath } from '../src/examples/api-path';
import type { ImmutableAgentConfig } from '../src/types/agent-config';
import type { AgentState } from '../src/types/agent-state';
import type { ToolId } from '../src/types/branded';
import { assertNever, handleAgentState } from '../src/types/handle-agent-state';
import { calculateCost, type Tokens, type UsdCents } from '../src/types/units';
import type { ApprovalStepOutput } from '../src/mastra/workflows/approval-state';

afterEach(() => vi.unstubAllGlobals());

describe('Discriminated Union と Exhaustive Check', () => {
  it('状態ごとのメッセージを返す', () => {
    const states: AgentState[] = [
      { status: 'idle' },
      { status: 'thinking', startedAt: 1 },
      { status: 'executing_tool', toolId: 'search' as ToolId, input: {} },
      { status: 'waiting_human', reason: '承認待ち', suspendedAt: 2 },
      { status: 'completed', result: 'ok', finishedAt: 3 },
      { status: 'failed', error: new Error('boom'), failedAt: 4 },
    ];
    expect(states.map(handleAgentState)).toEqual([
      'Agent is ready',
      'Thinking since 1',
      'Executing search',
      'Waiting for human: 承認待ち',
      'Done: ok',
      'Error: boom',
    ]);
  });

  it('assertNever は想定外の値で例外を投げる', () => {
    expect(() => assertNever('unknown' as never)).toThrow('Unexpected value');
  });

  it('ApprovalStepOutput は decision で絞り込める', () => {
    const out = { decision: 'escalated', escalatedTo: 'u1' } as ApprovalStepOutput;
    if (out.decision === 'escalated') {
      expectTypeOf(out).toHaveProperty('escalatedTo');
    }
    expect(out.decision).toBe('escalated');
  });
});

describe('Template Literal Types', () => {
  it('callApi は API のベース URL にパスを付けて fetch する', async () => {
    const fetchMock = vi.fn(async () => new Response('[]'));
    vi.stubGlobal('fetch', fetchMock);
    await callApi('/api/v2/messages');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.example.com/api/v2/messages',
      undefined,
    );
    expectTypeOf<'/api/v3/users'>().not.toMatchTypeOf<ApiPath>();
  });
});

describe('Phantom Types', () => {
  it('入出力トークンからコストを計算する', () => {
    const cost = calculateCost(
      1_000_000 as Tokens,
      500_000 as Tokens,
      300 as UsdCents,
      1500 as UsdCents,
    );
    expect(cost).toBe(1050);
    expectTypeOf<Tokens>().not.toMatchTypeOf<UsdCents>();
  });
});

describe('Readonly', () => {
  it('設定の書き換えはコンパイルエラーになる', () => {
    const config: ImmutableAgentConfig = {
      name: 'a',
      instructions: 'b',
      model: 'c',
      tools: ['search'],
      memory: { backend: 'libsql', scope: 'thread' },
    };
    // @ts-expect-error readonly プロパティには代入できない
    config.name = 'x';
    // @ts-expect-error ReadonlyArray には push が無い
    config.tools.push('y');
    expect(config.memory.backend).toBe('libsql');
  });
});
