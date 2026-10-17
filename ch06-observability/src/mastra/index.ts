import { Mastra } from '@mastra/core';
import { LangfuseExporter } from '@mastra/langfuse';
import { Observability } from '@mastra/observability';
import { OtelBridge } from '@mastra/otel-bridge';
import { supportAgent } from './agents/support-agent';

export const mastra = new Mastra({
  agents: { supportAgent },
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'my-service',
        // OTel のトレースに Mastra のスパンを入れる
        bridge: new OtelBridge(),
        // 6.4 の Langfuse への送信も続ける
        exporters: [new LangfuseExporter()],
      },
    },
  }),
});
