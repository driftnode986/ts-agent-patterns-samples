// src/observability/langfuse-modes.ts
// キーは LANGFUSE_PUBLIC_KEY / LANGFUSE_SECRET_KEY 環境変数から読まれる
import { LangfuseExporter } from '@mastra/langfuse';

// #region langfuse-modes
// 開発: リアルタイム (各スパンの完了直後にフラッシュ)
export const devExporter = new LangfuseExporter({ realtime: true });

// 本番: バッチ (デフォルト。512 スパンまたは 5 秒ごとにフラッシュ)
export const prodExporter = new LangfuseExporter({ realtime: false });
// #endregion
