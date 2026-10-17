import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Reply } from './mock-model';

// Anthropic の代わりに偽モデルを返す。replies に積んだ順に応答する
const replies = vi.hoisted(() => [] as Reply[]);
vi.mock('@ai-sdk/anthropic', async () => {
  const { scriptedModel } = await import('./mock-model');
  return { anthropic: (id: string) => scriptedModel(replies, id) };
});

beforeEach(() => {
  replies.length = 0;
  vi.resetModules();
});
afterEach(() => vi.restoreAllMocks());

describe('agents', () => {
  it('supportAgent answers with the model text', async () => {
    const { supportAgent } = await import('../src/mastra/agents');
    replies.push({ text: '再起動してください。' });
    const res = await supportAgent.generate('ログインできません');
    expect(res.text).toBe('再起動してください。');
  });

  it('weatherAgent calls get-weather and then answers', async () => {
    const { weatherAgent } = await import('../src/mastra/agents');
    replies.push(
      { toolCall: { name: 'weatherTool', input: { city: '東京' } } },
      { text: '東京は晴れ、22度です。' },
    );
    const res = await weatherAgent.generate('東京の天気は?');
    expect(res.toolResults[0]?.payload.result).toEqual({
      temperature: 22,
      condition: '晴れ',
    });
    expect(res.text).toBe('東京は晴れ、22度です。');
  });

  it('weatherAgent instructions name the tool by its key', async () => {
    const { weatherAgent } = await import('../src/mastra/agents');
    // LLM に見える Tool 名は tools のキー (id の get-weather ではない)
    const keys = Object.keys(await weatherAgent.listTools());
    expect(keys).toEqual(['weatherTool']);
    const instructions = String(await weatherAgent.getInstructions());
    expect(instructions).toContain('weatherTool');
    expect(instructions).not.toContain('get-weather');
  });
});

describe('mastra instance', () => {
  it('registers both agents (step1 and final)', async () => {
    const step1 = await import('../src/steps/mastra-index.step1');
    const { mastra } = await import('../src/mastra');
    for (const m of [step1.mastra, mastra]) {
      expect(m.getAgent('supportAgent').id).toBe('support-agent');
      expect(m.getAgent('weatherAgent').id).toBe('weather-agent');
    }
    expect(mastra.getStorage()).toBeDefined();
  });
});

describe('scripts', () => {
  it('generate prints the whole answer', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    replies.push({ text: '晴れです' });
    await import('../src/scripts/generate');
    expect(log).toHaveBeenCalledWith('晴れです');
  });

  it('stream writes the answer chunk by chunk', async () => {
    const write = vi
      .spyOn(process.stdout, 'write')
      .mockImplementation(() => true);
    replies.push({ text: '晴れです' });
    await import('../src/scripts/stream');
    const written = write.mock.calls.map((c) => String(c[0])).join('');
    expect(written).toContain('晴れです');
  });

  it('structured output returns the parsed schedule', async () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    const plan = [{ time: '09:00', task: '朝会' }];
    // 配列のスキーマは { elements: [...] } に包んでモデルに要求される
    replies.push({ text: JSON.stringify({ elements: plan }) });
    await import('../src/scripts/structured-output');
    expect(log).toHaveBeenCalledWith(plan);
  });
});

describe('models', () => {
  it('builds models for the three providers', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test');
    vi.stubEnv('GOOGLE_GENERATIVE_AI_API_KEY', 'test');
    const m = await import('../src/mastra/models');
    expect(m.gptModel.modelId).toBe('gpt-4o');
    expect(m.geminiModel.modelId).toBe('gemini-2.5-flash');
    expect(m.claudeModel.modelId).toBe('claude-sonnet-4-6');
  });
});
