# ch01-landscape

本書の「第1章 TypeScript AI エージェントの 2026 年の現在地　5 つの SDK の見取り図」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch01-landscape
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

SDK ごとにフォルダを分けています（それぞれに tsconfig.json があります）: `claude-agent-sdk/`、`cloudflare-agents/`、`mastra/`、`openai-agents/`、`vercel-ai-sdk/`

## 本の節とファイル

- **1.3 Vercel AI SDK　フロントエンド統合の Toolkit**
  - `vercel-ai-sdk/src/app/api/chat/route.ts`
- **1.4 Mastra　統合フレームワークの全体像**
  - `mastra/src/mastra/agents/index.ts`
- **1.5 Cloudflare Agents　Edge で動くアクターモデル**
  - `cloudflare-agents/src/index.ts`
  - `cloudflare-agents/src/env.d.ts`
- **1.6 Claude™ Agent SDK と OpenAI Agents JS**
  - `claude-agent-sdk/src/index.ts`
  - `openai-agents/src/index.ts`
- **1.9 本書で扱う Mastra のバージョンと pin 戦略**
  - `package.json`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@anthropic-ai/claude-agent-sdk` 0.3.302
- `@mastra/core` 1.78.0
- `@openai/agents` 0.20.0
- `agents` 0.28.1
- `ai` 7.0.143
- `zod` 4.6.7
