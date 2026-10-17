// src/mastra/workflows/routing-workflow.ts
export const routingWorkflow = createWorkflow({
  id: 'request-routing',
  inputSchema: z.object({
    priority: z.enum(['high', 'medium', 'low']),
    content: z.string(),
  }),
  outputSchema: z.object({ result: z.string() }),
})
  .branch([
    [
      async ({ inputData }) => inputData.priority === 'high',
      urgentHandler,
    ],
    [
      async ({ inputData }) => inputData.priority === 'medium',
      normalHandler,
    ],
    [
      async ({ inputData }) => inputData.priority === 'low',
      batchHandler,
    ],
  ])
  .then(formatResponse)
  .commit();
