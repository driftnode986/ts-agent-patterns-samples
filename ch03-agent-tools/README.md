# ch03-agent-tools

本書の「第3章 Mastra Agent 基礎　Tools と Model Router」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch03-agent-tools
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **この章で扱うバージョン (2026-10 に確認)**
  - `.env.example`
- **3.1 Agent の構成要素**
  - `src/mastra/tools/research.ts`
  - `src/mastra/tools/index.ts`
  - `src/mastra/agents/full-agent.ts`
- **3.2 Tool の設計原則　1 ツール 1 責務**
  - `src/mastra/tools/customer.ts`
  - `src/lib/db.ts`
- **3.3 Zod スキーマで入出力を型固定する**
  - `src/mastra/tools/invoice.ts`
  - `src/lib/billing-service.ts`
- **3.4 Tool 内でのエラーハンドリング**
  - `src/mastra/tools/database.ts`
- **3.5 複数 Tool の並列実行と直列実行**
  - `src/mastra/tools/research.ts`
  - `src/mastra/agents/research-agent.ts`
- **3.6 Subagent パターン　Tool 内から別の Agent を呼ぶ**
  - `src/mastra/agents/code-review.ts`
  - `src/mastra/tools/delegate.ts`
- **3.7 MCP サーバーを Tool として接続する**
  - `src/mastra/mcp/client.ts`
  - `src/mastra/agents/github-agent.ts`
  - `src/mastra/mcp/user-tools.ts`
- **3.8 Model Router 概要　216 プロバイダ / 8,000 以上のモデル**
  - `src/mastra/agents/router-agents.ts`
  - `src/mastra/agents/provider-agents.ts`
- **3.9 Model fallback　rate limit 時の自動切替**
  - `src/mastra/agents/resilient-agent.ts`
- **3.10 Token-aware routing　入力サイズでモデルを振り分ける**
  - `src/lib/model-router.ts`
  - `src/mastra/agents/smart-agent.ts`
- **3.11 Agent の出力を構造化する**
  - `src/mastra/agents/support-agent.ts`
  - `src/mastra/agents/index.ts`
  - `src/scripts/structured-example.ts`
- **3.12 instructions のテンプレート化**
  - `src/lib/instructions.ts`
  - `src/lib/tenant-config.ts`
  - `src/mastra/tools/knowledge-base.ts`
  - `src/mastra/agents/tenant-agent.ts`
- **3.13 Agent をテストする**
  - `tests/tools/customer.test.ts`
  - `tests/agents/support.test.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@ai-sdk/google` 4.0.99
- `@ai-sdk/openai` 4.0.96
- `@libsql/client` 0.18.0
- `@mastra/core` 1.78.0
- `@mastra/mcp` 2.4.1
- `zod` 4.6.7
