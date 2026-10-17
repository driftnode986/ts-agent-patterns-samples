// src/mastra/workflows/reminder-workflow.ts
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const sendNotification = createStep({
  id: 'send-notification',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ userId: z.string(), sentAt: z.number() }),
  execute: async ({ inputData }) => ({ ...inputData, sentAt: Date.now() }),
});

const checkResponse = createStep({
  id: 'check-response',
  inputSchema: z.object({ userId: z.string(), sentAt: z.number() }),
  outputSchema: z.object({ waitedMs: z.number() }),
  execute: async ({ inputData }) => ({
    waitedMs: Date.now() - inputData.sentAt,
  }),
});

const workflow = createWorkflow({
  id: 'reminder',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ waitedMs: z.number() }),
});

// #region sleep
export const reminderWorkflow = workflow
  .then(sendNotification)
  .sleep(3600000) // 1 時間待機
  .then(checkResponse)
  .commit();
// #endregion
