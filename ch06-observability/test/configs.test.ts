import { describe, it, expect, vi, afterEach } from 'vitest';
import { Mastra } from '@mastra/core';
import { RequestContext } from '@mastra/core/request-context';
import { SpanType } from '@mastra/core/observability';
import {
  Observability,
  SensitiveDataFilter,
  TestExporter,
} from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';
import { OtelExporter } from '@mastra/otel-exporter';
import { mockModel } from './mock-model';
import {
  contextObservability,
  filteredObservability,
  piiSafeObservability,
} from '../src/observability/configs';
import {
  sampledObservability,
  tieredObservability,
} from '../src/observability/sampling';
import {
  otelObservability,
  switchingObservability,
} from '../src/observability/backends';
import { devExporter, prodExporter } from '../src/observability/langfuse-modes';
import { PiiRedactor } from '../src/observability/pii-redactor';

vi.mock('@ai-sdk/anthropic', () => ({
  anthropic: () => mockModel('はい'),
}));
const { supportAgent } = await import('../src/mastra/agents/support-agent');

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

// ルートスパンを1つ作り、記録されるか (サンプリングされたか) を返す
function sampled(obs: Observability, name: string, metadata = {}) {
  return obs.getInstance(name)!.startSpan({
    type: SpanType.AGENT_RUN,
    name: 'probe',
    customSamplerOptions: { metadata },
  }).isValid;
}

describe('Langfuse の Exporter', () => {
  it('開発用と本番用の Exporter を作れる', () => {
    expect(devExporter).toBeInstanceOf(LangfuseExporter);
    expect(prodExporter).toBeInstanceOf(LangfuseExporter);
  });
});

describe('requestContextKeys', () => {
  it('設定に宣言したキーが入っている', () => {
    const config = contextObservability.getInstance('default')!.getConfig();
    expect(config.requestContextKeys)
      .toEqual(['userId', 'tenantId', 'environment']);
  });

  it('requestContext の値がスパンのメタデータに入る', async () => {
    const exporter = new TestExporter();
    const mastra = new Mastra({
      agents: { supportAgent },
      observability: new Observability({
        configs: {
          test: {
            serviceName: 'test',
            requestContextKeys: ['userId', 'tenantId'],
            exporters: [exporter],
          },
        },
      }),
    });
    const requestContext = new RequestContext();
    requestContext.set('userId', 'user-123');
    requestContext.set('tenantId', 'tenant-456');
    await mastra.getAgent('supportAgent')
      .generate('こんにちは', { requestContext });
    await exporter.flush();
    expect(exporter.getRootSpans()[0]?.metadata)
      .toMatchObject({ userId: 'user-123', tenantId: 'tenant-456' });
  });
});

describe('PII フィルタの設定', () => {
  it('SensitiveDataFilter → PiiRedactor の順に並ぶ', () => {
    const [first, second] = piiSafeObservability
      .getInstance('default')!
      .getSpanOutputProcessors();
    expect(first).toBeInstanceOf(SensitiveDataFilter);
    expect(second).toBeInstanceOf(PiiRedactor);
  });

  it('SensitiveDataFilter が API キーを伏せる', () => {
    const [filter] = filteredObservability
      .getInstance('default')!
      .getSpanOutputProcessors();
    const span = filteredObservability.getInstance('default')!.startSpan({
      type: SpanType.GENERIC,
      name: 'probe',
      input: { apiKey: 'sk-secret-123', query: '天気' },
    });
    const out = filter!.process(span);
    expect(out?.input).toEqual({ apiKey: '[REDACTED]', query: '天気' });
  });
});

describe('サンプリング', () => {
  it('ratio: 乱数が 0.1 未満のときだけ記録する', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.05);
    expect(sampled(sampledObservability, 'production')).toBe(true);
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    expect(sampled(sampledObservability, 'production')).toBe(false);
  });

  it('custom: Enterprise は 50%、一般は 1%', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.3);
    const enterprise = { userTier: 'enterprise' };
    expect(sampled(tieredObservability, 'production', enterprise))
      .toBe(true);
    expect(sampled(tieredObservability, 'production', { userTier: 'free' }))
      .toBe(false);
  });

  it('シリアライズの上限が設定される', () => {
    const config = tieredObservability.getInstance('production')!.getConfig();
    expect(config.serializationOptions).toEqual({
      maxStringLength: 256,
      maxDepth: 3,
      maxArrayLength: 10,
      maxObjectKeys: 20,
    });
  });
});

describe('バックエンドと config の切り替え', () => {
  it('OtelExporter を使う設定になっている', () => {
    const [exporter] = otelObservability
      .getInstance('production')!
      .getExporters();
    expect(exporter).toBeInstanceOf(OtelExporter);
  });

  it('configSelector: debug → debug、本番 → langfuse、他 → default', () => {
    const select = (ctx: RequestContext) =>
      switchingObservability.getSelectedInstance({ requestContext: ctx });
    const debug = new RequestContext();
    debug.set('debug', true);
    expect(select(debug)).toBe(switchingObservability.getInstance('debug'));
    expect(select(new RequestContext()))
      .toBe(switchingObservability.getInstance('default'));
    vi.stubEnv('NODE_ENV', 'production');
    expect(select(new RequestContext()))
      .toBe(switchingObservability.getInstance('langfuse'));
  });
});
