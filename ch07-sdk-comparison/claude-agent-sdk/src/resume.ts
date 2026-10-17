// #region resume
import { runQuery } from './run-query';

// 最初の呼び出し
const result1 = await runQuery({
  prompt: '現在の型定義の問題点を洗い出して',
  options: {
    model: 'claude-sonnet-4-6',
    systemPrompt:
      'TypeScript プロジェクトのリファクタリングを支援してください。',
  },
});

// セッション ID を使って会話を継続
const result2 = await runQuery({
  prompt: '指摘した問題のうち、最も影響の大きいものを修正して',
  options: {
    resume: result1.sessionId,
  },
});
// #endregion

console.log(result2.result);
