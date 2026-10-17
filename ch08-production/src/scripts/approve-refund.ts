// #region start
import { mastra } from '../mastra';

const workflow = mastra.getWorkflow('approvalWorkflow');
const run = await workflow.createRun();
const first = await run.start({
  inputData: { request: '5 万円を返金して' },
});

if (first.status === 'suspended') {
  // suspend() に渡した値（理由と通知先）。これを Slack などに送る
  console.log('承認待ち:', first.suspendPayload['human-approval']);
}
// #endregion

// #region resume
// 承認の画面から戻ってきたら、runId で同じ実行を取り出して再開する
const approvedRun = await workflow.createRun({ runId: run.runId });
const resumed = await approvedRun.resume({
  step: 'human-approval',
  resumeData: { decision: 'approve' },
});

if (resumed.status === 'success') {
  console.log('結果:', resumed.result); // { approved: true }
}
// #endregion
