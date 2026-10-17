// src/lib/pricing.ts
// 1M トークンあたりの料金 (USD)。執筆時の公開価格。最新は各社の料金表で確認する
// #region pricing
const PRICES: Record<string, { input: number; output: number }> = {
  'claude-sonnet-4-6': { input: 3, output: 15 },
  'claude-haiku-4-5': { input: 1, output: 5 },
};

export function calculateCost(
  model: string,
  inputTokens: number,
  outputTokens: number
): number {
  const price = PRICES[model];
  if (!price) throw new Error(`料金が未登録のモデル: ${model}`);
  return (
    (inputTokens * price.input + outputTokens * price.output) / 1_000_000
  );
}
// #endregion
