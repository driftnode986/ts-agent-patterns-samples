// #region imports
import { createStep, createWorkflow } from '@mastra/core/workflows';
import { z } from 'zod';
import { paymentGateway } from '../../../lib/payment-gateway';
import {
  processPayment,
  reserveInventory,
  sendConfirmation,
  validateOrder,
} from './order-steps';
// #endregion

// #region compensate
export const compensatePayment = createStep({
  id: 'compensate-payment',
  inputSchema: z.object({ paymentId: z.string() }),
  outputSchema: z.object({ refunded: z.boolean() }),
  execute: async ({ inputData }) => {
    await paymentGateway.refund(inputData.paymentId);
    return { refunded: true };
  },
});
// #endregion

// #region saga
// Workflow 内での Saga 組み立て
export const orderSagaWorkflow = createWorkflow({
  id: 'order-saga',
  inputSchema: z.object({ orderId: z.string(), amount: z.number() }),
  outputSchema: z.object({ result: z.string() }),
  options: {
    onError: async (errorInfo) => {
      // 決済 Step が完了済みなら返金
      const payment = errorInfo.steps['process-payment'];
      if (payment?.status === 'success') {
        await paymentGateway.refund(payment.output.paymentId);
      }
    },
  },
})
  .then(validateOrder)
  .then(processPayment)
  .then(reserveInventory)
  .then(sendConfirmation)
  .commit();
// #endregion
