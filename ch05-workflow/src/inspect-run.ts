// src/inspect-run.ts
// #region imports
import { createWorkflowStateReader } from '@mastra/core/workflows';
import { mastra } from './mastra';
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
