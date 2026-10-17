// test/otel-bridge.test.ts
import { describe, it, expect, vi } from 'vitest';
import { trace } from '@opentelemetry/api';
import {
  BasicTracerProvider,
  InMemorySpanExporter,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { mockModel } from './mock-model';

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('こんにちは'),
}));

// instrumentation.ts の代わりに、OTel のスパンをメモリ上に集める
const otelSpans = new InMemorySpanExporter();
trace.setGlobalTracerProvider(
  new BasicTracerProvider({
    spanProcessors: [new SimpleSpanProcessor(otelSpans)],
  })
);

const { mastra } = await import('../src/mastra');

describe('OtelBridge', () => {
  it('Mastra のスパンが OTel のスパンとして書き出される', async () => {
    const result = await mastra.getAgent('supportAgent').generate('やあ');
    expect(result.text).toBe('こんにちは');
    await mastra.observability.flush();

    const spans = otelSpans.getFinishedSpans();
    expect(spans.length).toBeGreaterThan(0);
    // すべて同じトレースに入る
    const traceIds = new Set(spans.map((s) => s.spanContext().traceId));
    expect(traceIds.size).toBe(1);
    const names = spans.map((s) => s.name).join(' ');
    expect(names).toContain('support-agent');
  });
});
