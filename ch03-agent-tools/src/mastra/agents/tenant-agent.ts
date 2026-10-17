// src/mastra/agents/tenant-agent.ts
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';
import { buildInstructions } from '../../lib/instructions';

export function createTenantAgent(tenantConfig: TenantConfig) {
  return new Agent({
    id: `support-${tenantConfig.tenantId}`,
    name: `${tenantConfig.companyName} サポート`,
    instructions: buildInstructions(tenantConfig),
    model: anthropic('claude-sonnet-4-6'),
    tools: { searchKnowledgeBase },
  });
}
