// src/mastra/tools/delegate.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { codeReviewAgent } from '../agents/code-review';

export const delegateCodeReviewTool = createTool({
  id: 'delegate-code-review',
  description: 'コードレビューを専門のエージェントに委任します',
  inputSchema: z.object({
    code: z.string().describe('レビュー対象のコード'),
    language: z.string().describe('プログラミング言語'),
  }),
  outputSchema: z.object({
    review: z.string(),
    severity: z.enum(['info', 'warning', 'error']),
  }),
  execute: async (inputData) => {
    const result = await codeReviewAgent.generate(
      `以下の ${inputData.language} コードをレビューしてください:\n\n${inputData.code}`
    );
    return {
      review: result.text,
      severity: 'info',
    };
  },
});
