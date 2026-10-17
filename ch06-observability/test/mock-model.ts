// test/mock-model.ts
// LLM を呼ばずに、決まった文字列を返すモデル
import { MockLanguageModelV4 } from 'ai/test';
import { simulateReadableStream } from 'ai';

const usage = {
  inputTokens: { total: 12, noCache: 12, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 8, text: 8, reasoning: 0 },
};
const finishReason = { unified: 'stop' as const, raw: 'end_turn' };

export function mockModel(text: string) {
  return new MockLanguageModelV4({
    provider: 'anthropic',
    modelId: 'claude-sonnet-4-6',
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
      finishReason,
      usage,
      warnings: [],
    }),
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'stream-start', warnings: [] },
          { type: 'text-start', id: 't1' },
          { type: 'text-delta', id: 't1', delta: text },
          { type: 'text-end', id: 't1' },
          { type: 'finish', finishReason, usage },
        ],
      }),
    }),
  });
}
