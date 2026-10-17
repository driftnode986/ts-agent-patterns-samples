import { afterEach, describe, expect, it, vi } from 'vitest';
import type { Reply } from '../../testing/mock-model';

const replies = vi.hoisted(() => [] as Reply[]);
vi.mock('@ai-sdk/anthropic', async () => {
  const { scriptedModel } = await import('../../testing/mock-model');
  return { anthropic: (id: string) => scriptedModel(replies, id) };
});

afterEach(() => {
  replies.length = 0;
  vi.unstubAllGlobals();
});

function post(url: string, body: unknown) {
  return new Request(url, { method: 'POST', body: JSON.stringify(body) });
}
const uiMessages = [
  { id: 'm1', role: 'user', parts: [{ type: 'text', text: '東京の天気は?' }] },
];

describe('POST /api/chat (streamText + tool)', () => {
  it('calls the weather tool and streams the final answer', async () => {
    const { POST } = await import('../src/app/api/chat/route');
    replies.push(
      { toolCall: { name: 'weather', input: { city: '東京' } } },
      { text: '東京は晴れです' },
    );
    const res = await POST(post('http://x/api/chat', { messages: uiMessages }));
    const sse = await res.text();
    expect(sse).toContain('"type":"tool-output-available"');
    expect(sse).toContain('"temperature":22');
    expect(sse).toContain('東京は晴れです');
  });
});

describe('POST /api/agent', () => {
  it('pattern B streams the Mastra agent answer in UI message format', async () => {
    const { POST } = await import('../src/app/api/agent/route');
    replies.push({ text: 'ご用件をどうぞ' });
    const res = await POST(post('http://x/api/agent', { messages: uiMessages }));
    const sse = await res.text();
    expect(sse).toContain('"type":"text-delta"');
    expect(sse).toContain('ご用件をどうぞ');
  });

  it('pattern A forwards the message to the Mastra server', async () => {
    const fetchMock = vi.fn(async () => new Response('data: ok\n\n'));
    vi.stubGlobal('fetch', fetchMock);
    const { POST } = await import('../src/patterns/agent-route-a');
    const res = await POST(post('http://x/api/agent', { message: 'こんにちは' }));
    expect(await res.text()).toBe('data: ok\n\n');
    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe('http://localhost:4111/api/agents/customerSupport/stream');
    expect(JSON.parse(String(init.body))).toEqual({
      messages: [{ role: 'user', content: 'こんにちは' }],
    });
  });
});
