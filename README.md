# ts-agent-patterns-samples

『**Mastra ではじめる TypeScript AI エージェント実装 — Vercel AI SDK・Cloudflare Agents との比較で学ぶ本番運用パターン**』のサンプルコードです。

本に載っているコードは、すべてこの repo のファイルから差し込んでいます。各章のコードは型チェックとテストで動作を確かめています（全章で 170 件。テストは偽のモデルを使うので、API キー無しで通ります）。

Kindle 版: [Mastra ではじめる TypeScript AI エージェント実装](https://www.amazon.co.jp/dp/B0GX38ZD9F)

## 動作環境

- **Node.js** 22.13 以上（@mastra/core 1.78.0 の要件）
- **npm**（npm workspaces を使います）
- **OS** macOS / Linux / WSL2

第4章の本番構成と第8章の Semantic Cache は PostgreSQL + pgvector、第8章のキャッシュは Redis を使います。テストでは、どちらもメモリ上の偽物か LibSQL（SQLite）で置き換えています。

## セットアップ

```bash
git clone https://github.com/driftnode986/ts-agent-patterns-samples.git
cd ts-agent-patterns-samples
npm install            # 全章の依存が一度に入ります（npm workspaces）
cp .env.example .env   # 実際にエージェントを動かすときに API キーを書きます
```

## 動作の確かめ方

```bash
npm run typecheck      # 全章の型チェック
npm test               # 全章のテスト

cd ch05-workflow       # 1つの章だけ
npm run typecheck && npm test
```

## スクリプトの実行

本で `src/scripts/` などのスクリプトを動かすときは、repo に入っている tsx を使います（`.env` に API キーが要ります）。

```bash
cd ch04-memory-rag
npx tsx --env-file=../.env src/scripts/chat.ts
```

## 環境変数

`.env.example` に、使う章と一緒に書いてあります。テスト（`npm test`）にはどれも不要です。

- `ANTHROPIC_API_KEY` — Claude（全章）
- `OPENAI_API_KEY` — 埋め込み（第4章・第8章）、別のモデルへの切り替え（第2・3・8章）、OpenAI Agents（第1章・第7章）
- `LANGFUSE_PUBLIC_KEY` / `LANGFUSE_SECRET_KEY` / `LANGFUSE_BASE_URL` — Langfuse（第6章）
- `DATABASE_URL` — PostgreSQL + pgvector（第4章・第8章）
- `REDIS_URL` — Redis（第8章）
- `GITHUB_TOKEN` — GitHub の MCP サーバー（第3章）

## 動作確認した版（2026-10）

各章の `package.json` に版を固定しています。主なもの:

- Mastra `@mastra/core` 1.78.0（`@mastra/memory` 1.38.0 / `@mastra/libsql` 1.26.2 / `@mastra/pg` 1.31.2 / `@mastra/mcp` 2.4.1 / `@mastra/observability` 1.20.1）
- Vercel AI SDK `ai` 7.0.143 / `@ai-sdk/anthropic` 4.0.82 / `@ai-sdk/openai` 4.0.96 / `@ai-sdk/react` 4.0.147
- Cloudflare Agents `agents` 0.28.1
- Claude Agent SDK `@anthropic-ai/claude-agent-sdk` 0.3.302
- OpenAI Agents JS `@openai/agents` 0.20.0
- `zod` 4.6.7 / `typescript` 6.0.3 / `vitest` 5.0.5

## ディレクトリ構成

```
ts-agent-patterns-samples/
├── ch01-landscape/          第1章  5 SDK の見取り図（SDK ごとのフォルダ）
│   ├── vercel-ai-sdk/  mastra/  cloudflare-agents/  claude-agent-sdk/  openai-agents/
├── ch02-mastra-setup/       第2章  Mastra 環境構築
├── ch03-agent-tools/        第3章  Agent + Tools + Model Router
├── ch04-memory-rag/         第4章  Memory + RAG
├── ch05-workflow/           第5章  Workflow
├── ch06-observability/      第6章  観測性
├── ch07-sdk-comparison/     第7章  SDK 比較実践（SDK ごとのフォルダ）
│   ├── vercel-ai-sdk/  cloudflare-agents/  mastra-cloudflare/
│   ├── claude-agent-sdk/  openai-agents/  mastra-wrapper/
├── ch08-production/         第8章  本番運用
├── appendix-b-branded-types/ 付録B  TypeScript Branded Types
├── .env.example
├── package.json             npm workspaces（全章）
└── tsconfig.base.json       全章共通の TypeScript 設定
```

各章の README に、本の節とファイルの対応を書いています。

## 本書に含まれないもの

- **フロントエンド UI**: 本書はバックエンド（Agent / Workflow / 観測性）が中心です。React / Next.js は第7章の `useChat` の例だけです
- **Python のサンプル**: TypeScript だけで書いています
- **LangChain.js / LangGraph**: 本書の範囲外です（第1章で理由を説明しています）

## ライセンス

MIT
