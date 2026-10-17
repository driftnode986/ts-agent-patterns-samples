# ch04-memory-rag

本書の「第4章 Mastra Memory と RAG　状態保持から知識検索まで」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch04-memory-rag
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **この章で扱うバージョン (2026-10 に確認)**
  - `.env.example`
- **4.1 なぜ Agent に Memory が必要か**
  - `src/mastra/index.ts`
- **4.2 Message History　チャット履歴の保持**
  - `src/steps/support.step1.ts`
  - `src/steps/chat.step1.ts`
- **4.3 Working Memory　構造化された情報の永続保持**
  - `src/steps/memory.step1.ts`
- **4.4 Memory バックエンド　LibSQL から Postgres への移行**
  - `src/mastra/memory.dev.ts`
  - `src/mastra/memory.prod.ts`
- **4.5 Memory のスコープと書き込み戦略**
  - `src/mastra/agents/support.ts`
  - `src/scripts/chat.ts`
- **4.6 Semantic Recall　過去の会話から関連情報を検索する**
  - `src/mastra/memory.ts`
- **4.7 GDPR / 個人情報削除への対応**
  - `src/scripts/gdpr-delete.ts`
- **4.8 RAG の基礎　pgvector 連携と embedding 戦略**
  - `src/scripts/index-documents.ts`
  - `src/lib/search.ts`
- **4.9 チャンク分割とベクトル検索**
  - `src/lib/chunker.ts`
  - `src/scripts/index-chunked-documents.ts`
- **4.10 Tool として RAG を使うパターン**
  - `src/mastra/tools/search-docs.ts`
  - `src/mastra/agents/docs-agent.ts`
- **4.11 RAG の精度評価**
  - `src/scripts/eval-rag.ts`
- **4.13 Multi-tenant SaaS での document スコープ管理**
  - `src/lib/search-tenant.ts`
  - `src/scripts/index-tenant-documents.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@mastra/core` 1.78.0
- `@mastra/libsql` 1.26.2
- `@mastra/memory` 1.38.0
- `@mastra/pg` 1.31.2
- `ai` 7.0.143
- `zod` 4.6.7
