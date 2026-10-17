import { Agent } from '@mastra/core/agent';
import { selectModel } from '../../lib/model-router';

export const agent = new Agent({
  id: 'smart-agent',
  name: 'スマートエージェント',
  instructions: 'ユーザーの質問に回答するアシスタントです。',
  model: selectModel(0),
});

// 入力のトークン数の大まかな見積もり (日本語はおよそ 1 文字 1 トークン)
export function estimateTokens(text: string): number {
  return text.length;
}

export async function ask(message: string) {
  const estimatedTokens = estimateTokens(message);
  // #region generate
  // Agent 定義時ではなく、呼び出し時にモデルを決定
  const response = await agent.generate(message, {
    model: selectModel(estimatedTokens),
  });
  // #endregion
  return response.text;
}
