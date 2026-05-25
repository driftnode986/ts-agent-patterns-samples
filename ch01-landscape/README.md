# ch01 - TypeScript AI エージェントの 2026 年の現在地

5 つの SDK (Mastra / Vercel AI SDK / Cloudflare Agents / Claude Agent SDK / OpenAI Agents JS) の Hello World と 3 レイヤー分類で、TypeScript AI エージェントの全体像を俯瞰します。

## 本書の該当節

- 1.3 Vercel AI SDK — `src/vercel-hello.ts`
- 1.4 Mastra Framework — `src/mastra-hello.ts`
- 1.5 Cloudflare Agents — `src/cloudflare-hello.ts`
- 1.6 Claude Agent SDK / OpenAI Agents JS — `src/claude-hello.ts`, `src/openai-hello.ts`
- 1.8 5 SDK の適材適所 — 4 つのユースケース別選定ガイド
- 1.9 バージョン pin 戦略 — `package.json` の exact version pinning

## SDK バージョン

- Mastra `@mastra/core@1.35.0`
- Vercel AI SDK `@ai-sdk/anthropic@3.0+`
- Cloudflare Agents `agents@0.13.2`
- Claude Agent SDK TypeScript `v0.3.150`
- OpenAI Agents JS `v0.11.5`

## 前提条件

- Node.js v22 LTS
- TypeScript 5.8+

## セットアップ

```bash
npm install
```

## 構成

- `src/vercel-hello.ts` — Vercel AI SDK の streamText + Tool 定義
- `src/mastra-hello.ts` — Mastra Agent の最小定義
- `src/cloudflare-hello.ts` — Cloudflare Agents の onMessage + think パターン
- `src/claude-hello.ts` — Claude Agent SDK の query() 呼び出し
- `src/openai-hello.ts` — OpenAI Agents JS の RealtimeAgent 定義

## 実行方法

```bash
npx vitest run ch01-landscape/
npx tsx ch01-landscape/src/vercel-hello.ts
npx tsx ch01-landscape/src/mastra-hello.ts
npx tsx ch01-landscape/src/claude-hello.ts
npx tsx ch01-landscape/src/openai-hello.ts
```

## トピック

- Toolkit (Vercel AI SDK) / Framework (Mastra) / Runtime (Cloudflare Agents) の 3 レイヤー分類
- 各 SDK の Hello World で API 設計思想の違いを体感
- LLM プロバイダ選択と Model Router の概念
- LangGraph.js / LangChain.js を本書で扱わない理由
- 受託案件での SDK 選定根拠フォーマット (章末コラム)
- package.json での exact version pinning 戦略
