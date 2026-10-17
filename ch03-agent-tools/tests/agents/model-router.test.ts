import { describe, expect, it } from 'vitest';
import { selectModel } from '../../src/lib/model-router';
import {
  agentClaude,
  agentGemini,
  agentGpt,
} from '../../src/mastra/agents/provider-agents';
import {
  routerClaude,
  routerGemini,
  routerGpt,
} from '../../src/mastra/agents/router-agents';

// ここでは LLM を呼ばない。モデルの選び方だけを確かめる
describe('selectModel (3.10)', () => {
  it('入力トークン数でモデルを振り分ける', () => {
    expect(selectModel(999).modelId).toBe('claude-haiku-4-5');
    expect(selectModel(1000).modelId).toBe('claude-sonnet-4-6');
    expect(selectModel(9999).modelId).toBe('claude-sonnet-4-6');
    expect(selectModel(10000).modelId).toBe('claude-opus-4-7');
  });
});

describe('AI SDK のプロバイダ関数 (3.8)', () => {
  it('model の指定だけでプロバイダが切り替わる', async () => {
    const models = await Promise.all(
      [agentClaude, agentGpt, agentGemini].map((a) => a.getModel()),
    );
    expect(models.map((m) => m.modelId)).toEqual([
      'claude-sonnet-4-6',
      'gpt-4o',
      'gemini-2.5-flash',
    ]);
    expect(models.map((m) => m.provider.split('.')[0])).toEqual([
      'anthropic',
      'openai',
      'google',
    ]);
  });
});

describe('Model Router の文字列指定 (3.8)', () => {
  it('provider/model の文字列から各プロバイダのモデルになる', async () => {
    const models = await Promise.all(
      [routerClaude, routerGpt, routerGemini].map((a) => a.getModel()),
    );
    expect(models.map((m) => [m.provider, m.modelId])).toEqual([
      ['anthropic', 'claude-sonnet-4-6'],
      ['openai', 'gpt-4o'],
      ['google', 'gemini-2.5-flash'],
    ]);
  });
});
