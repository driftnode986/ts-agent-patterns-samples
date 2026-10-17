// src/mastra/agents/reviewer.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

export const reviewerAgent = new Agent({
  id: 'document-reviewer',
  name: 'Document Reviewer',
  instructions: '文書をレビューし、問題点と改善案を簡潔に挙げてください。',
  model: anthropic('claude-sonnet-4-6'),
});
