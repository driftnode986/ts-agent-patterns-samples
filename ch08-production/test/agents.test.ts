import { describe, expect, it, vi } from 'vitest';
import { failingModel, textModel } from './mock-model';

// 本物のプロバイダーの代わりに、テスト用のモデルを返す
const calls = vi.hoisted(() => ({ anthropic: 0, openai: 0 }));
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: (id: string) => {
    calls.anthropic++;
    return failingModel(503, id);
  },
}));
vi.mock('@ai-sdk/openai', () => ({
  openai: (id: string) => {
    calls.openai++;
    return textModel('GPT-4o からの回答です', id);
  },
}));

describe('resilientAgent', () => {
  it('Claude が 503 を返すと、GPT-4o にフォールバックする', async () => {
    const { resilientAgent } = await import(
      '../src/mastra/agents/resilient-agent'
    );
    const result = await resilientAgent.generate('注文状況を教えてください', {
      // テストを速くするため、モデルごとのリトライを 0 回にする
      modelSettings: { maxRetries: 0 },
    });
    expect(result.text).toBe('GPT-4o からの回答です');
  });
});

describe('supportAgent（Blue-Green）', () => {
  it('AGENT_VERSION=green なら新しい instructions を使う', async () => {
    vi.resetModules();
    vi.stubEnv('AGENT_VERSION', 'green');
    const { supportAgent } = await import('../src/mastra/agents');
    expect(await supportAgent.getInstructions()).toContain('3文以内');
    vi.unstubAllEnvs();
  });

  it('未設定なら blue（従来の instructions）', async () => {
    vi.resetModules();
    const { supportAgent } = await import('../src/mastra/agents');
    expect(await supportAgent.getInstructions()).toContain('挨拶から');
  });
});
