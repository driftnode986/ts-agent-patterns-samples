// src/mastra/mcp/client.ts
import { MCPClient } from '@mastra/mcp';

export const mcpClient = new MCPClient({
  servers: {
    github: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-github'],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: process.env.GITHUB_TOKEN!,
      },
    },
    filesystem: {
      command: 'npx',
      args: ['-y', '@modelcontextprotocol/server-filesystem', './data'],
    },
  },
  timeout: 30000,
});
