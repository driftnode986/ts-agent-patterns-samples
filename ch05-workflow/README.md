# ch05 - Mastra Workflow

Mastra Workflow の制御フロー (Sequential / Parallel / Foreach / Branch / Loop)、Suspend & Resume による人間承認フロー、Saga パターンによる補償処理、Step 間のデータ受け渡しと State 管理を実装します。

## SDK バージョン

- `@mastra/core` 1.78.0
- `@mastra/libsql` 1.26.2
- `@ai-sdk/anthropic` 4.0.82（5.11 の Agent）
- `zod` 4.6.7

## 本書の該当節

- 5.2 createStep / createWorkflow — `src/mastra/workflows/steps/validate-input.ts`, `src/mastra/workflows/payment-workflow.ts`, `src/index.ts`
- 5.3 制御フロー — `sequential-workflow.ts` (.then), `analysis-workflow.ts` (.parallel), `foreach-workflow.ts` (.foreach), `routing-workflow.ts` (.branch), `refine-workflow.ts` (.dountil), `pagination-workflow.ts` (.dowhile)
- 5.4・5.5 State とデータの受け渡し — `stateful-workflow.ts`, `map-workflow.ts`, `tier-workflow.ts` (requestContext)
- 5.6 Suspend & Resume — `steps/approval.ts`, `order-workflow.ts`, `src/approve-order.ts`, `steps/review-request.ts` (bail), `reminder-workflow.ts` (sleep)
- 5.7 永続化 — `src/mastra/index.ts` (LibSQLStore), `src/inspect-run.ts`
- 5.8 time-travel — `src/retry-payment.ts` (timeTravel)
- 5.9 エラーハンドリングと Saga — `retry-workflow.ts`, `alert-workflow.ts` (onError), `steps/compensate-payment.ts`, `steps/order-steps.ts`
- 5.10 長時間 Workflow — `daily-report-workflow.ts` (schedule), `src/start-order.ts` (結果のステータス)
- 5.11 Step から Agent を呼ぶ — `steps/ai-review.ts`, `agent-step-workflow.ts`, `src/mastra/agents/reviewer.ts`

`src/lib/` は決済・在庫・通知・外部 API の代わりに、メモリ上で動く簡単な実装です。

## 実行方法

```bash
# repo 直下で依存を入れる（npm workspaces）
npm install

cd ch05-workflow
npm run typecheck
npm test
```

テストは LLM を呼びません（Agent のモデルは `ai/test` の偽モデルに差し替えます）。保存先は LibSQL のメモリ上のデータベースです。
