import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { weatherTool, searchTool } from '../tools';

export const fullAgent = new Agent({
  id: 'full-agent',
  name: '機能完備エージェント',
  instructions: `あなたはソフトウェアプロジェクトの技術アドバイザーです。
質問に対して具体的なコード例を交えて回答してください。
分からないことは「調べます」と言って適切なツールを使ってください。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: { weatherTool, searchTool },
});
