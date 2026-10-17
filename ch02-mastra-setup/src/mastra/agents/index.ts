// #region support-agent
// src/mastra/agents/index.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'サポートエージェント',
  instructions: `あなたはソフトウェア製品のサポート担当者です。
ユーザーからの質問に対して、正確で簡潔な回答を提供してください。
分からないことは正直に「分かりません」と答えてください。`,
  model: anthropic('claude-sonnet-4-6'),
});
// #endregion

// #region weather-agent
import { weatherTool } from '../tools';

export const weatherAgent = new Agent({
  id: 'weather-agent',
  name: '天気エージェント',
  instructions: `あなたは天気情報を提供するアシスタントです。
ユーザーが都市名を指定したら、
get-weather ツールを使って天気を取得してください。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: { weatherTool },
});
// #endregion
