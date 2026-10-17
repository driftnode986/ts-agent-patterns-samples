// #region imports
import {
  Observability,
  SensitiveDataFilter,
} from '@mastra/observability';
import { LangfuseExporter } from '@mastra/langfuse';
import { PiiRedactor } from './pii-redactor';
// #endregion

// requestContext の値をスパン属性に自動で追加する (6.6)
// #region request-context-keys
export const contextObservability = new Observability({
  configs: {
    default: {
      serviceName: 'my-app',
      requestContextKeys: ['userId', 'tenantId', 'environment'],
      exporters: [new LangfuseExporter({ /* keys */ })],
    },
  },
});
// #endregion

// パスワード・トークン・API キーを全スパンから除く (6.9)
// #region sensitive-filter
export const filteredObservability = new Observability({
  configs: {
    default: {
      serviceName: 'my-app',
      spanOutputProcessors: [new SensitiveDataFilter()],
      exporters: [new LangfuseExporter({ /* keys */ })],
    },
  },
});
// #endregion

// 汎用フィルタ → 業務固有フィルタの順で PII を除く (6.9)
// #region pii-chain
export const piiSafeObservability = new Observability({
  configs: {
    default: {
      serviceName: 'my-app',
      spanOutputProcessors: [
        new SensitiveDataFilter(),
        new PiiRedactor(),
      ],
      exporters: [new LangfuseExporter({ /* keys */ })],
    },
  },
});
// #endregion
