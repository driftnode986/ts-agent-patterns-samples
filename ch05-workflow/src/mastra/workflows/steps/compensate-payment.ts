// src/mastra/workflows/steps/compensate-payment.ts
export const compensatePayment = createStep({
  id: 'compensate-payment',
  inputSchema: z.object({ paymentId: z.string() }),
  outputSchema: z.object({ refunded: z.boolean() }),
  execute: async ({ inputData }) => {
    await paymentGateway.refund(inputData.paymentId);
    return { refunded: true };
  },
});

// Workflow 内での Saga 組み立て
export const orderSagaWorkflow = createWorkflow({
  id: 'order-saga',
  inputSchema: z.object({ orderId: z.string(), amount: z.number() }),
  outputSchema: z.object({ result: z.string() }),
  options: {
    onError: async (errorInfo) => {
      // 決済 Step が完了済みなら返金
      const paymentResult = errorInfo.getStepResult?.('process-payment');
      if (paymentResult?.paymentId) {
        await paymentGateway.refund(paymentResult.paymentId);
      }
    },
  },
})
  .then(validateOrder)
  .then(processPayment)
  .then(reserveInventory)
  .then(sendConfirmation)
  .commit();
