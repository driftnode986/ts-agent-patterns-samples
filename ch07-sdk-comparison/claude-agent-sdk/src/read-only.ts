// #region read-only
import { runQuery } from './run-query';

const result = await runQuery({
  prompt:
    'src/api/ 配下のエンドポイントを一覧にして、' +
    '各エンドポイントのテストカバレッジを確認して',
  options: {
    allowedTools: ['Read', 'Bash', 'Glob', 'Grep'],
    disallowedTools: ['Write', 'Edit'],
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    mcpServers: {
      postgres: {
        command: 'npx',
        args: ['-y', '@modelcontextprotocol/server-postgres'],
        env: { DATABASE_URL: process.env.DATABASE_URL ?? '' },
      },
    },
  },
});
// #endregion

console.log(result.result);
