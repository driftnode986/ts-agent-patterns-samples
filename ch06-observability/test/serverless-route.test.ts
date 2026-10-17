// test/serverless-route.test.ts
import { describe, it, expect, vi } from 'vitest';
import { mockModel } from './mock-model';

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('受け付けました'),
}));

const { mastra } = await import('../src/mastra');
const { POST } = await import('../src/serverless/route');

describe('POST (サーバーレス)', () => {
  it('応答を返す前にスパンをフラッシュする', async () => {
    const flush = vi.spyOn(mastra.observability, 'flush');
    const res = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: '注文をキャンセルしたい',
      })
    );
    expect(flush).toHaveBeenCalledTimes(1);
    const body = (await res.json()) as { text: string };
    expect(body.text).toBe('受け付けました');
  });
});
