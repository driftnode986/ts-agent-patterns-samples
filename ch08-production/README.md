# ch08-production

本書の「第8章 本番運用　古典クラウドパターンとエンタープライズ要件」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch08-production
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **8.2 Retry パターン　LLM 呼び出しの失敗種別と Exponential Backoff**
  - `src/lib/resilience.ts`
- **8.3 Circuit Breaker　LLM API 応答不能時の保護**
  - `src/lib/resilience.ts`
  - `src/mastra/agents/resilient-agent.ts`
- **8.4 Token Throttling と Cost Cap　月次 / 日次のコスト上限**
  - `src/lib/cost-cap.ts`
- **8.5 Saga パターン　multi-step Agent の補償トランザクション**
  - `src/lib/travel-api.ts`
  - `src/mastra/workflows/booking-saga.ts`
- **8.6 Cache-Aside と Semantic Cache　LLM 応答のキャッシュ戦略**
  - `src/lib/cache.ts`
  - `src/lib/db.ts`
  - `src/lib/semantic-cache.ts`
- **8.7 Human-in-the-Loop　重要判断は人間承認**
  - `src/mastra/workflows/approval-workflow.ts`
  - `src/mastra/index.ts`
- **8.8 Okta SSO 連携と RBAC　Agent 単位のアクセス制御**
  - `src/lib/session.ts`
  - `src/middleware/rbac.ts`
- **8.9 Agent 呼び出しの監査ログ**
  - `src/lib/audit-log.ts`
- **8.11 Secret 管理と PII 検知 / masking パイプライン**
  - `src/lib/pii-filter.ts`
- **8.12 プロンプトインジェクション対策と Output guardrails**
  - `src/lib/input-guard.ts`
  - `src/lib/output-guard.ts`
- **8.13 Agent デプロイの blue-green / canary 戦略**
  - `src/mastra/agents/index.ts`
  - `src/lib/hash.ts`
  - `src/middleware/canary.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@ai-sdk/openai` 4.0.96
- `@mastra/core` 1.78.0
- `@mastra/libsql` 1.26.2
- `ai` 7.0.143
- `cockatiel` 4.0.0
- `ioredis` 6.0.0
- `pg` 8.23.1
- `zod` 4.6.7
