// src/mastra/agents/code-review.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const codeReviewAgent = new Agent({
  id: 'code-review-agent',
  name: 'コードレビューエージェント',
  instructions: `コードレビューの専門家です。
セキュリティ観点で厳しくチェックし、問題点と修正案を示してください。`,
  model: anthropic('claude-sonnet-4-6'),
});
