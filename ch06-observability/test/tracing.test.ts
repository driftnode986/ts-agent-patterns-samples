import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Mastra } from '@mastra/core';
import { SpanType } from '@mastra/core/observability';
import { Observability, TestExporter } from '@mastra/observability';
import { mockModel } from './mock-model';

// supportAgent の anthropic() を偽物のモデルに差し替える
vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('ご注文は発送済みです。'),
}));

const { supportAgent } = await import('../src/mastra/agents/support-agent');
const { askOrderStatus, askWithoutRecording } = await import(
  '../src/examples/tracing-options'
);

let exporter: TestExporter;

beforeEach(() => {
  // スパンを外部に送らず、メモリ上に集める
  exporter = new TestExporter();
  new Mastra({
    agents: { supportAgent },
    observability: new Observability({
      configs: { test: { serviceName: 'test', exporters: [exporter] } },
    }),
  });
});

describe('Agent のトレース', () => {
  it('AGENT_RUN と MODEL_GENERATION のスパンが記録される', async () => {
    const result = await askOrderStatus();
    expect(result.text).toBe('ご注文は発送済みです。');
    await exporter.flush();
    const runs = exporter.getSpansByType(SpanType.AGENT_RUN);
    expect(runs).toHaveLength(1);
    expect(exporter.getSpansByType(SpanType.MODEL_GENERATION).length)
      .toBeGreaterThan(0);
  });

  it('tags と metadata がルートスパンに付く', async () => {
    await askOrderStatus();
    const [root] = exporter.getRootSpans();
    expect(JSON.stringify(root?.input)).toContain('注文状況');
    expect(root?.tags).toEqual(['production', 'customer-support']);
    expect(root?.metadata).toMatchObject({
      userId: 'user-123',
      tenantId: 'tenant-456',
      experimentId: 'prompt-v3',
    });
  });

  it('hideInput / hideOutput で入力と出力が記録されない', async () => {
    await askWithoutRecording();
    const spans = exporter.getAllSpans();
    expect(spans.length).toBeGreaterThan(0);
    for (const span of spans) {
      expect(JSON.stringify(span.input ?? '')).not.toContain('クレジット');
      expect(JSON.stringify(span.output ?? '')).not.toContain('発送済み');
    }
  });
});
