// テスト用: LLM を呼ばずに決まった文字列を返すモデル
import { MockLanguageModelV4 } from 'ai/test';
import { simulateReadableStream } from 'ai';

const usage = {
  inputTokens: {
    total: 10, noCache: 10, cacheRead: undefined, cacheWrite: undefined,
  },
  outputTokens: { total: 5, text: 5, reasoning: undefined },
};

export function textModel(text: string, modelId = 'mock') {
  return new MockLanguageModelV4({
    modelId,
    doGenerate: async () => ({
      content: [{ type: 'text', text }],
      finishReason: { unified: 'stop', raw: 'stop' },
      usage,
      warnings: [],
    }),
    doStream: async () => ({
      stream: simulateReadableStream({
        chunks: [
          { type: 'stream-start', warnings: [] },
          { type: 'text-start', id: '1' },
          { type: 'text-delta', id: '1', delta: text },
          { type: 'text-end', id: '1' },
          {
            type: 'finish',
            finishReason: { unified: 'stop', raw: 'stop' },
            usage,
          },
        ],
      }),
    }),
  });
}

export function failingModel(status: number, modelId = 'failing') {
  const fail = async (): Promise<never> => {
    throw Object.assign(new Error(`HTTP ${status}`), { status });
  };
  return new MockLanguageModelV4({
    modelId, doGenerate: fail, doStream: fail,
  });
}
