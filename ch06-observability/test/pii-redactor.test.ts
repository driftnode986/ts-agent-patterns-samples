// test/pii-redactor.test.ts
import { describe, it, expect, vi } from 'vitest';
import { Mastra } from '@mastra/core';
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { SpanType } from '@mastra/core/observability';
import {
  Observability,
  SensitiveDataFilter,
  TestExporter,
} from '@mastra/observability';
import { z } from 'zod';
import { PiiRedactor } from '../src/observability/pii-redactor';
import { mockModel } from './mock-model';

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('taro@example.com 宛に送りました。'),
}));
const { supportAgent } = await import('../src/mastra/agents/support-agent');

function setup() {
  const exporter = new TestExporter();
  const mastra = new Mastra({
    agents: { supportAgent },
    observability: new Observability({
      configs: {
        test: {
          serviceName: 'test',
          spanOutputProcessors: [
            new SensitiveDataFilter(),
            new PiiRedactor(),
          ],
          exporters: [exporter],
        },
      },
    }),
  });
  return { exporter, mastra };
}

describe('PiiRedactor', () => {
  it('文字列の入出力からメール・電話・カード番号を伏せる', async () => {
    const echo = createStep({
      id: 'echo',
      inputSchema: z.object({ text: z.string() }),
      outputSchema: z.object({ text: z.string() }),
      execute: async ({ inputData, tracingContext }) => {
        const span = tracingContext?.currentSpan?.createChildSpan({
          type: SpanType.GENERIC,
          name: 'raw-text',
          input: inputData.text,
        });
        span?.end({ output: inputData.text });
        return inputData;
      },
    });
    const flow = createWorkflow({
      id: 'echo-flow',
      inputSchema: z.object({ text: z.string() }),
      outputSchema: z.object({ text: z.string() }),
    }).then(echo).commit();
    const { exporter, mastra } = setup();
    mastra.addWorkflow(flow, 'echoFlow');

    const text =
      'taro@example.com / 090-1234-5678 / 4111-1111-1111-1111';
    const run = await mastra.getWorkflow('echoFlow').createRun();
    await run.start({ inputData: { text } });
    await exporter.flush();

    const span = exporter
      .getSpansByType(SpanType.GENERIC)
      .find((s) => s.name === 'raw-text');
    expect(span?.input).toBe('[EMAIL] / [PHONE] / [CARD]');
    expect(span?.output).toBe('[EMAIL] / [PHONE] / [CARD]');
  });

  it('Agent のスパンの入出力にもメールアドレスが残らない', async () => {
    const { exporter, mastra } = setup();
    await mastra
      .getAgent('supportAgent')
      .generate('hanako@example.com の注文を調べて');
    await exporter.flush();
    const dump = JSON.stringify(
      exporter.getAllSpans().map((s) => [s.input, s.output])
    );
    expect(dump).not.toContain('hanako@example.com');
    expect(dump).not.toContain('taro@example.com');
  });
});
