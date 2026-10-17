// src/mastra/agents/provider-agents.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

const instructions = 'ユーザーの質問に回答するアシスタントです。';

// AI SDK のプロバイダ関数でモデルを渡す。プロバイダごとに import が要る
export const agentClaude = new Agent({
  id: 'claude-agent',
  name: 'Claude エージェント',
  instructions,
  model: anthropic('claude-sonnet-4-6'),
});

export const agentGpt = new Agent({
  id: 'gpt-agent',
  name: 'GPT エージェント',
  instructions,
  model: openai('gpt-4o'),
});

export const agentGemini = new Agent({
  id: 'gemini-agent',
  name: 'Gemini エージェント',
  instructions,
  model: google('gemini-2.5-flash'),
});
