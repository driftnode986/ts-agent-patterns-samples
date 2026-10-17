import { createStep } from '@mastra/core/workflows';
import { z } from 'zod';
import { inventory } from '../../../lib/inventory';
import { paymentGateway } from '../../../lib/payment-gateway';

const orderSchema = z.object({ orderId: z.string(), amount: z.number() });
const paidSchema = z.object({ orderId: z.string(), paymentId: z.string() });

export const validateOrder = createStep({
  id: 'validate-order',
  inputSchema: orderSchema,
  outputSchema: orderSchema,
  execute: async ({ inputData }) => {
    if (inputData.amount <= 0) throw new Error('金額が不正です');
    return inputData;
  },
});

// #region process-payment
export const processPayment = createStep({
  id: 'process-payment',
  inputSchema: orderSchema,
  outputSchema: paidSchema,
  execute: async ({ inputData }) => ({
    orderId: inputData.orderId,
    paymentId: await paymentGateway.charge(inputData.amount),
  }),
});
// #endregion

// #region reserve-inventory
export const reserveInventory = createStep({
  id: 'reserve-inventory',
  inputSchema: paidSchema,
  outputSchema: paidSchema,
  execute: async ({ inputData }) => {
    await inventory.reserve(inputData.orderId);
    return inputData;
  },
});
// #endregion

export const sendConfirmation = createStep({
  id: 'send-confirmation',
  inputSchema: paidSchema,
  outputSchema: z.object({ result: z.string() }),
  execute: async ({ inputData }) => ({
    result: `注文 ${inputData.orderId} を確定しました`,
  }),
});
