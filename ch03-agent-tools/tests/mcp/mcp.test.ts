import { afterEach, describe, expect, it, vi } from 'vitest';
import { Agent } from '@mastra/core/agent';
import { createTool } from '@mastra/core/tools';
import { MCPClient } from '@mastra/mcp';
import { z } from 'zod';
import { claude, resetModels } from '../helpers/models';

vi.mock('@ai-sdk/anthropic', async () => {
  const { anthropicMock } = await import('../helpers/models');
  return { anthropic: anthropicMock };
});

// MCP サーバーを起動しない。MCP サーバーが返す Tool の代わり
const listIssues = createTool({
  id: 'list_issues',
  description: 'Issue の一覧を返します',
  inputSchema: z.object({ repo: z.string() }),
  outputSchema: z.object({ issues: z.array(z.string()) }),
  execute: async () => ({ issues: ['#1 README の誤字'] }),
});

afterEach(() => {
  vi.restoreAllMocks();
  resetModels();
});

describe('githubAgent (3.7)', () => {
  it('MCPClient.listTools() の Tool を Agent に渡す', async () => {
    vi.spyOn(MCPClient.prototype, 'listTools').mockResolvedValue({
      github_list_issues: listIssues,
    });
    const { githubAgent } = await import('../../src/mastra/agents/github-agent');
    const { mcpClient } = await import('../../src/mastra/mcp/client');

    expect(Object.keys(await githubAgent.listTools())).toEqual(['github_list_issues']);
    claude.enqueue(
      { toolCalls: [{ toolName: 'github_list_issues', input: { repo: 'a/b' } }] },
      { text: 'Issue は 1 件です' },
    );
    const response = await githubAgent.generate('Issue を見せて');
    expect(response.toolResults[0].payload.result).toEqual({
      issues: ['#1 README の誤字'],
    });
    await mcpClient.disconnect();
  });
});

describe('streamWithUserTools (3.7)', () => {
  it('listToolsets() の Tool セットを呼び出しごとに渡す', async () => {
    const spy = vi
      .spyOn(MCPClient.prototype, 'listToolsets')
      .mockResolvedValue({ crm: { list_deals: listIssues } });
    const { streamWithUserTools } = await import('../../src/mastra/mcp/user-tools');
    const agent = new Agent({
      id: 'crm-agent',
      name: 'CRM エージェント',
      instructions: '商談を案内します',
      model: claude.model,
    });

    claude.enqueue({ text: '最近の商談は 2 件です' });
    const response = await streamWithUserTools(agent, 'user-1', 'token-abc');
    expect(await response.text).toBe('最近の商談は 2 件です');
    expect(spy).toHaveBeenCalledOnce();
    // Tool セットの Tool がモデルに渡っている
    const tools = claude.model.doStreamCalls[0].tools ?? [];
    expect(tools.map((t) => t.name)).toContain('list_deals');

    // 同じユーザーで 2 回目を呼んでもエラーにならない (id で同じ MCPClient を使う)
    claude.enqueue({ text: '2 回目' });
    const again = await streamWithUserTools(agent, 'user-1', 'token-abc');
    expect(await again.text).toBe('2 回目');
  });
});
