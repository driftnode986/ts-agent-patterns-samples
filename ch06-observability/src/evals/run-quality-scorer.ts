// src/evals/run-quality-scorer.ts
import { supportAgent as agent } from '../mastra/agents/support-agent';
import { qualityScorer } from './quality-scorer';

// #region run-scorer
const question = 'TypeScript の型推論について説明して';
const response = await agent.generate(question);

const evalResult = await qualityScorer.run({
  input: [{ role: 'user', content: question }],
  output: { text: response.text },
});
console.log('Score:', evalResult.score);
console.log('Reason:', evalResult.reason);
// #endregion

export { evalResult };
