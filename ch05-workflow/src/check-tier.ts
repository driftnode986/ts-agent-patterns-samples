// src/check-tier.ts
import { RequestContext } from '@mastra/core/request-context';
import { tierWorkflow } from './mastra/workflows/tier-workflow';

export async function checkTier(userTier: string) {
  // HTTP ハンドラなどで、リクエストごとに値を詰めて run.start() に渡す
  const requestContext = new RequestContext();
  requestContext.set('user-tier', userTier);

  const run = await tierWorkflow.createRun();
  return run.start({
    inputData: { userId: 'u1' },
    requestContext,
  });
}
