// tests/agents/support.test.ts
import { describe, it, expect } from 'vitest';
import { supportAgent } from '../../src/mastra/agents';

describe('supportAgent', () => {
  it('Tool を使って顧客情報を取得できる', async () => {
    const response = await supportAgent.generate(
      '顧客 ID test-uuid-123 の情報を教えてください'
    );
    expect(response.text).toContain('test-uuid-123');
    expect(response.toolResults).toHaveLength(1);
    expect(response.toolResults[0].toolName).toBe('get-customer');
  });
});
