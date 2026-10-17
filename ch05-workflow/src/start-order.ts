import { mastra } from './mastra';
import { notifyApprover, notifyOncall } from './lib/notifier';

export async function startOrder(inputData: {
  orderId: string;
  amount: number;
}) {
  const run = await mastra.getWorkflow('orderWorkflow').createRun();
  // #region status
  const result = await run.start({ inputData });

  switch (result.status) {
    case 'success':
      return result.result;
    case 'suspended':
      await notifyApprover(result.suspended);
      break;
    case 'failed':
      await notifyOncall(result.error);
      break;
  }
  // #endregion
}
