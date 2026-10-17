// src/lib/cost-cap.ts
interface CostTracker {
  dailyTokens: number;
  monthlyTokens: number;
  dailyLimit: number;
  monthlyLimit: number;
}

const tracker: CostTracker = {
  dailyTokens: 0,
  monthlyTokens: 0,
  dailyLimit: 1_000_000,
  monthlyLimit: 20_000_000,
};

export function checkCostCap(estimatedTokens: number): boolean {
  if (tracker.dailyTokens + estimatedTokens > tracker.dailyLimit) {
    console.error('Daily token limit exceeded');
    return false;
  }
  if (tracker.monthlyTokens + estimatedTokens > tracker.monthlyLimit) {
    console.error('Monthly token limit exceeded');
    return false;
  }
  return true;
}

export function recordUsage(inputTokens: number, outputTokens: number): void {
  const total = inputTokens + outputTokens;
  tracker.dailyTokens += total;
  tracker.monthlyTokens += total;
}
