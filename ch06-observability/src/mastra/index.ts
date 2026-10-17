// src/mastra/index.ts
import { Observability } from '@mastra/observability';
import { OtelBridge } from '@mastra/otel-bridge';

new Observability({
  configs: {
    default: {
      serviceName: 'my-service',
      bridge: new OtelBridge(),
    },
  },
});
