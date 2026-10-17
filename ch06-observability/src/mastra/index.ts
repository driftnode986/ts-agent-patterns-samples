// src/mastra/index.ts
import { Mastra } from '@mastra/core';
import { Observability } from '@mastra/observability';
import { OtelBridge } from '@mastra/otel-bridge';
import { supportAgent } from './agents/support-agent';

// #region otel-bridge
export const mastra = new Mastra({
  agents: { supportAgent },
  observability: new Observability({
    configs: {
      default: {
        serviceName: 'my-service',
        bridge: new OtelBridge(),
      },
    },
  }),
});
// #endregion
