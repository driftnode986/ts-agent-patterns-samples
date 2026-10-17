# ch01 - TypeScript AI エージェントの 2026 年の現在地

5 つの SDK (Mastra / Vercel AI SDK / Cloudflare Agents / Claude Agent SDK / OpenAI Agents JS) の Hello World と 3 レイヤー分類で、TypeScript AI エージェントの全体像を俯瞰します。

## 本書の該当節

- 1.3 Vercel AI SDK — `vercel-ai-sdk/src/app/api/chat/route.ts`
- 1.4 Mastra — `mastra/src/mastra/agents/index.ts`
- 1.5 Cloudflare Agents — `cloudflare-agents/src/index.ts`（`wrangler.jsonc`・`src/env.d.ts` 付き）
- 1.6 Claude Agent SDK / OpenAI Agents JS — `claude-agent-sdk/src/index.ts`, `openai-agents/src/index.ts`

SDK ごとにサブフォルダを分け、型チェックもサブフォルダごとに行います。

## SDK バージョン

- Mastra `@mastra/core@1.78.0`
- Vercel AI SDK `ai@7.0.143` / `@ai-sdk/anthropic@4.0.82`
- Cloudflare Agents `agents@0.28.1`
- Claude Agent SDK TypeScript `@anthropic-ai/claude-agent-sdk@0.3.302`
- OpenAI Agents JS `@openai/agents@0.20.0`

## 前提条件

- Node.js v22 LTS
- TypeScript 6.0

## セットアップ

repo 直下で `npm install`（npm workspaces で全章の依存が入ります）。

## 確認方法

```bash
npm run typecheck   # 5 つのサブフォルダを型チェック
npm test            # LLM・Claude Code・Durable Objects は偽物に差し替えて実行
```
