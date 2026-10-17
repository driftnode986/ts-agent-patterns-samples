// #region define
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { db } from '../../lib/db';

export const queryDatabaseTool = createTool({
  id: 'query-database',
  description: 'SQL クエリを実行してデータベースから情報を取得します',
  inputSchema: z.object({
    query: z.string().describe('実行する SELECT クエリ'),
  }),
  outputSchema: z.object({
    rows: z.array(z.record(z.string(), z.unknown())),
    rowCount: z.number(),
  }),
  // #endregion
  // #region execute
  execute: async (inputData) => {
    if (!inputData.query.trim().toUpperCase().startsWith('SELECT')) {
      throw new Error(
        'SELECT 文のみ実行できます。' +
          'INSERT / UPDATE / DELETE は禁止されています'
      );
    }

    try {
      const result = await db.execute(inputData.query);
      return {
        rows: result.rows,
        rowCount: result.rows.length,
      };
    } catch (err) {
      throw new Error(
        `クエリの実行に失敗しました: ${(err as Error).message}。` +
          'SQL 構文を確認してください'
      );
    }
  },
});
// #endregion
