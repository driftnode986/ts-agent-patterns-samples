// tests/tools/customer.test.ts
import { describe, it, expect } from 'vitest';
import { noopObserve } from '@mastra/core/tools';
import { getCustomerTool } from '../../src/mastra/tools/customer';

// execute の第2引数 (実行コンテキスト)。単体テストでは最小限を渡す
const context = { observe: noopObserve };

describe('getCustomerTool', () => {
  it('存在する顧客の情報を返す', async () => {
    const result = await getCustomerTool.execute?.(
      { customerId: 'test-uuid-123' },
      context,
    );
    expect(result).toMatchObject({
      name: expect.any(String),
      plan: expect.stringMatching(/^(free|pro|enterprise)$/),
    });
  });

  it('存在しない顧客でエラーを返す', async () => {
    await expect(
      getCustomerTool.execute?.({ customerId: 'nonexistent' }, context)
    ).rejects.toThrow('存在しません');
  });
});
