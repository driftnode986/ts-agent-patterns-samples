// #region setup
import { describe, it, expect, vi } from 'vitest';
import { claude } from '../helpers/models';

// LLM の代わりに、応答を並べたテスト用モデルを使う
vi.mock('@ai-sdk/anthropic', async () => {
  const { anthropicMock } = await import('../helpers/models');
  return { anthropic: anthropicMock };
});

const { supportAgent } = await import('../../src/mastra/agents');
// #endregion

// #region test
describe('supportAgent', () => {
  it('Tool を使って顧客情報を取得できる', async () => {
    // 1 回目は Tool 呼び出し、2 回目は回答を返すようにする
    claude.enqueue(
      {
        toolCalls: [
          {
            toolName: 'getCustomerTool',
            input: { customerId: 'test-uuid-123' },
          },
        ],
      },
      { text: '顧客 test-uuid-123 は山田 太郎さん (pro プラン) です' },
    );
    const response = await supportAgent.generate(
      '顧客 ID test-uuid-123 の情報を教えてください'
    );
    expect(response.text).toContain('test-uuid-123');
    expect(response.toolResults).toHaveLength(1);
    const { payload } = response.toolResults[0];
    expect(payload.toolName).toBe('getCustomerTool');
    expect(payload.result).toMatchObject({ name: '山田 太郎' });
  });
});
// #endregion
