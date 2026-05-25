# ch02 - Mastra 環境構築

`npm create mastra@latest` からはじめて、Agent 定義、Tool 追加、Mastra Studio での対話確認、LibSQL データベース初期化まで。ローカルで Mastra が動く状態を作ります。

## 本書の該当節

- 2.1 プロジェクト作成 — `npm create mastra@latest`
- 2.2 ディレクトリ構成 — `src/mastra/` の標準レイアウト
- 2.4 mastra dev — ローカル開発サーバー起動
- 2.6 最初のエージェント — `src/mastra/agents/index.ts`
- 2.7 Model Provider 切り替え — Anthropic / OpenAI / Google
- 2.8 Tool の追加 — `src/mastra/tools/index.ts`
- 2.9 ストリーミング応答 — `agent.generate()` vs `agent.stream()`
- 2.10 Mastra インスタンス登録 — `src/mastra/index.ts`
- 2.11 LibSQL データベース — `file:./mastra.db`

## SDK バージョン

- Mastra `@mastra/core@1.35.0`

## 前提条件

- npm / pnpm / yarn
- `ANTHROPIC_API_KEY` 環境変数

## セットアップ

```bash
npm install
cp .env.example .env
# .env に ANTHROPIC_API_KEY を設定
```

## 構成

- `src/mastra/agents/index.ts` — supportAgent の定義 (instructions + model)
- `src/mastra/tools/index.ts` — weatherTool (Zod スキーマ付き)
- `src/mastra/index.ts` — Mastra インスタンス (Agent 登録 + LibSQL 接続)
- `src/scripts/chat.ts` — Agent との対話スクリプト

## 実行方法

```bash
npx vitest run ch02-mastra-setup/
npx tsx ch02-mastra-setup/src/scripts/chat.ts
```

## トピック

- `npm create mastra@latest` による scaffolding
- `src/mastra/` ディレクトリ規約 (agents/ tools/ index.ts)
- Mastra Studio (localhost:4111) でフロントエンドなしに Agent をテスト
- Agent 定義の 3 要素: id, instructions, model
- `createTool()` + Zod スキーマで型安全な Tool 定義
- `agent.generate()` (同期) vs `agent.stream()` (ストリーミング)
- LibSQL による開発用データベース初期化
