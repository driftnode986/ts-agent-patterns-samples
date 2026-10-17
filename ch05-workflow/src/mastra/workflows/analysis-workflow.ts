// src/mastra/workflows/analysis-workflow.ts
import { createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { sentimentAnalysis } from './steps/sentiment';
import { topicExtraction } from './steps/topic';
import { summaryGeneration } from './steps/summary';
import { combineResults } from './steps/combine';

export const analysisWorkflow = createWorkflow({
  id: 'content-analysis',
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ report: z.string() }),
})
  .parallel([sentimentAnalysis, topicExtraction, summaryGeneration])
  .then(combineResults)
  .commit();
