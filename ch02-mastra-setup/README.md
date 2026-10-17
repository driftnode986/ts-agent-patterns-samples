# ch02-mastra-setup

本書の「第2章 Mastra 環境構築と最初のエージェント」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd ch02-mastra-setup
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **2.3 環境変数を設定する**
  - `.env.example`
- **2.6 最初のエージェントを定義する**
  - `src/mastra/agents/index.ts`
- **2.7 Model Provider を切り替える**
  - `src/mastra/models.ts`
- **2.8 シンプルな Tool を追加する**
  - `src/mastra/tools/index.ts`
  - `src/mastra/agents/index.ts`
- **2.9 ストリーミング応答と同期応答**
  - `src/scripts/generate.ts`
  - `src/scripts/stream.ts`
  - `src/scripts/structured-output.ts`
- **2.10 Mastra インスタンスへの登録**
  - `src/steps/mastra-index.step1.ts`
- **2.11 ローカル LibSQL データベースの初期化**
  - `src/mastra/index.ts`

## 主な依存（版は package.json に固定）

- `@ai-sdk/anthropic` 4.0.82
- `@ai-sdk/google` 4.0.99
- `@ai-sdk/openai` 4.0.96
- `@mastra/core` 1.78.0
- `@mastra/libsql` 1.26.2
- `zod` 4.6.7
