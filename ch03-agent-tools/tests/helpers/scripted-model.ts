// テスト用の LLM。あらかじめ並べた応答を順に返す (API は呼ばない)
import { MockLanguageModelV4 } from 'ai/test';

type GenerateResult = Awaited<ReturnType<MockLanguageModelV4['doGenerate']>>;
type StreamResult = Awaited<ReturnType<MockLanguageModelV4['doStream']>>;
type StreamPart =
  StreamResult['stream'] extends ReadableStream<infer P> ? P : never;

export type Step =
  | { text: string }
  | { toolCalls: { toolName: string; input: unknown }[] }
  | { error: Error };

const usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

let callSeq = 0;

function toContent(step: Exclude<Step, { error: Error }>) {
  if ('text' in step) return [{ type: 'text' as const, text: step.text }];
  return step.toolCalls.map((call) => ({
    type: 'tool-call' as const,
    toolCallId: `call-${++callSeq}`,
    toolName: call.toolName,
    input: JSON.stringify(call.input),
  }));
}

function finishReason(step: Exclude<Step, { error: Error }>) {
  const unified = 'text' in step ? ('stop' as const) : ('tool-calls' as const);
  return { unified, raw: undefined };
}

export function createScriptedModel(modelId = 'mock-model') {
  const queue: Step[] = [];
  const next = () => {
    const step = queue.shift();
    if (!step) throw new Error(`${modelId}: 用意した応答がもうありません`);
    if ('error' in step) throw step.error;
    return step;
  };
  const model = new MockLanguageModelV4({
    modelId,
    doGenerate: async (): Promise<GenerateResult> => {
      const step = next();
      return {
        content: toContent(step),
        finishReason: finishReason(step),
        usage,
        warnings: [],
      };
    },
    doStream: async (): Promise<StreamResult> => {
      const step = next();
      const parts: StreamPart[] = [{ type: 'stream-start', warnings: [] }];
      for (const c of toContent(step)) {
        if (c.type === 'text') {
          parts.push({ type: 'text-start', id: 't1' });
          parts.push({ type: 'text-delta', id: 't1', delta: c.text });
          parts.push({ type: 'text-end', id: 't1' });
        } else {
          parts.push(c);
        }
      }
      parts.push({ type: 'finish', usage, finishReason: finishReason(step) });
      const stream = new ReadableStream<StreamPart>({
        start(controller) {
          for (const p of parts) controller.enqueue(p);
          controller.close();
        },
      });
      return { stream };
    },
  });
  return {
    model,
    enqueue: (...steps: Step[]) => queue.push(...steps),
    reset: () => {
      queue.length = 0;
      model.doGenerateCalls.length = 0;
      model.doStreamCalls.length = 0;
    },
    remaining: () => queue.length,
  };
}
