// src/mastra/agents/index.ts
const AGENT_VERSION = process.env.AGENT_VERSION || 'blue';

const instructionsV1 = '丁寧な顧客サポートを行います。必ず挨拶から始めてください。';
const instructionsV2 = '簡潔な顧客サポートを行います。回答は3文以内にしてください。';

export const supportAgent = new Agent({
  name: 'CustomerSupport',
  instructions: AGENT_VERSION === 'green' ? instructionsV2 : instructionsV1,
  model: anthropic('claude-sonnet-4-6'),
});
