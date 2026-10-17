// #region define
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { billingService } from '../../lib/billing-service';

export const createInvoiceTool = createTool({
  id: 'create-invoice',
  description:
    '顧客に対して請求書を作成します。金額と通貨を指定してください',
  inputSchema: z.object({
    customerId: z.string().describe('請求先の顧客 ID'),
    amount: z.number().positive().describe('請求金額 (正の数)'),
    currency: z.enum(['JPY', 'USD', 'EUR']).describe('通貨コード'),
    dueDate: z.string().describe('支払期日 (YYYY-MM-DD 形式)'),
  }),
  outputSchema: z.object({
    invoiceId: z.string(),
    status: z.enum(['draft', 'sent', 'paid']),
  }),
  // #endregion
  // #region execute
  execute: async (inputData) => {
    const invoice = await billingService.create({
      customerId: inputData.customerId,
      amount: inputData.amount,
      currency: inputData.currency,
      dueDate: new Date(inputData.dueDate),
    });
    return {
      invoiceId: invoice.id,
      status: invoice.status,
    };
  },
});
// #endregion
