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

  it('stateless.ts limits the tools to Read and Glob', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/stateless');
    expect(query.mock.calls[0]?.[0]).toMatchObject({
      options: {
        tools: ['Read', 'Glob'],
        allowedTools: ['Read', 'Glob'],
        permissionMode: 'dontAsk',
        maxTurns: 5,
      },
    });
  });

  // 本物の Claude Code で書き込みが拒否されることは permissions.e2e.test.ts で確かめる
  it('read-only.ts allows only the read tools, including the MCP server ones', async () => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.stubEnv('SPECS_DIR', undefined);
    await import('../src/read-only');
    const options = query.mock.calls[0]?.[0];
    expect(options).toMatchObject({
      options: {
        tools: ['Read', 'Glob', 'Grep'],
        allowedTools: [
          'Read',
          'Glob',
          'Grep',
          'mcp__specs__read_text_file',
          'mcp__specs__read_multiple_files',
          'mcp__specs__list_directory',
          'mcp__specs__directory_tree',
          'mcp__specs__search_files',
          'mcp__specs__get_file_info',
        ],
        permissionMode: 'dontAsk',
        mcpServers: {
          specs: {
            command: 'npx',
            args: [
              '-y',
              '@modelcontextprotocol/server-filesystem@1.0.0',
              './docs/specs',
            ],
          },
        },
      },
    });
    expect(options).not.toHaveProperty('options.allowDangerouslySkipPermissions');
    vi.unstubAllEnvs();
  });
});
