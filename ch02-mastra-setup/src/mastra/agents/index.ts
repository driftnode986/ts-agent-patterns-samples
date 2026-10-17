// src/mastra/agents/index.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { weatherTool } from '../tools';

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: '天気エージェント',
  instructions: `あなたは天気情報を提供するアシスタントです。
ユーザーが都市名を指定したら、get-weather ツールを使って天気を取得してください。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: { weatherTool },
});
