// src/mastra/agents/support.ts
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { anthropic } from '@ai-sdk/anthropic';

const memory = new Memory({
  storage: new LibSQLStore({
    id: 'support-storage',
    url: 'file:./memory.db',
  }),
  options: {
    messageHistory: { maxTokens: 8000 },
  },
});

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'サポートエージェント',
  instructions: 'ユーザーの質問に丁寧に回答するアシスタントです。',
  model: anthropic('claude-sonnet-4-6'),
  memory,
});
