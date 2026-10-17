// src/mastra/workflows/steps/ai-review.ts
export const aiReviewStep = createStep({
  id: 'ai-review',
  inputSchema: z.object({ document: z.string() }),
  outputSchema: z.object({ review: z.string(), score: z.number() }),
  execute: async ({ inputData, mastra }) => {
    const reviewer = mastra.getAgent('document-reviewer');
    const response = await reviewer.generate(
      `以下の文書をレビューしてください:\n${inputData.document}`
    );
    return {
      review: response.text,
      score: 0.85,
    };
  },
});
