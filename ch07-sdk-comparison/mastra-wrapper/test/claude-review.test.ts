import { describe, expect, it, vi } from 'vitest';
import { Agent } from '@mastra/core/agent';
import { codeReviewTool } from '../src/mastra/tools/claude-review';
import { scriptedModel, type Reply } from '../../testing/mock-model';

// Claude Code を起動しないよう、query を決まったレビュー結果を返す偽物にする
const query = vi.hoisted(() =>
  vi.fn(async function* (
    _params: unknown,
  ): AsyncGenerator<Record<string, unknown>> {
    yield {
      type: 'result',
      subtype: 'success',
      result: '問題1: any を使っている。問題2: 例外を握りつぶしている。',
    };
  }),
);
vi.mock('@anthropic-ai/claude-agent-sdk', () => ({ query }));

describe('codeReviewTool', () => {
  it('is called by a Mastra agent and returns the Claude review', async () => {
    const replies: Reply[] = [
      { toolCall: { name: 'codeReviewTool', input: { filePath: 'src/a.ts' } } },
      { text: '2件の問題があります' },
    ];
    const agent = new Agent({
      id: 'reviewer',
      name: 'Reviewer',
      instructions: 'コードレビューを依頼されたらツールを使う',
      model: scriptedModel(replies),
      tools: { codeReviewTool },
    });
    const res = await agent.generate('src/a.ts をレビューして');

    expect(query.mock.calls[0]?.[0]).toMatchObject({
      prompt: expect.stringContaining('src/a.ts'),
      options: {
        tools: ['Read', 'Grep', 'Glob'],
        allowedTools: ['Read', 'Grep', 'Glob'],
        permissionMode: 'dontAsk',
      },
    });
    expect(res.toolResults[0]?.payload.result).toEqual({
      review: '問題1: any を使っている。問題2: 例外を握りつぶしている。',
      issues: 2,
    });
  });
});
