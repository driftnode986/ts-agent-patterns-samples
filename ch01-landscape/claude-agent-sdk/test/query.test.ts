import { describe, expect, it, vi } from 'vitest';

// Claude Code を起動しないよう、query を決まったメッセージを返す偽物にする
const query = vi.hoisted(() =>
  vi.fn(async function* () {
    yield { type: 'assistant', message: { content: 'src/a.ts を直しました' } };
    yield { type: 'result', subtype: 'success', result: '完了' };
  }),
);
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({ query }));

describe('query()', () => {
  it('prints every message the agent loop yields', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/index');
    expect(query).toHaveBeenCalledWith({
      prompt: 'TypeScript プロジェクトのバグを見つけて修正してください',
      options: { allowedTools: ['Read', 'Edit', 'Bash'] },
    });
    expect(log).toHaveBeenCalledTimes(2);
    expect(log.mock.calls[1]?.[0]).toMatchObject({ type: 'result' });
  });
});
