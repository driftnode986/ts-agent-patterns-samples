// src/mastra/agents/index.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const supportAgent = new Agent({
  id: 'customer-support',
  name: 'CustomerSupport',
  instructions: 'あなたは丁寧な顧客サポート担当者です。',
  model: anthropic('claude-sonnet-4-6'),
});
