# ch05 - Mastra Workflow

Mastra Workflow の制御フロー (Sequential / Parallel / Branch / Loop)、Suspend & Resume による人間承認フロー、Saga パターンによる補償トランザクション、Step 間のデータ受け渡しと State 管理を実装します。

## 本書の該当節

- 5.2 createStep / createWorkflow — `src/mastra/workflows/steps/validate-input.ts`, `src/mastra/workflows/payment-workflow.ts`
- 5.3 制御フロー — `src/mastra/workflows/analysis-workflow.ts` (parallel), `src/mastra/workflows/routing-workflow.ts` (branch)
- 5.4 State の型定義 — `src/mastra/workflows/stateful-workflow.ts`
- 5.6 Suspend & Resume — `src/mastra/workflows/steps/approval.ts`
- 5.7 永続化 — `src/mastra/index.ts` (LibSQLStore)
- 5.9 Saga パターン — `src/mastra/workflows/steps/compensate-payment.ts`
- 5.11 Step から Agent を呼ぶ — `src/mastra/workflows/steps/ai-review.ts`
- 5.2 Workflow 実行 — `src/index.ts`

## SDK バージョン

- Mastra `@mastra/core@1.35.0`
- `@mastra/libsql`

## セットアップ

```bash
npm install
```

## 構成

- `src/mastra/workflows/payment-workflow.ts` — Sequential 制御フロー (.then)
- `src/mastra/workflows/analysis-workflow.ts` — Parallel 制御フロー (.parallel)
- `src/mastra/workflows/routing-workflow.ts` — Branch 条件分岐 (.branch)
- `src/mastra/workflows/stateful-workflow.ts` — stateSchema による共有 State
- `src/mastra/workflows/steps/validate-input.ts` — Zod バリデーション Step
- `src/mastra/workflows/steps/approval.ts` — Suspend & Resume (人間承認)
- `src/mastra/workflows/steps/compensate-payment.ts` — Saga 補償 Step
- `src/mastra/workflows/steps/ai-review.ts` — Step 内での Agent 呼び出し
- `src/mastra/index.ts` — Mastra + LibSQLStore (Workflow 永続化)
- `src/index.ts` — Workflow 実行 (createRun + start)

## 実行方法

```bash
npx vitest run ch05-workflow/
npx tsx ch05-workflow/src/index.ts
```

## トピック

- DAG ベースの Workflow エンジンと決定論的な処理順序
- 5 つの制御フロー: .then (sequential) / .parallel / .foreach / .branch / .dountil
- stateSchema による Step 間の型安全なデータ共有
- Suspend & Resume: 人間承認フロー (suspend → 外部通知 → resume/bail)
- Saga パターン: 分散トランザクションの補償処理
- Step 内から Agent を呼び出す 3 つのパターン
- LibSQLStore による Workflow 実行状態の永続化
- time-travel debug: 任意の Step からの再実行 (restart)
