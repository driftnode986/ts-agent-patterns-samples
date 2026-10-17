// src/mastra/agents/resilient-agent.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const resilientAgent = new Agent({
  name: 'ResilientSupport',
  instructions: '顧客サポートを行います。',
  model: anthropic('claude-sonnet-4-6'),
  // Claude が応答不能の場合、GPT-4o にフォールバック
  modelFallback: openai('gpt-4o'),
});
