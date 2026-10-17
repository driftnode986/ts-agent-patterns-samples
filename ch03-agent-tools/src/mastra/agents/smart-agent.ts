// src/mastra/agents/smart-agent.ts
import { Agent } from '@mastra/core/agent';
import { selectModel } from '../../lib/model-router';

// Agent 定義時ではなく、呼び出し時にモデルを決定
const response = await agent.generate('...', {
  model: selectModel(estimatedTokens),
});
