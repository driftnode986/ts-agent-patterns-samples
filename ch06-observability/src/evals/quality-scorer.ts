// src/evals/quality-scorer.ts
import { createScorer } from '@mastra/core/evals';
import { z } from 'zod';

export const qualityScorer = createScorer({
  id: 'response-quality',
  description: 'Agent 応答の正確性と網羅性を評価',
  judge: {
    model: 'anthropic/claude-sonnet-4-6',
    instructions: '技術サポートの応答を厳格に評価してください。',
  },
})
  .analyze({
    description: '応答の正確性・網羅性を分析',
    outputSchema: z.object({
      isAccurate: z.boolean(),
      coverage: z.number().min(0).max(1),
      issues: z.array(z.string()),
    }),
    createPrompt: ({ run }) => `
以下の応答の正確性と網羅性を 0-1 のスケールで評価してください:
"${run.output.text}"
`,
  })
  .generateScore(({ results }) => {
    const { isAccurate, coverage } = results.analyzeStepResult;
    return isAccurate ? coverage : 0;
  })
  .generateReason({
    description: 'スコアの理由を説明',
    createPrompt: ({ results, score }) => `
スコア ${score} の理由を 1 文で説明してください。
分析結果: ${JSON.stringify(results.analyzeStepResult)}
`,
  });
