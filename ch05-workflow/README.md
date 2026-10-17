# ch05-workflow

本書の「第5章 Mastra Workflow　Sequential, Parallel, Suspend & Resume」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch05-workflow
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **5.2 createStep() と createWorkflow()**
  - `src/mastra/workflows/steps/validate-input.ts`
  - `src/mastra/workflows/payment-workflow.ts`
  - `src/lib/payment-gateway.ts`
  - `src/mastra/workflows/steps/process-payment.ts`
  - `src/mastra/workflows/steps/send-receipt.ts`
  - `src/index.ts`
- **5.3 制御フロー　Sequential / Parallel / Branch / Loop**
  - `src/mastra/workflows/sequential-workflow.ts`
  - `src/mastra/workflows/analysis-workflow.ts`
  - `src/mastra/workflows/steps/combine.ts`
  - `src/mastra/workflows/foreach-workflow.ts`
  - `src/mastra/workflows/routing-workflow.ts`
  - `src/mastra/workflows/steps/handlers.ts`
  - `src/mastra/workflows/refine-workflow.ts`
  - `src/mastra/workflows/pagination-workflow.ts`
- **5.4 State の型定義　Zod スキーマで Workflow State を固定**
  - `src/mastra/workflows/stateful-workflow.ts`
  - `src/mastra/workflows/map-workflow.ts`
- **5.5 Step 間のデータ受け渡し**
  - `src/mastra/workflows/tier-workflow.ts`
  - `src/check-tier.ts`
- **5.6 Suspend & Resume　人間判断が必要な箇所で待機**
  - `src/mastra/workflows/steps/approval.ts`
  - `src/mastra/workflows/order-workflow.ts`
  - `src/approve-order.ts`
  - `src/mastra/workflows/steps/review-request.ts`
  - `src/mastra/workflows/reminder-workflow.ts`
- **5.7 Workflow の永続化**
  - `src/mastra/index.ts`
  - `src/inspect-run.ts`
- **5.8 time-travel debug　任意の Step から再実行**
  - `src/retry-payment.ts`
- **5.9 エラーハンドリングと Saga パターン**
  - `src/mastra/workflows/retry-workflow.ts`
  - `src/mastra/workflows/alert-workflow.ts`
  - `src/mastra/workflows/steps/order-steps.ts`
  - `src/lib/inventory.ts`
  - `src/mastra/workflows/steps/compensate-payment.ts`
- **5.10 長時間 Workflow の運用設計**
  - `src/mastra/workflows/daily-report-workflow.ts`
  - `src/start-order.ts`
- **5.11 Workflow Step から Agent を呼ぶ**
  - `src/mastra/agents/reviewer.ts`
  - `src/mastra/workflows/steps/ai-review.ts`
  - `src/mastra/workflows/agent-step-workflow.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@mastra/core` 1.78.0
- `@mastra/libsql` 1.26.2
- `zod` 4.6.7
