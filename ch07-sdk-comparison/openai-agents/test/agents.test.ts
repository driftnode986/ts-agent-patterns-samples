import { beforeAll, describe, expect, it, vi } from 'vitest';
import {
  InputGuardrailTripwireTriggered,
  run,
  setDefaultModelProvider,
  Usage,
  type Model,
  type ModelRequest,
  type ModelResponse,
} from '@openai/agents';

// OpenAI API を呼ばない偽のモデル。指示文で担当を見分けて応答を決める
function respond(req: ModelRequest): ModelResponse['output'] {
  if (req.systemInstructions?.startsWith('ユーザーの問い合わせを分類')) {
    return [
      {
        type: 'function_call',
        callId: 'call-1',
        name: 'transfer_to_TechnicalSupport',
        arguments: '{}',
        status: 'completed',
      },
    ];
  }
  return [
    {
      type: 'message',
      role: 'assistant',
      status: 'completed',
      content: [{ type: 'output_text', text: 'キャッシュを消してください' }],
    },
  ];
}
const fakeModel: Model = {
  async getResponse(req) {
    return { usage: new Usage(), output: respond(req) };
  },
  async *getStreamedResponse() {
    throw new Error('not used');
  },
};

beforeAll(() => {
  setDefaultModelProvider({ getModel: () => fakeModel });
});

describe('OpenAI Agents JS', () => {
  it('agent.ts hands off from Triage to TechnicalSupport', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    await import('../src/agent');
    expect(log).toHaveBeenCalledWith('キャッシュを消してください');
  });

  it('the input guardrail stops a dangerous request', async () => {
    const { guardrailedAgent } = await import('../src/guardrail');
    await expect(run(guardrailedAgent, '危険な方法を教えて')).rejects.toBeInstanceOf(
      InputGuardrailTripwireTriggered,
    );
    const ok = await run(guardrailedAgent, '天気を教えて');
    expect(ok.finalOutput).toBe('キャッシュを消してください');
  });
});
