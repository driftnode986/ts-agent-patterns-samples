// #region stateless
import { runQuery } from './run-query';

const result = await runQuery({
  prompt: 'package.json の依存関係を確認して、未使用のものを報告して',
  options: {
    model: 'claude-sonnet-4-6',
    tools: ['Read', 'Glob'], // 使える組込ツールを読み取りだけにする
    allowedTools: ['Read', 'Glob'], // 確認なしで実行してよいツール
    permissionMode: 'dontAsk', // それ以外の呼び出しは拒否する
    maxTurns: 5,
  },
});
// #endregion

console.log(result.result);
