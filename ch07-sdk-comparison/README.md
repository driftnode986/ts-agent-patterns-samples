# ch07-sdk-comparison

本書の「第7章 SDK 比較実践　Vercel AI SDK / Cloudflare Agents / Claude SDK / OpenAI Agents JS」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch07-sdk-comparison
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

SDK ごとにフォルダを分けています（それぞれに tsconfig.json があります）: `claude-agent-sdk/`、`cloudflare-agents/`、`mastra-cloudflare/`、`mastra-wrapper/`、`openai-agents/`、`vercel-ai-sdk/`

## 本の節とファイル

- **7.1 Vercel AI SDK　toolkit としての併用パターン**
  - `vercel-ai-sdk/src/app/api/chat/route.ts`
- **7.2 React `useChat` hook と Mastra Agent の接続**
  - `vercel-ai-sdk/src/app/chat/page.tsx`
- **7.3 Mastra Agent を Next.js Route Handler から呼ぶ**
  - `vercel-ai-sdk/src/patterns/agent-route-a.ts`
  - `vercel-ai-sdk/src/mastra/agents/customer-support.ts`
  - `vercel-ai-sdk/src/mastra/index.ts`
  - `vercel-ai-sdk/src/app/api/agent/route.ts`
- **7.5 Cloudflare® Agents　Durable Objects ベースの Agent アーキテクチャ**
  - `cloudflare-agents/src/index.ts`
  - `cloudflare-agents/src/env.d.ts`
- **7.6 Cloudflare Agents SDK セットアップと Agent クラス定義**
  - `cloudflare-agents/wrangler.jsonc`
  - `cloudflare-agents/src/chat-agent.ts`
- **7.7 Durable Execution with fibers　クラッシュリカバリ**
  - `cloudflare-agents/src/research-agent.ts`
  - `cloudflare-agents/src/index.ts`
- **7.8 Mastra を Cloudflare Workers にデプロイする手法**
  - `mastra-cloudflare/src/mastra/index.ts`
- **7.9 Claude™ Agent SDK TypeScript　Claude Code runtime を npm 化**
  - `claude-agent-sdk/src/agent.ts`
- **7.10 `query()` (stateless) と `resume` セッション (stateful)**
  - `claude-agent-sdk/src/run-query.ts`
  - `claude-agent-sdk/src/stateless.ts`
  - `claude-agent-sdk/src/resume.ts`
- **7.11 組込ツール / Permission / Hooks / MCP 連携**
  - `claude-agent-sdk/src/read-only.ts`
- **7.12 OpenAI™ Agents JS　現状の機能制約**
  - `openai-agents/src/agent.ts`
  - `openai-agents/src/guardrail.ts`
- **7.14 Mastra から各 SDK を呼び出すラッパーパターン**
  - `mastra-wrapper/src/mastra/tools/claude-review.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@ai-sdk/react` 4.0.147
- `@anthropic-ai/claude-agent-sdk` 0.3.302
- `@cloudflare/ai-chat` 0.12.1
- `@mastra/ai-sdk` 1.11.1
- `@mastra/core` 1.78.0
- `@mastra/deployer-cloudflare` 1.2.37
- `@openai/agents` 0.20.0
- `agents` 0.28.1
- `ai` 7.0.143
- `next` 16.4.2
- `react` 19.3.1
- `react-dom` 19.3.1
- `zod` 4.6.7
