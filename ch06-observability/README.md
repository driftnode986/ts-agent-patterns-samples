# ch06-observability

本書の「第6章 Mastra 観測性　Langfuse / OpenTelemetry」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch06-observability
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **6.3 Mastra の OpenTelemetry 統合**
  - `src/steps/mastra-index.step1.ts`
- **6.4 Langfuse 連携**
  - `src/steps/mastra-index.step2.ts`
  - `src/observability/langfuse-modes.ts`
  - `src/mastra/agents/prompt-linked-agent.ts`
- **6.5 Token 使用量とコストの可視化**
  - `src/lib/pricing.ts`
  - `src/mastra/workflows/steps/cost-guard.ts`
- **6.6 カスタム属性の追加**
  - `src/mastra/agents/support-agent.ts`
  - `src/examples/tracing-options.ts`
  - `src/observability/configs.ts`
  - `src/lib/db.ts`
  - `src/mastra/workflows/steps/search.ts`
- **6.7 Eval framework で品質を計測**
  - `src/evals/quality-scorer.ts`
  - `src/evals/run-quality-scorer.ts`
- **6.9 プライバシー考慮　PII を trace から除外する**
  - `src/examples/tracing-options.ts`
  - `src/observability/configs.ts`
  - `src/observability/pii-redactor.ts`
- **6.10 観測コストと Sampling 戦略**
  - `src/observability/sampling.ts`
- **6.11 OpenTelemetry バックエンドの選択**
  - `src/observability/backends.ts`
  - `src/observability/instrumentation.ts`
  - `src/mastra/index.ts`
  - `src/serverless/route.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@mastra/core` 1.78.0
- `@mastra/langfuse` 1.6.1
- `@mastra/libsql` 1.26.2
- `@mastra/observability` 1.20.1
- `@mastra/otel-bridge` 1.5.17
- `@mastra/otel-exporter` 1.4.8
- `@opentelemetry/auto-instrumentations-node` 0.81.2
- `@opentelemetry/exporter-trace-otlp-proto` 0.223.0
- `@opentelemetry/sdk-node` 0.223.0
- `@opentelemetry/sdk-trace-base` 2.12.0
- `zod` 4.6.7
