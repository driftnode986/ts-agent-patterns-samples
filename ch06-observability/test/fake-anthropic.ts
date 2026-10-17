// Anthropic Messages API (ストリーミング) の偽物。fetch を差し替えて使う
export function fakeAnthropicFetch(
  reply: (body: Record<string, unknown>) => string
) {
  const calls: Record<string, unknown>[] = [];
  const fetch = async (_input: string | URL | Request, init?: RequestInit) => {
    const body = JSON.parse(String(init?.body));
    calls.push(body);
    const events = [
      ['message_start', { type: 'message_start', message: {
        id: 'msg_test', type: 'message', role: 'assistant',
        model: body.model, content: [], stop_reason: null,
        usage: { input_tokens: 10, output_tokens: 0 },
      } }],
      ['content_block_start', { type: 'content_block_start', index: 0,
        content_block: { type: 'text', text: '' } }],
      ['content_block_delta', { type: 'content_block_delta', index: 0,
        delta: { type: 'text_delta', text: reply(body) } }],
      ['content_block_stop', { type: 'content_block_stop', index: 0 }],
      ['message_delta', { type: 'message_delta',
        delta: { stop_reason: 'end_turn' }, usage: { output_tokens: 5 } }],
      ['message_stop', { type: 'message_stop' }],
    ] as const;
    const sse = events
      .map(([event, data]) => `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
      .join('');
    return new Response(sse, {
      headers: { 'content-type': 'text/event-stream' },
    });
  };
  return { fetch, calls };
}
