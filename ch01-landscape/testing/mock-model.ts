// テスト用の偽の LLM。返す内容を replies に順に積んでおくと、呼ばれるたびに先頭から1件ずつ返す
import { MockLanguageModelV4, convertArrayToReadableStream } from 'ai/test';
import type {
  LanguageModelV4Content,
  LanguageModelV4StreamPart,
  LanguageModelV4Usage,
} from '@ai-sdk/provider';

export type Reply =
  | { text: string }
  | { toolCall: { name: string; input: unknown } };

const usage: LanguageModelV4Usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

function content(reply: Reply): LanguageModelV4Content[] {
  if ('text' in reply) return [{ type: 'text', text: reply.text }];
  return [
    {
      type: 'tool-call',
      toolCallId: 'call-1',
      toolName: reply.toolCall.name,
      input: JSON.stringify(reply.toolCall.input),
    },
  ];
}

function parts(reply: Reply): LanguageModelV4StreamPart[] {
  const finishReason = {
    unified: 'text' in reply ? ('stop' as const) : ('tool-calls' as const),
    raw: undefined,
  };
  const body: LanguageModelV4StreamPart[] =
    'text' in reply
      ? [
          { type: 'text-start', id: 't1' },
          { type: 'text-delta', id: 't1', delta: reply.text },
          { type: 'text-end', id: 't1' },
        ]
      : (content(reply) as LanguageModelV4StreamPart[]);
  return [
    { type: 'stream-start', warnings: [] },
    ...body,
    { type: 'finish', usage, finishReason },
  ];
}

/** replies を先頭から消費する偽モデル。足りなくなったらエラーにする */
export function scriptedModel(replies: Reply[], modelId = 'mock-model') {
  const next = () => {
    const reply = replies.shift();
    if (!reply) throw new Error('scriptedModel: no more replies');
    return reply;
  };
  return new MockLanguageModelV4({
    modelId,
    doGenerate: async () => {
      const reply = next();
      return {
        content: content(reply),
        finishReason: {
          unified: 'text' in reply ? 'stop' : 'tool-calls',
          raw: undefined,
        },
        usage,
        warnings: [],
      };
    },
    doStream: async () => ({
      stream: convertArrayToReadableStream(parts(next())),
    }),
  });
}
