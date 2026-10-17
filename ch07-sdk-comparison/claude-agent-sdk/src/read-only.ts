// #region read-only
import { runQuery } from './run-query';

// MCP のツール名は mcp__<サーバー名>__<ツール名> になる
const specsWriteTools = [
  'write_file', 'edit_file', 'create_directory', 'move_file',
].map((name) => `mcp__specs__${name}`);

const result = await runQuery({
  prompt:
    'src/api/ 配下のエンドポイントを一覧にして、' +
    '仕様書フォルダの記述と食い違いがないか確認して',
  options: {
    allowedTools: ['Read', 'Bash', 'Glob', 'Grep'],
    disallowedTools: ['Write', 'Edit', ...specsWriteTools],
    permissionMode: 'bypassPermissions',
    allowDangerouslySkipPermissions: true,
    mcpServers: {
      specs: {
        command: 'npx',
        args: [
          '-y',
          '@modelcontextprotocol/server-filesystem@1.0.0',
          process.env.SPECS_DIR ?? './docs/specs', // 読ませるフォルダ
        ],
      },
    },
  },
});
// #endregion

console.log(result.result);
