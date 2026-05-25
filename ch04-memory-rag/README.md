# ch04 - Mastra Memory と RAG

Agent に記憶を持たせる 3 つの方法 (Message History / Working Memory / Semantic Recall) と、外部ドキュメントを検索する RAG パイプラインの構築。LibSQL (開発) から PostgreSQL + pgvector (本番) への移行パターンも扱います。

## 本書の該当節

- 4.1 Memory の必要性 — `src/mastra/index.ts`
- 4.2 Message History — `src/mastra/agents/support.ts`, `src/scripts/chat.ts`
- 4.3 Working Memory — テンプレートによる構造化情報の永続保持
- 4.4 バックエンド移行 — LibSQL (dev) → PostgreSQL (prod)
- 4.6 Semantic Recall — ベクトル検索による関連メッセージ取得
- 4.7 GDPR 対応 — `src/scripts/gdpr-delete.ts`
- 4.8 RAG 基礎 — `src/scripts/index-documents.ts`, `src/lib/search.ts`
- 4.9 チャンク分割 — `src/lib/chunker.ts`
- 4.10 RAG as Tool — `src/mastra/tools/search-docs.ts`, `src/mastra/agents/docs-agent.ts`
- 4.11 RAG 精度評価 — `src/scripts/eval-rag.ts`
- 4.13 Multi-tenant スコープ — `src/lib/search-tenant.ts`

## SDK バージョン

- Mastra `@mastra/core@1.35.0`
- `@mastra/memory`
- `@mastra/libsql` (開発用)
- `@mastra/pg` + pgvector (本番用)

## 前提条件

- `@mastra/memory`
- `@mastra/libsql` (開発) または `@mastra/pg` + pgvector (本番)
- `ANTHROPIC_API_KEY` 環境変数

## セットアップ

```bash
npm install
cp .env.example .env
# .env に ANTHROPIC_API_KEY を設定
```

## 構成

- `src/mastra/index.ts` — Mastra + Memory + LibSQL 設定
- `src/mastra/agents/support.ts` — Message History 付き Agent
- `src/mastra/agents/docs-agent.ts` — RAG Tool 統合 Agent
- `src/mastra/tools/search-docs.ts` — RAG 検索 Tool
- `src/lib/search.ts` — searchKnowledgeBase() ベクトル検索
- `src/lib/chunker.ts` — ドキュメントチャンク分割
- `src/lib/search-tenant.ts` — マルチテナント検索 (metadata フィルタ)
- `src/scripts/chat.ts` — Agent 対話 (threadId / resourceId)
- `src/scripts/index-documents.ts` — ドキュメント embedding + pgvector 登録
- `src/scripts/gdpr-delete.ts` — GDPR 個人データ削除
- `src/scripts/eval-rag.ts` — RAG 精度評価 (Faithfulness / Context Precision)

## 実行方法

```bash
npx vitest run ch04-memory-rag/
npx tsx ch04-memory-rag/src/scripts/chat.ts
npx tsx ch04-memory-rag/src/scripts/index-documents.ts
npx tsx ch04-memory-rag/src/scripts/eval-rag.ts
```

## トピック

- Memory の 3 種類: Message History (チャット履歴)、Working Memory (構造化情報)、Semantic Recall (ベクトル検索)
- threadId / resourceId によるセッション分離
- LibSQL (開発) → PostgreSQL + pgvector (本番) のバックエンド移行
- RAG パイプライン: Indexing → Retrieval → Generation の 3 ステップ
- ドキュメントチャンク分割とオーバーラップ戦略
- RAG as Tool パターン: Agent が検索 Tool を自律的に呼び出す
- GDPR / 個人情報削除ワークフロー
- RAG 精度評価指標 (Faithfulness, Context Precision, Context Recall)
