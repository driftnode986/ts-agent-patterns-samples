// #region read-only
import { runQuery } from './run-query';

// MCP のツール名は mcp__<サーバー名>__<ツール名> になる
const specsReadTools = [
  'read_text_file', 'read_multiple_files', 'list_directory',
  'directory_tree', 'search_files', 'get_file_info',
].map((name) => `mcp__specs__${name}`);

const result = await runQuery({
  prompt:
    'src/api/ 配下のエンドポイントを一覧にして、' +
    '仕様書フォルダの記述と食い違いがないか確認して',
  options: {
    tools: ['Read', 'Glob', 'Grep'], // 使える組込ツールはこの 3 つだけ
    allowedTools: ['Read', 'Glob', 'Grep', ...specsReadTools],
    permissionMode: 'dontAsk', // allowedTools に無い呼び出しは拒否する
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
