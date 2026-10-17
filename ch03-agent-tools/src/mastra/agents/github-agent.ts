import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { mcpClient } from '../mcp/client';

export const githubAgent = new Agent({
  id: 'github-agent',
  name: 'GitHub エージェント',
  instructions: `GitHub リポジトリの操作を支援するエージェントです。
Issue の作成、PR のレビュー、コードの検索ができます。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: await mcpClient.listTools(),
});
