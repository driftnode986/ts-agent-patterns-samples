// 6.4 時点の src/mastra/index.ts (6.11 で置き換える)
// #region index-step2
// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { Observability } from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';

export const mastra = new Mastra({
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'my-agent-app',
        exporters: [
          new LangfuseExporter({
            publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
            secretKey: process.env.LANGFUSE_SECRET_KEY!,
            baseUrl: process.env.LANGFUSE_BASE_URL,
            environment: process.env.NODE_ENV,
            release: process.env.GIT_COMMIT,
          }),
        ],
      },
    },
  }),
});
// #endregion
