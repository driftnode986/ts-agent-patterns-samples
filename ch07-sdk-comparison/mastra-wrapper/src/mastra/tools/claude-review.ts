// src/mastra/tools/claude-review.ts
import { createTool } from '@mastra/core/tools';
import { query } from '@anthropic-ai/claude-agent-sdk';
import { z } from 'zod';

export const codeReviewTool = createTool({
  id: 'claude-code-review',
  description: 'Claude Agent SDK でコードレビューを実行します',
  inputSchema: z.object({
    filePath: z.string().describe('レビュー対象のファイルパス'),
  }),
  outputSchema: z.object({
    review: z.string(),
    issues: z.number(),
  }),
  execute: async ({ context }) => {
    const result = await query({
      prompt: `${context.filePath} のコードをレビューして、問題点を報告してください`,
      options: {
        allowedTools: ['Read', 'Grep'],
        maxTurns: 5,
      },
    });

    return {
      review: result.result,
      issues: (result.result.match(/問題/g) || []).length,
    };
  },
});
