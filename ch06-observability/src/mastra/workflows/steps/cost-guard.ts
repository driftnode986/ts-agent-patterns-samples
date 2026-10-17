import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { calculateCost } from '../../../lib/pricing';

const COST_CEILING_USD = 1.0;

export const costGuard = createStep({
  id: 'cost-guard',
  inputSchema: z.object({
    totalInputTokens: z.number(),
    totalOutputTokens: z.number(),
    model: z.string(),
  }),
  outputSchema: z.object({ withinBudget: z.boolean() }),
  execute: async ({ inputData, bail }) => {
    const cost = calculateCost(
      inputData.model,
      inputData.totalInputTokens,
      inputData.totalOutputTokens
    );
    if (cost > COST_CEILING_USD) {
      return bail({
        reason: `コスト上限超過: $${cost.toFixed(2)} > $${COST_CEILING_USD}`,
      });
    }
    return { withinBudget: true };
  },
});
