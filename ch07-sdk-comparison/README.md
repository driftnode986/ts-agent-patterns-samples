# ch07 - SDK 比較実践

同一の要件 (カスタマーサポート Agent) を Vercel AI SDK / Cloudflare Agents / Claude Agent SDK / OpenAI Agents JS で実装し、Mastra との違いを API 設計・デプロイの観点で比較します。SDK ごとにサブフォルダを分け、型チェックもサブフォルダごとに行います。

## 本書の該当節と構成

- 7.1〜7.3 Vercel AI SDK — `vercel-ai-sdk/`
  - `src/app/api/chat/route.ts` — streamText + tool (Next.js Route Handler)
  - `src/app/chat/page.tsx` — useChat (React)
  - `src/app/api/agent/route.ts` — パターン B: Mastra Agent を同じプロセスで呼ぶ
  - `src/patterns/agent-route-a.ts` — パターン A: 別プロセスの Mastra サーバーを呼ぶ
  - `src/mastra/` — 上の 2 つが呼ぶ customerSupport Agent
- 7.5〜7.7 Cloudflare Agents — `cloudflare-agents/`
  - `src/index.ts` — CustomerSupport (Durable Objects + state)
  - `src/chat-agent.ts` — AIChatAgent (`@cloudflare/ai-chat`)
  - `src/research-agent.ts` — runFiber による durable execution
  - `src/env.d.ts` / `wrangler.jsonc` — バインディングの型と設定
- 7.8 Mastra を Cloudflare Workers に — `mastra-cloudflare/`
- 7.9〜7.11 Claude Agent SDK — `claude-agent-sdk/`
  - `src/agent.ts` / `src/stateless.ts` / `src/resume.ts` / `src/read-only.ts`
  - `src/run-query.ts` — query() の結果メッセージから最終回答とセッション ID を取り出す
- 7.12 OpenAI Agents JS — `openai-agents/` (`src/agent.ts` handoffs / `src/guardrail.ts`)
- 7.14 Mastra から Claude Agent SDK を呼ぶ — `mastra-wrapper/src/mastra/tools/claude-review.ts`

## SDK バージョン

- Mastra `@mastra/core@1.78.0` / `@mastra/ai-sdk@1.11.1` / `@mastra/deployer-cloudflare@1.2.37`
- Vercel AI SDK `ai@7.0.143` / `@ai-sdk/anthropic@4.0.82` / `@ai-sdk/react@4.0.147`
- Cloudflare Agents `agents@0.28.1` / `@cloudflare/ai-chat@0.12.1`
- Claude Agent SDK TypeScript `@anthropic-ai/claude-agent-sdk@0.3.302`
- OpenAI Agents JS `@openai/agents@0.20.0`

## セットアップ

repo 直下で `npm install`（npm workspaces で全章の依存が入ります）。実際に LLM を呼ぶときは API キーを `.env` に設定します。

```bash
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
```

Cloudflare Agents は章ディレクトリで `npx wrangler dev -c cloudflare-agents/wrangler.jsonc` を実行します（Workers AI と Durable Objects を使います。npm workspaces では npx が章ディレクトリで動くため `-c` で設定ファイルを指定します）。`npx wrangler deploy --dry-run -c cloudflare-agents/wrangler.jsonc` でバンドルできることを確認済みです。

## 確認方法

```bash
npm run typecheck   # 6 つのサブフォルダを型チェック
npm test            # LLM・Claude Code・Durable Objects は偽物に差し替えて実行
```
