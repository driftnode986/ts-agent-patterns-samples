// テスト用の偽の LLM。呼ばれるたびに reply() の文字列を返す（LLM には通信しない）
import { MockLanguageModelV4, convertArrayToReadableStream } from 'ai/test';
import type { LanguageModelV4Usage } from '@ai-sdk/provider';

const usage: LanguageModelV4Usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

export function textModel(reply: () => string) {
  return new MockLanguageModelV4({
    modelId: 'mock-model',
    doGenerate: async () => ({
      content: [{ type: 'text', text: reply() }],
      finishReason: { unified: 'stop', raw: undefined },
      usage,
      warnings: [],
    }),
    doStream: async () => ({
      stream: convertArrayToReadableStream([
        { type: 'stream-start', warnings: [] },
        { type: 'text-start', id: 't1' },
        { type: 'text-delta', id: 't1', delta: reply() },
        { type: 'text-end', id: 't1' },
        { type: 'finish', usage, finishReason: { unified: 'stop', raw: undefined } },
      ]),
    }),
  });
}
