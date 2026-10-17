// src/mastra/mcp/client.ts
import { MCPClient } from '@mastra/mcp';

export const mcpClient = new MCPClient({
  servers: {
    // GitHub 公式の MCP サーバー (リモート版) に Streamable HTTP で接続
    github: {
      url: new URL('https://api.githubcopilot.com/mcp/'),
      requestInit: {
        headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` },
      },
    },
    // ローカルのプロセスとして起動 (stdio)。./data の下だけを読み書きできる
    filesystem: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem@1.0.0', './data'],
    },
  },
  timeout: 30000,
});
