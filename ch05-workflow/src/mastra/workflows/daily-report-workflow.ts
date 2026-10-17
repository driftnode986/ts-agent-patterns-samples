import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const buildReport = createStep({
  id: 'build-report',
  inputSchema: z.object({ reportType: z.string() }),
  outputSchema: z.object({ title: z.string() }),
  execute: async ({ inputData }) => ({
    title: `${inputData.reportType} レポート`,
  }),
});

// #region schedule
export const dailyReport = createWorkflow({
  id: 'daily-report',
  inputSchema: z.object({ reportType: z.string() }),
  outputSchema: z.object({ title: z.string() }),
  schedule: {
    cron: '0 9 * * *',
    timezone: 'Asia/Tokyo',
    inputData: { reportType: 'daily' },
  },
})
  .then(buildReport)
  .commit();
// #endregion
