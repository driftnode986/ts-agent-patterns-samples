import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';

// API の代わり。3 ページ分のデータを返す
const pages = [['a', 'b'], ['c', 'd'], ['e']];

const pageSchema = z.object({
  page: z.number(),
  items: z.array(z.string()),
  hasMore: z.boolean(),
});

const initializeStep = createStep({
  id: 'initialize',
  inputSchema: z.object({}),
  outputSchema: pageSchema,
  execute: async () => ({ page: 0, items: [], hasMore: true }),
});

const fetchNextPage = createStep({
  id: 'fetch-next-page',
  inputSchema: pageSchema,
  outputSchema: pageSchema,
  execute: async ({ inputData }) => {
    const fetched = pages[inputData.page] ?? [];
    const page = inputData.page + 1;
    return {
      page,
      items: [...inputData.items, ...fetched],
      hasMore: page < pages.length,
    };
  },
});

const workflow = createWorkflow({
  id: 'pagination',
  inputSchema: z.object({}),
  outputSchema: pageSchema,
});

// #region dowhile
// .dowhile: 条件が true の間、繰り返す
export const paginationWorkflow = workflow
  .then(initializeStep)
  .dowhile(
    fetchNextPage,
    async ({ inputData }) => inputData.hasMore === true
  )
  .commit();
// #endregion
