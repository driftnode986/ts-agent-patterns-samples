import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { openai } from '@ai-sdk/openai';

export const resilientAgent = new Agent({
  id: 'resilient-support',
  name: 'ResilientSupport',
  instructions: '顧客サポートを行います。',
  // 先頭から順に試す。Claude が応答不能の場合、GPT-4o にフォールバック
  model: [
    { model: anthropic('claude-sonnet-4-6'), maxRetries: 2 },
    { model: openai('gpt-4o'), maxRetries: 2 },
  ],
});
