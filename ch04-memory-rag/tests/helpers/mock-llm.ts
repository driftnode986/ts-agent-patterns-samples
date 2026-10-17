// Agent が使う LLM の偽物。テストごとに返す内容（テキストかツール呼び出し）を並べて渡す。
// 本章のコードは Agent.generate() だけを使うので doGenerate を用意する。
import { MockLanguageModelV4 } from 'ai/test';

export type Turn =
  | { text: string }
  | { tool: string; input: Record<string, unknown> };

type GenerateResult = Awaited<ReturnType<MockLanguageModelV4['doGenerate']>>;
type CallOptions = MockLanguageModelV4['doGenerateCalls'][number];

let turns: Turn[] = [{ text: 'OK' }];
let index = 0;
/** 呼び出しごとに LLM へ渡されたオプション（prompt・tools など） */
export const calls: CallOptions[] = [];

export function setTurns(next: Turn[]) {
  turns = next;
  index = 0;
  calls.length = 0;
}

const usage = {
  inputTokens: { total: 10, noCache: 10, cacheRead: 0, cacheWrite: 0 },
  outputTokens: { total: 5, text: 5, reasoning: 0 },
};

function nextResult(options: CallOptions): GenerateResult {
  calls.push(options);
  const turn = turns[Math.min(index, turns.length - 1)];
  index++;
  if ('tool' in turn) {
    return {
      content: [{
        type: 'tool-call',
        toolCallId: `call-${index}`,
        toolName: turn.tool,
        input: JSON.stringify(turn.input),
      }],
      finishReason: { unified: 'tool-calls', raw: 'tool_use' },
      usage,
      warnings: [],
    };
  }
  return {
    content: [{ type: 'text', text: turn.text }],
    finishReason: { unified: 'stop', raw: 'end_turn' },
    usage,
    warnings: [],
  };
}

export const model = new MockLanguageModelV4({
  doGenerate: async (options) => nextResult(options),
});

/** n 回目（0始まり）の呼び出しで LLM に渡されたプロンプトを文字列にする */
export function promptText(n: number): string {
  return JSON.stringify(calls[n]?.prompt ?? []);
}
