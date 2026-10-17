// src/mastra/mcp/user-tools.ts
import type { Agent } from '@mastra/core/agent';
import { MCPClient } from '@mastra/mcp';

export async function streamWithUserTools(
  agent: Agent,
  userId: string,
  userToken: string,
) {
  // #region user-mcp
  // ユーザーごとの MCP 設定
  const userMcp = new MCPClient({
    id: `crm-${userId}`,
    servers: {
      crm: {
        url: new URL('https://crm-mcp.example.com/mcp'),
        requestInit: {
          headers: { Authorization: `Bearer ${userToken}` },
        },
      },
    },
  });

  const response = await agent.stream('最近の商談を教えてください', {
    toolsets: await userMcp.listToolsets(),
  });
  // #endregion
  return response;
}
