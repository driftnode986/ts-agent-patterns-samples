import { describe, expect, it, vi } from 'vitest';
import type { Reply } from '../../testing/mock-model';

const replies = vi.hoisted(() => [] as Reply[]);
vi.mock('@ai-sdk/anthropic', async () => {
  const { scriptedModel } = await import('../../testing/mock-model');
  return { anthropic: (id: string) => scriptedModel(replies, id) };
});

describe('POST /api/chat', () => {
  it('streams the model answer as a UI message stream', async () => {
    const { POST } = await import('../src/app/api/chat/route');
    replies.push({ text: 'こんにちは' });
    // useChat が送る形（UIMessage: parts を持つ）
    const body = {
      messages: [
        { id: 'm1', role: 'user', parts: [{ type: 'text', text: 'やあ' }] },
      ],
    };
    const res = await POST(
      new Request('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify(body),
      }),
    );
    expect(res.headers.get('content-type')).toContain('text/event-stream');
    const text = await res.text();
    expect(text).toContain('"type":"text-delta"');
    expect(text).toContain('こんにちは');
  });
});
