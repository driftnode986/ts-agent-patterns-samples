// src/mastra/memory.ts
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

// #region template
const template = `
# ユーザープロファイル

## 基本情報
- 名前:
- 役職:
- 会社:
- 所在地:

## 技術スタック
- 主要言語:
- フレームワーク:
- インフラ:

## プロジェクト情報
- 現在のプロジェクト:
- 課題:
- 期限:

## コミュニケーション
- 好みのスタイル:
- 注意事項:
`;
// #endregion

// #region working-memory
export const memory = new Memory({
  storage: new LibSQLStore({
    id: 'app-storage',
    url: 'file:./memory.db',
  }),
  options: {
    messageHistory: { maxTokens: 8000 },
    workingMemory: {
      enabled: true,
      template,
    },
  },
});
// #endregion
