# ch07 - SDK 比較実践

同一の要件 (カスタマーサポート Agent) を Vercel AI SDK / Cloudflare Agents / Claude Agent SDK / OpenAI Agents JS で実装し、Mastra との違いを API 設計・デプロイ・パフォーマンスの観点で横断比較します。

## 本書の該当節

- 7.1 Vercel AI SDK — `src/vercel/route.ts` (streamText + tool)
- 7.2 React useChat 接続 — `src/vercel/page.tsx`
- 7.3 Mastra Agent を Next.js から呼ぶ — Pattern A (外部サーバー) / Pattern B (直接 import)
- 7.5 Cloudflare Agents — `src/cloudflare/index.ts` (Durable Objects)
- 7.6 wrangler 設定 — `src/cloudflare/wrangler.jsonc`
- 7.7 Durable Execution — think() によるチェックポイントリカバリ
- 7.9 Claude Agent SDK — `src/claude/agent.ts` (query / resume)
- 7.12 OpenAI Agents JS — `src/openai/agent.ts` (handoffs / Guardrails)
- 7.13 ベンチマーク — レイテンシ / Token / コード行数の 5 SDK 比較
- 7.14 Mastra から各 SDK を呼ぶラッパー — `src/mastra/tools/claude-review.ts`

## SDK バージョン

- Mastra `@mastra/core@1.35.0`
- Vercel AI SDK `ai@6.0+` / `@ai-sdk/anthropic@3.0+`
- Cloudflare Agents `agents@0.13.2`
- Claude Agent SDK TypeScript `@anthropic-ai/claude-agent-sdk@0.3.150`
- OpenAI Agents JS `@openai/agents@0.11.5`

## セットアップ

```bash
npm install
```

各 SDK の API キーを `.env` に設定してください。

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Cloudflare Agents を実行する場合は wrangler CLI が必要です。

```bash
npx wrangler dev src/cloudflare/index.ts
```

## 構成

- `src/vercel/route.ts` — Vercel AI SDK: streamText + tool 定義 (Next.js Route Handler)
- `src/vercel/page.tsx` — Vercel AI SDK: useChat フック (React)
- `src/cloudflare/index.ts` — Cloudflare Agents: AIChatAgent + Durable Objects
- `src/cloudflare/wrangler.jsonc` — Cloudflare: Durable Objects 設定
- `src/claude/agent.ts` — Claude Agent SDK: query() + resume セッション
- `src/openai/agent.ts` — OpenAI Agents JS: Agent + handoffs + InputGuardrail
- `src/mastra/tools/claude-review.ts` — Mastra Tool として Claude Agent SDK をラップ

## 実行方法

```bash
npx vitest run ch07-sdk-comparison/
npx tsx ch07-sdk-comparison/src/vercel/route.ts
npx tsx ch07-sdk-comparison/src/claude/agent.ts
npx tsx ch07-sdk-comparison/src/openai/agent.ts
```

## トピック

- Vercel AI SDK: フロントエンド統合の Toolkit (streamText, useChat, tool)
- Cloudflare Agents: Durable Objects によるステートフル Edge Agent
- Cloudflare Durable Execution: fibers によるクラッシュリカバリ
- Claude Agent SDK: Claude Code ランタイムを API として利用 (query / resume)
- OpenAI Agents JS: handoffs による Agent 間委譲と Guardrails (Input/Output)
- Mastra を Cloudflare Workers にデプロイする制約と対策
- 5 SDK のレイテンシ / Token 効率 / コード量ベンチマーク
- Mastra Tool として外部 SDK をラップする統合パターン
