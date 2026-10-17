import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { memory } from '../memory';

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'サポートエージェント',
  instructions: 'ユーザーの質問に丁寧に回答するアシスタントです。',
  model: anthropic('claude-sonnet-4-6'),
  memory,
});
