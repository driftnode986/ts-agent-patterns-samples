// src/mastra/workflows/steps/handlers.ts
import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';

// #region urgent
// .branch() の分岐先は、すべて同じ入力・出力のスキーマにする
const requestSchema = z.object({
  priority: z.enum(['high', 'medium', 'low']),
  content: z.string(),
});
const handledSchema = z.object({ message: z.string() });

export const urgentHandler = createStep({
  id: 'urgent-handler',
  inputSchema: requestSchema,
  outputSchema: handledSchema,
  execute: async ({ inputData }) => ({
    message: `至急対応: ${inputData.content}`,
  }),
});
// #endregion

export const normalHandler = createStep({
  id: 'normal-handler',
  inputSchema: requestSchema,
  outputSchema: handledSchema,
  execute: async ({ inputData }) => ({
    message: `通常対応: ${inputData.content}`,
  }),
});

export const batchHandler = createStep({
  id: 'batch-handler',
  inputSchema: requestSchema,
  outputSchema: handledSchema,
  execute: async ({ inputData }) => ({
    message: `夜間バッチで対応: ${inputData.content}`,
  }),
});

// #region format
// 分岐の後の Step は、どの分岐の出力も受けられるよう optional にする
export const formatResponse = createStep({
  id: 'format-response',
  inputSchema: z.object({
    'urgent-handler': handledSchema.optional(),
    'normal-handler': handledSchema.optional(),
    'batch-handler': handledSchema.optional(),
  }),
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => {
    const handled =
      inputData['urgent-handler'] ??
      inputData['normal-handler'] ??
      inputData['batch-handler'];
    return { result: handled?.message ?? '未処理' };
  },
});
// #endregion
