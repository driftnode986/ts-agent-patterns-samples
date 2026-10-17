// src/observability/sampling.ts
import {
  Observability,
  SamplingStrategyType,
} from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';

// 本番は 10% だけ記録する (6.10)
// #region sampling-ratio
export const sampledObservability = new Observability({
  configs: {
    production: {
      serviceName: 'my-app',
      sampling: { type: SamplingStrategyType.RATIO, probability: 0.1 },
      exporters: [new LangfuseExporter({ /* keys */ })],
    },
  },
});
// #endregion

// ユーザーのティアでサンプリング率を変え、データサイズも抑える
export const tieredObservability = new Observability({
  configs: {
    production: {
      serviceName: 'my-app',
      // #region sampling-custom
      sampling: {
        type: SamplingStrategyType.CUSTOM,
        sampler: (options) => {
          // Enterprise ユーザーは 50% サンプリング
          if (options?.metadata?.userTier === 'enterprise') {
            return Math.random() < 0.5;
          }
          // 一般ユーザーは 1% サンプリング
          return Math.random() < 0.01;
        },
      },
      // #endregion
      // #region serialization
      // 本番推奨 (データサイズ削減)
      serializationOptions: {
        maxStringLength: 256,
        maxDepth: 3,
        maxArrayLength: 10,
        maxObjectKeys: 20,
      },
      // #endregion
      exporters: [new LangfuseExporter({ /* keys */ })],
    },
  },
});
