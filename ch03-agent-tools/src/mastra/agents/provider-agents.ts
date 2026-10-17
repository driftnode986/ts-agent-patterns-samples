// src/mastra/agents/provider-agents.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';
import { google } from '@ai-sdk/google';

const instructions = 'ユーザーの質問に回答するアシスタントです。';

// プロバイダを切り替えるには、import とモデル名を変えるだけ
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
  model: google('gemini-2.0-flash'),
});
