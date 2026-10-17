// src/inspect-run.ts
// #region imports
import { createWorkflowStateReader } from '@mastra/core/workflows';
import { mastra } from './mastra';
import { approvalStep } from './mastra/workflows/steps/approval';
// #endregion

export async function showSuspendedStep(runId: string) {
  // #region reader
  const orderWorkflow = mastra.getWorkflow('orderWorkflow');
  const state = await orderWorkflow.getWorkflowRunById(runId);
  if (state?.status === 'suspended') {
    const reader = createWorkflowStateReader(state);
    const suspendedStep = reader.getSuspendedStep();
    console.log('中断中の Step:', suspendedStep);
  }
  // #endregion
}

export async function resumeLater(runId: string) {
  // #region resume-by-id
  // 別のリクエストから、保存された run を runId で取り出して再開する
  const orderWorkflow = mastra.getWorkflow('orderWorkflow');
  const run = await orderWorkflow.createRun({ runId });
  const result = await run.resume({
    step: approvalStep,
    resumeData: { approved: true },
  });
  // #endregion
  return result;
}
