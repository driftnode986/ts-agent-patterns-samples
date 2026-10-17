// src/mastra/agents/resilient-agent.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const resilientAgent = new Agent({
  id: 'resilient-agent',
  name: '耐障害エージェント',
  instructions: 'ユーザーの質問に回答するアシスタントです。',
  model: {
    provider: anthropic,
    name: 'claude-sonnet-4-6',
    fallback: {
      provider: openai,
      name: 'gpt-4o',
    },
  },
});
