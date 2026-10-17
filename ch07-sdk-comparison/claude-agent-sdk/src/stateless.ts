// #region stateless
import { runQuery } from './run-query';

const result = await runQuery({
  prompt: 'package.json の依存関係を確認して、未使用のものを報告して',
  options: {
    model: 'claude-sonnet-4-6',
    allowedTools: ['Read', 'Bash', 'Glob'],
    maxTurns: 5,
  },
});
// #endregion

console.log(result.result);
