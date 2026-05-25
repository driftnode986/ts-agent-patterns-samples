# ch06 - 観測性

Mastra の OpenTelemetry 統合と Langfuse 連携で、Agent / Tool / Workflow のトレース可視化、Token コスト追跡、品質評価 (Eval)、PII マスキングを実装します。

## 本書の該当節

- 6.3 OpenTelemetry 統合 — `src/mastra/index.ts` (MastraStorageExporter)
- 6.4 Langfuse 連携 — `src/mastra/index.ts` (LangfuseExporter), Prompt Linking
- 6.5 コスト可視化 — `src/mastra/workflows/steps/cost-guard.ts`
- 6.6 カスタム属性 — tags / metadata / requestContextKeys / カスタム Child Span
- 6.7 Eval framework — `src/evals/quality-scorer.ts` (LLM-as-Judge)
- 6.9 プライバシー考慮 — `src/observability/pii-redactor.ts` (SensitiveDataFilter)
- 6.10 Sampling 戦略 — ratio / custom sampler
- 6.11 OTel バックエンド選択 — OtelExporter / OtelBridge

## SDK バージョン

- Mastra `@mastra/core@1.35.0`
- `@mastra/observability`
- `@mastra/langfuse`
- `@mastra/otel-exporter`
- `@mastra/otel-bridge`

## セットアップ

```bash
npm install
```

Langfuse を使用する場合は `.env` に以下を設定してください。

```bash
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_BASE_URL=https://cloud.langfuse.com  # or self-hosted URL
```

## 構成

- `src/mastra/index.ts` — Observability 設定 (MastraStorageExporter / LangfuseExporter)
- `src/mastra/workflows/steps/cost-guard.ts` — コスト上限チェック Step
- `src/mastra/workflows/steps/search.ts` — カスタム Child Span 作成
- `src/evals/quality-scorer.ts` — LLM-as-Judge 品質スコアラー (createScorer)
- `src/observability/pii-redactor.ts` — PII マスキングプロセッサ
- `src/observability/instrumentation.ts` — OTel Bridge + NodeSDK セットアップ

## 実行方法

```bash
npx vitest run ch06-observability/
npx tsx ch06-observability/src/mastra/index.ts
```

## トピック

- AI Agent 観測性の 3 階層: Logs (プロンプト/応答)、Metrics (Token/コスト/レイテンシ)、Traces (Workflow→Agent→Tool→LLM)
- Mastra の自動トレース対象 7 種類 (AGENT_RUN, LLM_GENERATION, TOOL_CALL, WORKFLOW_RUN 等)
- Langfuse 連携: 開発モード (realtime) vs 本番モード (batch)
- Prompt Linking: Langfuse 上のプロンプトバージョンとトレースを紐付け
- Token コスト可視化と Cost Ceiling の実装
- createScorer による LLM-as-Judge 品質評価
- PII マスキングパイプライン (SensitiveDataFilter + カスタム SpanOutputProcessor)
- Sampling 戦略: 100% (開発) → 10-50% (本番) でコスト最適化
