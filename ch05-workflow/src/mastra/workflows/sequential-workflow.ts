// src/mastra/workflows/sequential-workflow.ts
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

const textSchema = z.object({ text: z.string() });

const step1 = createStep({
  id: 'trim',
  inputSchema: textSchema,
  outputSchema: textSchema,
  execute: async ({ inputData }) => ({ text: inputData.text.trim() }),
});

const step2 = createStep({
  id: 'upper',
  inputSchema: textSchema,
  outputSchema: textSchema,
  execute: async ({ inputData }) => ({ text: inputData.text.toUpperCase() }),
});

const step3 = createStep({
  id: 'exclaim',
  inputSchema: textSchema,
  outputSchema: textSchema,
  execute: async ({ inputData }) => ({ text: `${inputData.text}!` }),
});

// #region workflow
const workflow = createWorkflow({
  id: 'sequential',
  inputSchema: textSchema,
  outputSchema: textSchema,
});
// #endregion

// #region chain
export const sequentialWorkflow = workflow
  .then(step1)
  .then(step2)
  .then(step3)
  .commit();
// #endregion
