// src/mastra/workflows/document-review-workflow.ts
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { aiReviewStep } from './steps/ai-review';

// パターン A: Step の中で Agent を呼ぶ
export const documentReviewWorkflow = createWorkflow({
  id: 'document-review',
  inputSchema: z.object({ document: z.string() }),
  outputSchema: z.object({ review: z.string(), score: z.number() }),
})
  .then(aiReviewStep)
  .commit();
