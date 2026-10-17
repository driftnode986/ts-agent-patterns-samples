import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { searchWebTool, searchDatabaseTool, getCalendarTool } from '../tools';

export const researchAgent = new Agent({
  id: 'research-agent',
  name: 'リサーチエージェント',
  instructions: `情報収集を担当するエージェントです。
Web 検索、データベース検索、カレンダー確認を並行して実行し、
結果をまとめてユーザーに報告してください。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: { searchWebTool, searchDatabaseTool, getCalendarTool },
});
