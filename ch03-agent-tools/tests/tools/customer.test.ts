// tests/tools/customer.test.ts
import { describe, it, expect } from 'vitest';
import { getCustomerTool } from '../../src/mastra/tools/customer';

describe('getCustomerTool', () => {
  it('存在する顧客の情報を返す', async () => {
    const result = await getCustomerTool.execute({
      customerId: 'test-uuid-123',
    });
    expect(result.name).toBeDefined();
    expect(result.plan).toMatch(/^(free|pro|enterprise)$/);
  });

  it('存在しない顧客でエラーを返す', async () => {
    await expect(
      getCustomerTool.execute({ customerId: 'nonexistent' })
    ).rejects.toThrow('存在しません');
  });
});
