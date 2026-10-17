// 3.12 のテナント Agent に渡す Tool。FAQ をキーワードで検索する
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const faqs = [
  'パスワードは設定画面の「セキュリティ」から変更できます',
  '請求書は毎月1日に発行されます',
];

export const searchKnowledgeBase = createTool({
  id: 'search-knowledge-base',
  description: 'サポート用の FAQ をキーワードで検索し、一致した回答を返します',
  inputSchema: z.object({ keyword: z.string().describe('検索キーワード') }),
  outputSchema: z.object({ answers: z.array(z.string()) }),
  execute: async ({ keyword }) => ({
    answers: faqs.filter((faq) => faq.includes(keyword)),
  }),
});
