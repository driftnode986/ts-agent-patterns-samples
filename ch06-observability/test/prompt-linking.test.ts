import { describe, it, expect, vi } from 'vitest';
import { Mastra } from '@mastra/core';
import { Observability, TestExporter } from '@mastra/observability';
import { mockModel } from './mock-model';

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('承知しました'),
}));

// Langfuse のプロンプト API の偽物。外部には送らない
const requests: string[] = [];
vi.stubGlobal('fetch', async (input: string | URL | Request) => {
  const url = String(input instanceof Request ? input.url : input);
  requests.push(url);
  return Response.json({
    id: 'prompt-1',
    name: 'customer-support',
    version: 3,
    type: 'text',
    prompt: 'あなたは丁寧なサポート担当です。',
    config: {},
    labels: ['production'],
    tags: [],
  });
});
vi.stubEnv('LANGFUSE_PUBLIC_KEY', 'pk-lf-test');
vi.stubEnv('LANGFUSE_SECRET_KEY', 'sk-lf-test');

const { promptLinkedAgent } = await import(
  '../src/mastra/agents/prompt-linked-agent'
);

describe('Langfuse Prompt Linking', () => {
  it('Langfuse のプロンプトを instructions に使う', async () => {
    expect(requests[0]).toContain('/api/public/v2/prompts/customer-support');
    expect(await promptLinkedAgent.getInstructions())
      .toBe('あなたは丁寧なサポート担当です。');
  });

  it('プロンプトの名前と版をトレースに残す', async () => {
    const exporter = new TestExporter();
    new Mastra({
      agents: { promptLinkedAgent },
      observability: new Observability({
        configs: { test: { serviceName: 'test', exporters: [exporter] } },
      }),
    });
    await promptLinkedAgent.generate('返品したい');
    await exporter.flush();
    const generation = exporter
      .getAllSpans()
      .find((s) => s.type === 'model_generation');
    expect(JSON.stringify(generation?.metadata)).toContain('customer-support');
    expect(generation?.metadata).toMatchObject({
      langfuse: { prompt: { name: 'customer-support', version: 3 } },
    });
  });
});
