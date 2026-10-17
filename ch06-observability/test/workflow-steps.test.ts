// test/workflow-steps.test.ts
import { describe, it, expect } from 'vitest';
import { Mastra } from '@mastra/core';
import { createWorkflow } from '@mastra/core/workflows';
import { SpanType } from '@mastra/core/observability';
import { Observability, TestExporter } from '@mastra/observability';
import { z } from 'zod';
import { costGuard } from '../src/mastra/workflows/steps/cost-guard';
import { searchStep } from '../src/mastra/workflows/steps/search';
import { calculateCost } from '../src/lib/pricing';

const exporter = new TestExporter();

const guardFlow = createWorkflow({
  id: 'guard-flow',
  inputSchema: costGuard.inputSchema,
  outputSchema: z.any(),
}).then(costGuard).commit();

const searchFlow = createWorkflow({
  id: 'search-flow',
  inputSchema: z.object({ query: z.string() }),
  outputSchema: z.object({ results: z.array(z.string()) }),
}).then(searchStep).commit();

const mastra = new Mastra({
  workflows: { guardFlow, searchFlow },
  observability: new Observability({
    configs: { test: { serviceName: 'test', exporters: [exporter] } },
  }),
});

describe('calculateCost', () => {
  it('入力と出力のトークン数から USD を計算する', () => {
    // 100 万入力 × $3 + 10 万出力 × $15 = $3 + $1.5
    expect(calculateCost('claude-sonnet-4-6', 1_000_000, 100_000))
      .toBeCloseTo(4.5);
  });
});

describe('costGuard', () => {
  it('上限内なら withinBudget: true を返す', async () => {
    const run = await mastra.getWorkflow('guardFlow').createRun();
    const result = await run.start({
      inputData: {
        totalInputTokens: 1000,
        totalOutputTokens: 500,
        model: 'claude-sonnet-4-6',
      },
    });
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.result).toEqual({ withinBudget: true });
    }
  });

  it('上限を超えると bail で理由を返して止まる', async () => {
    const run = await mastra.getWorkflow('guardFlow').createRun();
    const result = await run.start({
      inputData: {
        totalInputTokens: 1_000_000,
        totalOutputTokens: 100_000,
        model: 'claude-sonnet-4-6',
      },
    });
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.result).toEqual({
        reason: 'コスト上限超過: $4.50 > $1',
      });
    }
  });
});

describe('searchStep', () => {
  it('DB 検索を database-query の子スパンとして記録する', async () => {
    const run = await mastra.getWorkflow('searchFlow').createRun();
    const result = await run.start({ inputData: { query: 'Workflow' } });
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.result.results).toEqual([
        'Mastra の Workflow は Step をつないで作る',
      ]);
    }
    await exporter.flush();
    const dbSpan = exporter
      .getSpansByType(SpanType.GENERIC)
      .find((s) => s.name === 'database-query');
    expect(dbSpan?.input).toEqual({ query: 'Workflow' });
    expect(dbSpan?.metadata).toMatchObject({ rowCount: 1 });
    const parent = exporter.getBySpanId(dbSpan!.parentSpanId!).span;
    expect(parent?.type).toBe(SpanType.WORKFLOW_STEP);
  });
});
