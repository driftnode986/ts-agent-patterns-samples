// src/types/units.ts
import type { Brand } from './branded';

// #region units
export type Tokens = Brand<number, 'Tokens'>;
export type UsdCents = Brand<number, 'UsdCents'>;

export function calculateCost(
  inputTokens: Tokens,
  outputTokens: Tokens,
  pricePerMillionInput: UsdCents,
  pricePerMillionOutput: UsdCents
): UsdCents {
  const inputCost =
    (inputTokens as number) * (pricePerMillionInput as number) / 1_000_000;
  const outputCost =
    (outputTokens as number) * (pricePerMillionOutput as number) / 1_000_000;
  return (inputCost + outputCost) as unknown as UsdCents;
}
// #endregion
