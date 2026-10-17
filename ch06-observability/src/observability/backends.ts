// src/observability/backends.ts
// #region imports
import {
  Observability,
  MastraStorageExporter,
} from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';
import { OtelExporter } from '@mastra/otel-exporter';
// #endregion

// OTel 互換バックエンドへ送る (6.11)
// #region otel-exporter
export const otelObservability = new Observability({
  configs: {
    production: {
      serviceName: 'my-app',
      exporters: [
        new OtelExporter({
          provider: {
            custom: {
              endpoint: 'http://localhost:4318/v1/traces',
              protocol: 'http/protobuf',
            },
          },
        }),
      ],
    },
  },
});
// #endregion

// 環境やリクエストに応じて config を切り替える (6.11)
// #region config-selector
export const switchingObservability = new Observability({
  configs: {
    default: {
      serviceName: 'my-app',
      exporters: [new MastraStorageExporter()], // 開発用
    },
    langfuse: {
      serviceName: 'my-app',
      exporters: [new LangfuseExporter()], // 本番
    },
    debug: {
      serviceName: 'my-app',
      exporters: [new LangfuseExporter({ realtime: true })], // デバッグ
    },
  },
  configSelector: (context, availableConfigs) => {
    if (context.requestContext?.get('debug')) return 'debug';
    return process.env.NODE_ENV === 'production'
      ? 'langfuse'
      : 'default';
  },
});
// #endregion
