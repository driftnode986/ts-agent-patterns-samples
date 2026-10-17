// src/mastra/agents/support-agent.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { getCustomerTool, createInvoiceTool } from '../tools';

export const supportAgent = new Agent({
  id: 'support-agent',
  name: 'サポートエージェント',
  instructions: `顧客サポートを担当するエージェントです。
顧客 ID が示されたら、getCustomerTool で顧客情報を確認してから
回答してください。`,
  model: anthropic('claude-sonnet-4-6'),
  tools: { getCustomerTool, createInvoiceTool },
});
