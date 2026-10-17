// src/mastra/agents/support-agent.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'support-agent',
  instructions: 'あなたは EC サイトのサポート担当です。',
  model: anthropic('claude-sonnet-4-6'),
});
