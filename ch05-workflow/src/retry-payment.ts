import { mastra } from './mastra';

export async function payWithRetry() {
  // #region time-travel
  const paymentWorkflow = mastra.getWorkflow('paymentWorkflow');
  const run = await paymentWorkflow.createRun();
  const result = await run.start({
    inputData: { email: 'user@example.com', amount: 5000 },
  });

  if (result.status === 'failed') {
    // 失敗した Step から、保存済みのスナップショットを使って再実行
    const retried = await run.timeTravel({ step: 'process-payment' });
    console.log(retried.status);
  }
  // #endregion
}
