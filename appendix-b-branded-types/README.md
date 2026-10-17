# appendix-b-branded-types

本書の「付録 B: TypeScript® 型でパターン安全性を保つ (Branded Types / Result)」のサンプルコードです。本に載っているコードは、すべてこのディレクトリのファイルから差し込んでいます。

## 動かし方

repo の直下で一度 `npm install` してから（npm workspaces で全章の依存が入ります）:

```bash
cd appendix-b-branded-types
npm run typecheck   # 型チェック
npm test            # テスト（偽のモデルを使うので API キー無しで通ります）
```

## 本の節とファイル

- **B.1 Branded Types で ID の取り違えを防ぐ**
  - `src/types/branded.ts`
  - `src/examples/get-memory.ts`
- **B.2 コンストラクタ関数でバリデーションと Branding を統合**
  - `src/types/constructors.ts`
- **B.3 Result 型でエラーハンドリングを型安全に**
  - `src/types/result.ts`
  - `src/lib/vector-store.ts`
  - `src/mastra/tools/search.ts`
  - `src/mastra/tools/answer-search.ts`
- **B.4 Discriminated Union で Agent の状態遷移を表現**
  - `src/types/agent-state.ts`
  - `src/mastra/workflows/approval-state.ts`
- **B.5 Template Literal Types で API パスを型安全に**
  - `src/examples/api-path.ts`
- **B.6 Phantom Types で単位の取り違えを防ぐ**
  - `src/types/units.ts`
- **B.7 Zod と Branded Types の組み合わせ**
  - `src/types/zod-branded.ts`
- **B.8 Readonly と Immutability で Agent State の不正変更を防ぐ**
  - `src/types/agent-config.ts`
- **B.9 Exhaustive Check で未処理の状態を検出**
  - `src/types/handle-agent-state.ts`

## 主な依存（版は package.json に固定）

- `zod` 4.6.7
