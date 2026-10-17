import { afterEach, describe, expect, it, vi } from 'vitest';

// Claude Code を起動しないよう、query を偽物にする。呼ばれるたびに
// assistant → result の順でメッセージを返し、セッション ID は呼び出し番号
const query = vi.hoisted(() =>
  vi.fn(async function* (
    _params: unknown,
  ): AsyncGenerator<Record<string, unknown>> {
    const n = query.mock.calls.length;
    yield { type: 'assistant', message: { content: '調べています' } };
    yield {
      type: 'result',
      subtype: 'success',
      result: `回答${n}`,
      session_id: `session-${n}`,
    };
  }),
);
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({ query }));

afterEach(() => {
  query.mockClear();
  vi.resetModules();
  vi.restoreAllMocks();
});

describe('Claude Agent SDK', () => {
  it('agent.ts prints only the final result', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/agent');
    expect(log.mock.calls).toEqual([['回答1']]);
  });

  it('runQuery returns the result and session id', async () => {
    const { runQuery } = await import('../src/run-query');
    await expect(runQuery({ prompt: 'x' })).resolves.toEqual({
      result: '回答1',
      sessionId: 'session-1',
    });
  });

  it('runQuery throws when the run did not succeed', async () => {
    query.mockImplementationOnce(async function* () {
      yield { type: 'result', subtype: 'error_max_turns' };
    });
    const { runQuery } = await import('../src/run-query');
    await expect(runQuery({ prompt: 'x' })).rejects.toThrow('error_max_turns');
  });

  it('resume.ts continues the first session', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/resume');
    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[1]?.[0]).toMatchObject({
      options: { resume: 'session-1' },
    });
  });

  it('stateless.ts limits the tools', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/stateless');
    expect(query.mock.calls[0]?.[0]).toMatchObject({
      options: { allowedTools: ['Read', 'Bash', 'Glob'], maxTurns: 5 },
    });
  });

  it('read-only.ts blocks write tools and connects the MCP server', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/read-only');
    expect(query.mock.calls[0]?.[0]).toMatchObject({
      options: {
        disallowedTools: ['Write', 'Edit'],
        mcpServers: { postgres: { command: 'npx' } },
      },
    });
  });
});
