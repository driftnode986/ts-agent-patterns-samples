import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const resilientAgent = new Agent({
  id: 'resilient-agent',
  name: '耐障害エージェント',
  instructions: 'ユーザーの質問に回答するアシスタントです。',
  model: [
    { model: anthropic('claude-sonnet-4-6'), maxRetries: 2 },
    { model: openai('gpt-4o'), maxRetries: 2 },
  ],
});
