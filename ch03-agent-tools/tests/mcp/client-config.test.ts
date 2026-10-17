import { describe, expect, it, vi } from 'vitest';

// MCPClient に渡した設定を記録する偽物。MCP サーバーには接続しない
const received: unknown[] = [];
vi.mock('@mastra/mcp', () => ({
  MCPClient: class {
    constructor(options: unknown) {
      received.push(options);
    }
  },
}));

describe('mcpClient の接続設定 (3.7)', () => {
  it('GitHub 公式のリモート MCP サーバーと filesystem サーバーを使う', async () => {
    vi.stubEnv('GITHUB_TOKEN', 'ghp_test');
    await import('../../src/mastra/mcp/client');
    expect(received[0]).toMatchObject({
      servers: {
        github: {
          url: new URL('https://api.githubcopilot.com/mcp/'),
          requestInit: { headers: { Authorization: 'Bearer ghp_test' } },
        },
        filesystem: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-filesystem@1.0.0', './data'],
        },
      },
    });
    // 非推奨になった @modelcontextprotocol/server-github を使っていない
    expect(JSON.stringify(received[0])).not.toContain('server-github');
    vi.unstubAllEnvs();
  });
});
