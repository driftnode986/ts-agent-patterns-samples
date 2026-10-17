// src/mastra/workflows/stateful-workflow.ts
export const statefulWorkflow = createWorkflow({
  id: 'stateful',
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: z.object({ summary: z.string() }),
  stateSchema: z.object({
    processedCount: z.number().default(0),
    errors: z.array(z.string()).default([]),
  }),
})
  .then(step1)
  .then(step2)
  .commit();
