// #region search-tools
// 3.1 と 3.5 の Agent に渡す Tool。
// 外部 API の代わりに固定のデータを返す
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const resultsSchema = z.object({ results: z.array(z.string()) });

export const weatherTool = createTool({
  id: 'get-weather',
  description: '都市名を指定して、現在の天気を取得します',
  inputSchema: z.object({ city: z.string().describe('都市名') }),
  outputSchema: z.object({ city: z.string(), condition: z.string() }),
  execute: async ({ city }) => ({ city, condition: '晴れ' }),
});

export const searchTool = createTool({
  id: 'search-docs',
  description: '技術ドキュメントをキーワードで検索します',
  inputSchema: z.object({
    query: z.string().describe('検索キーワード'),
  }),
  outputSchema: resultsSchema,
  execute: async ({ query }) => ({
    results: [`${query} の公式ドキュメント`],
  }),
});

// #endregion

// #region research-tools
export const searchWebTool = createTool({
  id: 'search-web',
  description:
    'Web を検索して、キーワードに関する記事の見出しを返します',
  inputSchema: z.object({
    query: z.string().describe('検索キーワード'),
  }),
  outputSchema: resultsSchema,
  execute: async ({ query }) => ({
    results: [`${query} に関するニュース`],
  }),
});

export const searchDatabaseTool = createTool({
  id: 'search-database',
  description:
    '社内データベースから、キーワードに一致する記録を検索します',
  inputSchema: z.object({
    query: z.string().describe('検索キーワード'),
  }),
  outputSchema: resultsSchema,
  execute: async ({ query }) => ({ results: [`${query} の社内記録`] }),
});
// #endregion

// #region calendar-tool
export const getCalendarTool = createTool({
  id: 'get-calendar',
  description: '日付を指定して、その週の予定を取得します',
  inputSchema: z.object({
    date: z.string().describe('日付 (YYYY-MM-DD)'),
  }),
  outputSchema: z.object({ events: z.array(z.string()) }),
  execute: async ({ date }) => ({ events: [`${date} 10:00 定例会議`] }),
});
// #endregion
