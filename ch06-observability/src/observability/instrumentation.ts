// src/observability/instrumentation.ts (アプリ起動前に実行)
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  getNodeAutoInstrumentations,
} from '@opentelemetry/auto-instrumentations-node';
import {
  OTLPTraceExporter,
} from '@opentelemetry/exporter-trace-otlp-proto';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';

const sdk = new NodeSDK({
  serviceName: 'my-service',
  spanProcessors: [
    new BatchSpanProcessor(
      new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT
          || 'http://localhost:4318/v1/traces',
      })
    ),
  ],
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();
