# ch03 - Mastra Agent + Tools + Model Router

Agent と Tool の設計パターンを深掘りします。1 Tool 1 責務、Zod スキーマによる型安全、Subagent パターン、MCP サーバー接続、Model Router によるプロバイダ切り替え、vitest でのテスト戦略まで。

## 本書の該当節

- 3.1 Agent の構成要素 — `src/mastra/agents/full-agent.ts`
- 3.2 Tool 設計原則 — `src/mastra/tools/customer.ts`
- 3.3 Zod スキーマで型固定 — `src/mastra/tools/invoice.ts`
- 3.4 Tool 内エラーハンドリング — `src/mastra/tools/database.ts`
- 3.5 複数 Tool の並列実行 — `src/mastra/agents/research-agent.ts`
- 3.6 Subagent パターン — `src/mastra/tools/delegate.ts`
- 3.7 MCP サーバー接続 — `src/mastra/mcp/client.ts`, `src/mastra/agents/github-agent.ts`
- 3.10 Token-aware routing — `src/lib/model-router.ts`
- 3.11 構造化出力 — `src/scripts/structured-example.ts`
- 3.12 Instructions テンプレート化 — `src/lib/instructions.ts`, `src/mastra/agents/tenant-agent.ts`
- 3.13 テスト — `tests/tools/customer.test.ts`, `tests/agents/support.test.ts`

## SDK バージョン

- Mastra `@mastra/core@1.35.0`

## 前提条件

- vitest
- zod
- `ANTHROPIC_API_KEY` 環境変数

## セットアップ

```bash
npm install
cp .env.example .env
# .env に ANTHROPIC_API_KEY を設定
```

## 構成

- `src/mastra/agents/full-agent.ts` — Agent 構成要素の全体像
- `src/mastra/tools/customer.ts` — getCustomerTool (1 Tool 1 責務)
- `src/mastra/tools/invoice.ts` — createInvoiceTool (Zod 入出力スキーマ)
- `src/mastra/tools/database.ts` — queryDatabaseTool (エラーハンドリング)
- `src/mastra/tools/delegate.ts` — delegateCodeReviewTool (Subagent パターン)
- `src/mastra/agents/research-agent.ts` — 複数 Tool の並列実行
- `src/mastra/agents/github-agent.ts` — MCP ツール統合 Agent
- `src/mastra/mcp/client.ts` — MCPClient 設定 (stdio / SSE)
- `src/lib/model-router.ts` — Token-aware routing (モデル動的選択)
- `src/lib/instructions.ts` — 動的 instructions テンプレート
- `src/mastra/agents/tenant-agent.ts` — マルチテナント Agent ファクトリ
- `src/scripts/structured-example.ts` — 構造化出力の実行例
- `tests/tools/customer.test.ts` — Tool 単体テスト (vitest)
- `tests/agents/support.test.ts` — Agent 統合テスト (vitest)

## 実行方法

```bash
npx vitest run ch03-agent-tools/
npx tsx ch03-agent-tools/src/scripts/structured-example.ts
```

## トピック

- 1 Tool 1 責務: Tool は単一の外部操作にマップ
- Zod スキーマで入出力を型固定 (inputSchema / outputSchema)
- Tool 内のエラーハンドリング (バリデーション失敗時のメッセージ戦略)
- Agent が複数 Tool を自動で並列実行する仕組み
- Subagent パターン: Tool から別の Agent を呼び出す委譲
- MCP サーバーを Tool として接続 (stdio / SSE)
- Model Router: Anthropic / OpenAI / Google のフォールバックと動的選択
- vitest による Tool 単体テストと Agent 統合テスト
