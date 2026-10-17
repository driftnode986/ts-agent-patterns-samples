import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

export const reviewRequestStep = createStep({
  id: 'review-request',
  inputSchema: z.object({ orderId: z.string() }),
  outputSchema: z.object({ approved: z.boolean(), orderId: z.string() }),
  resumeSchema: z.object({ approved: z.boolean() }),
  suspendSchema: z.object({ reason: z.string() }),
  // #region bail
  execute: async ({ inputData, resumeData, suspend, bail }) => {
    if (!resumeData) {
      await suspend({ reason: '承認待ち' });
    }
    if (resumeData?.approved === false) {
      return bail({ reason: 'ユーザーが拒否しました' });
    }
    return { approved: true, orderId: inputData.orderId };
  },
  // #endregion
});
