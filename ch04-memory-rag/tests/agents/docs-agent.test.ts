import { describe, it, expect, beforeAll } from 'vitest';
import { setTurns, calls, promptText } from '../helpers/mock-llm';
import { docsAgent } from '../../src/mastra/agents/docs-agent';

beforeAll(async () => {
  await import('../../src/scripts/index-documents');
});

describe('docsAgent', () => {
  it('検索ツールを呼び、その結果を踏まえて回答する', async () => {
    setTurns([
      { tool: 'searchDocsTool', input: { query: 'Tool の定義方法' } },
      { text: 'createTool で定義します。' },
    ]);

    const res = await docsAgent.generate('Tool はどう定義しますか');

    expect(res.text).toBe('createTool で定義します。');
    expect(res.toolResults[0]?.payload.toolName).toBe('searchDocsTool');
    // 2 回目の呼び出しには検索結果 (ドキュメント本文) が渡っている
    expect(promptText(1)).toContain('Zod スキーマで入出力を固定します');
    // LLM に見えるツール名は tools のキー。instructions もその名前で指示している
    expect(calls[0].tools?.map((t) => t.name)).toEqual(['searchDocsTool']);
    expect(promptText(0)).toContain('必ず searchDocsTool で');
  });
});
