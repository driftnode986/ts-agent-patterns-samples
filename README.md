# ts-agent-patterns-samples

「**Mastra ではじめる TypeScript AI エージェント実装 — Vercel AI SDK・Cloudflare Agents との比較で学ぶ本番運用パターン**」（牧野 誠 著）のサンプルコード集です。

本書の各章で登場するコードをそのまま動かせる形で収録しています。

## 動作環境

- **Node.js** v22 LTS 以上
- **TypeScript** 5.8+
- **npm** (pnpm / yarn でも可)
- **OS** macOS / Linux / WSL2

Ch4 (RAG) と Ch8 (Semantic Cache) では PostgreSQL + pgvector 拡張が必要です。ローカル開発では LibSQL (SQLite) のみで動作します。

## セットアップ

```bash
git clone https://github.com/driftnode986/ts-agent-patterns-samples.git
cd ts-agent-patterns-samples
npm install
cp .env.example .env
```

`.env` を開いて API キーを設定してください。

## 環境変数

| 変数名 | 用途 | 必須 |
|--------|------|------|
| `ANTHROPIC_API_KEY` | Claude API (全章共通) | 必須 |
| `OPENAI_API_KEY` | OpenAI API (Ch7 比較用) | Ch7 のみ |
| `LANGFUSE_PUBLIC_KEY` | Langfuse 観測性 (Ch6) | Ch6 のみ |
| `LANGFUSE_SECRET_KEY` | Langfuse 観測性 (Ch6) | Ch6 のみ |
| `LANGFUSE_BASEURL` | Langfuse エンドポイント | Ch6 のみ |

## 対応 SDK バージョン (執筆時 2026-05)

| SDK | バージョン | 該当章 |
|-----|-----------|--------|
| Mastra | `@mastra/core@1.35.0` | 全章 |
| Vercel AI SDK | `ai@6.0+` / `@ai-sdk/anthropic@3.0+` | Ch1, Ch7 |
| Cloudflare Agents | `agents@0.13.2` | Ch1, Ch7 |
| Claude Agent SDK | `@anthropic-ai/claude-agent-sdk@0.3.150` | Ch1, Ch7 |
| OpenAI Agents JS | `@openai/agents@0.11.5` | Ch1, Ch7 |

## ディレクトリ構成

```
ts-agent-patterns-samples/
├── ch01-landscape/        第1章  5 SDK の見取り図
│   └── 5 SDK の Hello World、3 レイヤー分類
├── ch02-mastra-setup/     第2章  Mastra 環境構築
│   └── プロジェクト作成、Agent 定義、Tool 追加、LibSQL 初期化
├── ch03-agent-tools/      第3章  Agent + Tools + Model Router
│   └── Zod スキーマ、Subagent、MCP 接続、Model Router、テスト
├── ch04-memory-rag/       第4章  Memory + RAG
│   └── Message History、Working Memory、Semantic Recall、pgvector RAG
├── ch05-workflow/         第5章  Workflow
│   └── 制御フロー、Suspend & Resume、Saga パターン、State 管理
├── ch06-observability/    第6章  観測性
│   └── Langfuse 連携、OpenTelemetry、コスト可視化、PII マスキング
├── ch07-sdk-comparison/   第7章  SDK 比較実践
│   └── Vercel AI SDK / Cloudflare / Claude SDK / OpenAI Agents の実装比較
├── ch08-production/       第8章  本番運用
│   └── Retry、Circuit Breaker、RBAC、Cost Cap、デプロイ戦略
├── .env.example           環境変数テンプレート
├── package.json           依存パッケージ一覧
└── tsconfig.json          TypeScript 設定
```

## 本書に含まれないもの

- **フロントエンド UI**: 本書はバックエンド (Agent / Workflow / Observability) に集中しています。React / Next.js のフロントエンドは Ch7 で `useChat` フックの例示のみです
- **Python サンプル**: 本書は TypeScript ネイティブ実装が前提です
- **LangChain.js / LangGraph**: 本書のスコープ外です (Ch1 で不採用の理由を説明)

## 章ごとの実行方法

各章のディレクトリに README があり、実行手順を記載しています。基本パターンは以下のとおりです。

```bash
# テスト実行
npx vitest run ch03-agent-tools/

# 特定のサンプルを直接実行
npx tsx ch02-mastra-setup/src/scripts/chat.ts
```

## 主要な依存パッケージ

### Mastra エコシステム

- `@mastra/core` — フレームワーク本体 (Agent, Tool, Workflow)
- `@mastra/memory` — Memory (Message History, Working Memory, Semantic Recall)
- `@mastra/libsql` — LibSQL ストレージ (開発用)
- `@mastra/pg` — PostgreSQL ストレージ (本番用)
- `@mastra/mcp` — MCP クライアント
- `@mastra/langfuse` — Langfuse 連携
- `@mastra/observability` — OpenTelemetry 統合

### AI SDK

- `ai` — Vercel AI SDK コア
- `@ai-sdk/anthropic` — Claude プロバイダ
- `@ai-sdk/openai` — OpenAI プロバイダ
- `@ai-sdk/google` — Google Gemini プロバイダ

### ユーティリティ

- `zod` — スキーマバリデーション (全章で使用)
- `cockatiel` — Retry / Circuit Breaker (Ch8)
- `vitest` — テストフレームワーク

## ライセンス

MIT
