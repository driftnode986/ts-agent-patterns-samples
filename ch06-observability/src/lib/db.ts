// 検索の例に使うメモリ上の DB。本番では PostgreSQL などに置き換える
// #region db
const documents = [
  'TypeScript の型推論は変数の初期値から型を決める',
  'Mastra の Workflow は Step をつないで作る',
  'Langfuse はトレースとプロンプトを管理する',
];

export const db = {
  async search(query: string): Promise<string[]> {
    return documents.filter((doc) => doc.includes(query));
  },
};
// #endregion
