# ch08 - 本番運用

AI Agent を本番環境で安定稼働させるための古典クラウドパターン (Retry / Circuit Breaker / Saga / Cache) とエンタープライズ要件 (RBAC / 監査ログ / PII / プロンプトインジェクション対策 / デプロイ戦略) を実装します。

## 本書の該当節

- 8.2 Retry パターン — `src/lib/resilience.ts` (Exponential Backoff)
- 8.3 Circuit Breaker — `src/lib/resilience.ts` (3 状態遷移)
- 8.4 Cost Cap — `src/lib/cost-cap.ts` (日次/月次 Token 上限)
- 8.5 Saga パターン — `src/mastra/workflows/booking-saga.ts` (補償トランザクション)
- 8.6 Cache-Aside — `src/lib/cache.ts` (Exact Match), `src/lib/semantic-cache.ts` (Semantic)
- 8.7 Human-in-the-Loop — `src/mastra/workflows/approval-workflow.ts`
- 8.8 RBAC — `src/middleware/rbac.ts` (ロールベースアクセス制御)
- 8.9 監査ログ — `src/lib/audit-log.ts` (AuditLogSchema)
- 8.11 PII 検知 — `src/lib/pii-filter.ts` (マスキングパイプライン)
- 8.12 プロンプトインジェクション対策 — `src/lib/input-guard.ts`, `src/lib/output-guard.ts`
- 8.13 Blue-Green / Canary — `src/middleware/canary.ts`

## SDK バージョン

- Mastra `@mastra/core@1.35.0`
- `cockatiel@3.2+`

## セットアップ

```bash
npm install
```

Redis を使用するサンプル (Cache / Cost Cap) は別途 Redis サーバーが必要です。

```bash
REDIS_URL=redis://localhost:6379
```

Semantic Cache を使用する場合は pgvector が必要です。

```bash
DATABASE_URL=postgresql://localhost:5432/agent_cache
```

## 構成

- `src/lib/resilience.ts` — Retry (ExponentialBackoff) + Circuit Breaker (cockatiel)
- `src/lib/cost-cap.ts` — Token コスト上限管理 (Redis / Langfuse 連携)
- `src/lib/cache.ts` — Exact Match Cache (Redis hash)
- `src/lib/semantic-cache.ts` — Semantic Cache (embedding + pgvector)
- `src/lib/audit-log.ts` — 監査ログスキーマと書き込み
- `src/lib/pii-filter.ts` — PII パターンマッチングとマスキング
- `src/lib/input-guard.ts` — プロンプトインジェクション検出 (入力)
- `src/lib/output-guard.ts` — 出力ガードレール (システムプロンプト漏洩 / API キー検出)
- `src/mastra/workflows/booking-saga.ts` — Saga パターン (予約 + 補償)
- `src/mastra/workflows/approval-workflow.ts` — Human-in-the-Loop (suspend/resume)
- `src/mastra/agents/resilient-agent.ts` — modelFallback 付き Agent
- `src/middleware/rbac.ts` — RBAC ミドルウェア (admin/developer/viewer)
- `src/middleware/canary.ts` — Canary デプロイ (hashCode ユーザー振り分け)

## 実行方法

```bash
npx vitest run ch08-production/
npx tsx ch08-production/src/lib/resilience.ts
npx tsx ch08-production/src/mastra/workflows/booking-saga.ts
```

## トピック

- LLM 障害の分類: リトライ可能 (429/500/503) vs 不可能 (400/401/403)
- Retry: Exponential Backoff + Jitter (cockatiel)
- Circuit Breaker: Closed → Open → Half-Open の 3 状態遷移
- Token Throttling: 日次/月次コスト上限と Langfuse アラート連携
- Saga パターン: 多段階処理の補償トランザクション (bookHotel / cancelHotel)
- Cache-Aside: Exact Match (hash) + Semantic (embedding cosine 類似度)
- RBAC: Role ベースの Agent / Tool アクセス制御 + JWT 検証
- 監査ログ: PII 処理戦略 (Full / Hash / Masked) と SOC2 対応
- プロンプトインジェクション: 入力パターン検出 + 出力ガードレール
- デプロイ: Blue-Green (即時切替) / Canary (段階的ロールアウト + Langfuse メトリクス)
