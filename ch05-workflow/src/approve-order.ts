// src/approve-order.ts
import { mastra } from './mastra';
import { approvalStep } from './mastra/workflows/steps/approval';

export async function approveOrder() {
  // #region resume
  // resume にはスナップショットの保存先が要るため、Mastra に登録した
  // Workflow から実行する
  const orderWorkflow = mastra.getWorkflow('orderWorkflow');
  const run = await orderWorkflow.createRun();
  const result = await run.start({
    inputData: { orderId: 'ORD-001', amount: 50000 },
  });

  if (result.status === 'suspended') {
    // 承認 UI から resume を呼ぶ
    const resumed = await run.resume({
      step: approvalStep,
      resumeData: { approved: true, approverNote: '金額確認済' },
    });
    console.log(resumed.status); // 'success'
  }
  // #endregion
}
