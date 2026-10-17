// src/mastra/tools/search-docs.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { searchKnowledgeBase } from '../../lib/search';

export const searchDocsTool = createTool({
  id: 'search-docs',
  description:
    '社内ドキュメント (ユーザーガイド、API リファレンス、FAQ) から'
    + '関連情報を検索します。'
    + 'ユーザーの質問に直接答えられない場合に使ってください',
  inputSchema: z.object({
    query: z.string()
      .describe('検索クエリ (ユーザーの質問を自然文でそのまま渡す)'),
  }),
  outputSchema: z.object({
    results: z.array(z.string()).describe('関連ドキュメントのテキスト'),
    resultCount: z.number(),
  }),
  execute: async (inputData) => {
    const results = await searchKnowledgeBase(inputData.query);
    return {
      results,
      resultCount: results.length,
    };
  },
});
