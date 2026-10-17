import { paymentWorkflow } from './mastra/workflows/payment-workflow';

const run = await paymentWorkflow.createRun();
const result = await run.start({
  inputData: { email: 'user@example.com', amount: 5000 },
});

if (result.status === 'success') {
  console.log('Receipt:', result.result.receiptId);
}
