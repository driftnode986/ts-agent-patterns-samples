// test/otel-bridge.test.ts
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { afterAll, describe, it, expect, vi } from 'vitest';
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

// Langfuse の偽物。受け取ったリクエストのパスを残すだけ
const langfuseRequests: string[] = [];
const langfuse = createServer((req, res) => {
  langfuseRequests.push(`${req.method} ${req.url}`);
  req.resume();
  req.on('end', () => res.writeHead(200).end('{}'));
});
await new Promise<void>((resolve) => langfuse.listen(0, '127.0.0.1', resolve));
const { port } = langfuse.address() as AddressInfo;
vi.stubEnv('LANGFUSE_PUBLIC_KEY', 'pk-lf-test');
vi.stubEnv('LANGFUSE_SECRET_KEY', 'sk-lf-test');
vi.stubEnv('LANGFUSE_BASE_URL', `http://127.0.0.1:${port}`);

const { mastra } = await import('../src/mastra');

afterAll(() => {
  langfuse.close();
});

describe('OtelBridge と LangfuseExporter の併用 (6.11)', () => {
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

  it('同じスパンが Langfuse にも送られる', async () => {
    await mastra.getAgent('supportAgent').generate('こんにちは');
    await mastra.observability.flush();
    expect(langfuseRequests).toContainEqual(
      expect.stringMatching(/^POST \/api\/public\/otel/)
    );
  });
});
