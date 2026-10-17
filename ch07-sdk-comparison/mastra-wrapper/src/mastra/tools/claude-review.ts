// #region define
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
  // #endregion
  // #region execute
  execute: async ({ filePath }) => {
    let review = '';
    for await (const message of query({
      prompt:
        `${filePath} のコードをレビューして、問題点を報告してください`,
      options: {
        tools: ['Read', 'Grep', 'Glob'], // 読み取り用の組込ツールだけ
        allowedTools: ['Read', 'Grep', 'Glob'],
        permissionMode: 'dontAsk', // ほかの呼び出しは拒否する
        maxTurns: 5,
      },
    })) {
      if (message.type === 'result' && message.subtype === 'success') {
        review = message.result;
      }
    }

    return {
      review,
      issues: (review.match(/問題/g) || []).length,
    };
  },
});
// #endregion
