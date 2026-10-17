// #region versions
import { Agent } from '@mastra/core/agent';
import { anthropic } from '@ai-sdk/anthropic';

// blue = v1（今のプロンプト）、green = v2（新しいプロンプト）
const instructionsV1 =
  '丁寧な顧客サポートを行います。必ず挨拶から始めてください。';
const instructionsV2 =
  '簡潔な顧客サポートを行います。回答は3文以内にしてください。';

function createSupportAgent(version: 'v1' | 'v2') {
  return new Agent({
    id: `customer-support-${version}`,
    name: 'CustomerSupport',
    instructions: version === 'v2' ? instructionsV2 : instructionsV1,
    model: anthropic('claude-sonnet-4-6'),
  });
}

export const supportAgents = {
  v1: createSupportAgent('v1'),
  v2: createSupportAgent('v2'),
};
// #endregion

// #region blue-green
// Blue-Green: 環境変数で、このデプロイ全体が使う版を決める
const AGENT_VERSION = process.env.AGENT_VERSION || 'blue';
export const supportAgent =
  AGENT_VERSION === 'green' ? supportAgents.v2 : supportAgents.v1;
// #endregion
