import { Agent } from '@mastra/core/agent';

const instructions = 'ユーザーの質問に回答するアシスタントです。';

// model に 'プロバイダ/モデル名' の文字列を渡す。import は要らない
export const routerClaude = new Agent({
  id: 'router-claude-agent',
  name: 'Claude エージェント',
  instructions,
  model: 'anthropic/claude-sonnet-4-6',
});

export const routerGpt = new Agent({
  id: 'router-gpt-agent',
  name: 'GPT エージェント',
  instructions,
  model: 'openai/gpt-4o',
});

export const routerGemini = new Agent({
  id: 'router-gemini-agent',
  name: 'Gemini エージェント',
  instructions,
  model: 'google/gemini-2.5-flash',
});
